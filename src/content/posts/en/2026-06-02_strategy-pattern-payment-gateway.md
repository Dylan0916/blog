---
author: Dylan
pubDatetime: 2026-06-02T09:30:00.000Z
title: Collapsing Multi-Gateway Payment if-else with the Strategy Pattern
postSlug: 2026-06-02_strategy-pattern-payment-gateway
tags:
  - Design Pattern
  - Strategy Pattern
  - Typescript
  - Refactor
description: "Wiring up several payment gateways with if-else gets longer and harder to maintain over time — notes on collapsing it with the Strategy Pattern plus a registry, leaving before/after hooks for each gateway to customize."
draft: false
---

A recent project needed to integrate three payment gateways at once — ECPay, Stripe, and LINE Pay. The natural first cut was a single `createPayment` that dispatched with `if (provider === ...)`:

```typescript
async function createPayment(provider: string, order: Order) {
  if (provider === "ecpay") {
    const res = await ecpayCharge(order);
    if (res.code === 0) {
      await markOrderPaid(order);
      track("payment_success", { provider });
    } else if (res.code === 10) {
      redirectTo(res.redirectUrl);
    } else {
      showError();
    }
  } else if (provider === "stripe") {
    const res = await stripeCharge(order);
    // ...nearly the same three branches: success, needs redirect, failure
  } else if (provider === "linepay") {
    // ...copy it again
  }
}
```

The only differences between the three are "which API to call" and "how to handle failure", yet the skeleton — checking whether the code means success / needs verification / failed — gets recopied for each one. Worse, the refund path `refundPayment` is the same shape all over again, and adding a fourth gateway means going back to edit this already-long function.

This is the textbook case for the Strategy Pattern: **pull the behavior that varies into interchangeable strategies, and write the fixed flow only once.**

## Pull the differences into a provider

First, define the interface each gateway must implement. The parts that vary — the API, the custom behavior, the error handling — all collapse into here:

```typescript
interface PaymentResult {
  code: number;
}

interface PaymentContext {
  order: Order;
  returnUrl?: string;
}

interface PaymentProvider {
  id: PaymentType;

  charge: (order: Order) => Promise<PaymentResult>;
  refund: (order: Order) => Promise<PaymentResult>;

  // Custom hooks "before / after" the shared finalize flow
  beforeSuccess?: (ctx: PaymentContext) => void | Promise<void>;
  afterSuccess?: (ctx: PaymentContext) => void | Promise<void>;

  // Extra side-effect per gateway when a redirect to verification is needed
  onNeedRedirect?: (ctx: PaymentContext, result: PaymentResult) => void;
  // Failure handling (ECPay shows an error, LINE Pay redirects back to returnUrl…)
  onError: (ctx: PaymentContext, error: unknown) => void;
}
```

`beforeSuccess` / `afterSuccess` are the key to this design: the shared skeleton opens a hook on each side of "payment succeeded", so a given gateway can slot in its own logic without touching the skeleton.

## Replace if-else dispatch with a registry

Next, swap the dispatch from `if-else` to a lookup table:

```typescript
type PaymentType = "ecpay" | "stripe" | "linepay";

const paymentProviders: Record<PaymentType, () => PaymentProvider> = {
  ecpay: createEcpayProvider,
  stripe: createStripeProvider,
  linepay: createLinePayProvider,
};
```

Two details worth calling out.

First, the type is `Record<PaymentType, ...>`. If you later add a `"paypal"` to `PaymentType` but forget to register a provider in this table, TypeScript fails to compile — a missing implementation gets caught for you.

Second, the table stores `() => PaymentProvider` factory functions, not ready-made instances. Each provider often needs its own client, config, or an injected store at construction time, so it has to be built lazily, when it's actually used, to capture the right context. Building them up front and stuffing them into the map would initialize them at the wrong time.

## Write the shared skeleton once

With the interface and registry in place, the skeleton is a thin layer:

```typescript
const PaymentCode = { SUCCESS: 0, NEEDS_REDIRECT: 10 } as const;

function usePayment() {
  const finalizeSuccess = async (
    provider: PaymentProvider,
    ctx: PaymentContext
  ) => {
    await provider.beforeSuccess?.(ctx);
    await markOrderPaid(ctx.order); // shared finalize: update order, notify, log
    await provider.afterSuccess?.(ctx);
  };

  const chargeWith = async (type: PaymentType, ctx: PaymentContext) => {
    const provider = paymentProviders[type]();

    try {
      const result = await provider.charge(ctx.order);

      if (result.code === PaymentCode.SUCCESS) {
        await finalizeSuccess(provider, ctx);
        return;
      }

      if (result.code === PaymentCode.NEEDS_REDIRECT) {
        // a redirect to the payment page is always needed; the skeleton handles it
        goToPaymentPage(result);
        provider.onNeedRedirect?.(ctx, result);
        return;
      }

      provider.onError(ctx, result);
    } catch (error) {
      provider.onError(ctx, error);
    }
  };

  return { chargeWith };
}
```

The refund path reuses the same skeleton — swap `provider.charge` for `provider.refund` — so I won't paste it again.

Note the `NEEDS_REDIRECT` branch. All three gateways have to redirect to the payment page when "3D verification is needed"; that's the shared part, and a provider only patches in its own extra action through `onNeedRedirect` (LINE Pay, for instance, has to store a transaction id first). Shared logic lives in the skeleton, differences stay in the hook — and a newly integrated gateway can't forget the redirect step.

## An easy thing to get wrong: don't throw business codes as exceptions

In the code above, an unhandled code is dispatched with `provider.onError(ctx, result)` rather than `throw result` into the `catch`. The latter would also work, but I deliberately don't write it that way.

`result` is a `{ code }` response object, not an `Error`. Throwing a non-Error value gives you no stack trace, and eslint's `only-throw-error` rule flags it. More importantly, it's about semantics: a failure code from the backend is an **expected** business outcome; `charge()` actually blowing up (network down, JSON parse failure, and so on) is an **unexpected** exception. Handle both in the same `catch` and the reader can no longer tell which is which.

> Reserve `throw` for "the program broke"; dispatch business-code failures with an ordinary function call. Control flow shouldn't run on exceptions.

## Wrap-up

Adding a fourth gateway becomes: add a value to `PaymentType`, add one line to the registry, write one `createPaypalProvider`. The skeleton and the call sites don't change a single line — which is exactly the "open for extension, closed for modification" that the Open-Closed Principle is after.

The cost is one more layer of indirection: reading the code means one extra hop. If your case will only ever have two variants and definitely won't grow, plain `if-else` reads better — don't reach for a pattern for its own sake. The point at which I pull out the Strategy Pattern is when "the same skeleton has been copied a third time" or "it's predictable that more will be added".
