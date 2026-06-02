---
author: Dylan
pubDatetime: 2026-06-02T09:30:00.000Z
title: 用策略模式收斂多家金流的 if-else
postSlug: 2026-06-02_strategy-pattern-payment-gateway
tags:
  - Design Pattern
  - Strategy Pattern
  - Typescript
  - Refactor
description: "接多家金流時 if-else 分派會越長越難維護，紀錄怎麼用策略模式加 registry 收斂，並留 before/after hook 給各家客製。"
draft: false
---

最近專案要同時接綠界、Stripe、LINE Pay 三家金流，一開始很自然地寫成一個 `createPayment`，裡面用 `if (provider === ...)` 分派：

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
    // ...幾乎一樣的三段：成功、需要跳轉驗證、失敗
  } else if (provider === "linepay") {
    // ...再抄一份
  }
}
```

三家的差別只有「呼叫哪支 API」和「失敗怎麼處理」，但骨架（判斷 code 是否成功 / 是否需驗證 / 失敗）每家都重抄一次。更痛的是退款 `refundPayment` 又是同一個 shape 再來一輪，而接第四家金流時，要回頭改這支已經很長的 function。

這就是策略模式（Strategy Pattern）的標準場景：**把會變的行為抽成可替換的策略，固定的流程只寫一次。**

## 把差異抽成 provider

先定義每家金流要實作的介面。會變的部分，例如：API、客製行為、錯誤處理全部收斂在這裡：

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

  // 共用收尾流程「之前 / 之後」客製塞行為
  beforeSuccess?: (ctx: PaymentContext) => void | Promise<void>;
  afterSuccess?: (ctx: PaymentContext) => void | Promise<void>;

  // 需要跳轉驗證頁時，各家額外的 side-effect
  onNeedRedirect?: (ctx: PaymentContext, result: PaymentResult) => void;
  // 失敗處理（綠界要顯示錯誤、LINE Pay 要導回 returnUrl…）
  onError: (ctx: PaymentContext, error: unknown) => void;
}
```

`beforeSuccess` / `afterSuccess` 是這個設計的關鍵：共用骨架在「付款成功」前後各開一個掛點，讓某家金流可以塞自己的邏輯，而不用去改骨架。

## 用 registry 取代 if-else 分派

接著把分派從 `if-else` 換成一張對照表：

```typescript
type PaymentType = "ecpay" | "stripe" | "linepay";

const paymentProviders: Record<PaymentType, () => PaymentProvider> = {
  ecpay: createEcpayProvider,
  stripe: createStripeProvider,
  linepay: createLinePayProvider,
};
```

兩個細節值得講。

第一，型別用 `Record<PaymentType, ...>`。日後在 `PaymentType` 多加一個 `"paypal"`，但忘了在這張表補對應 provider，TypeScript 會直接編譯不過，漏實作會被擋下來。

第二，表裡存的是 `() => PaymentProvider` 工廠函式，不是建好的 instance。因為每家 provider 在建構時往往要各自的 client、設定、或注入當下的 store，必須延遲到真正要用時才建立，才拿得到正確的 context。預先 `new` 好塞進 map 反而會在錯的時機初始化。

## 共用骨架只寫一次

有了介面和 registry，骨架就只剩薄薄一層：

```typescript
const PaymentCode = { SUCCESS: 0, NEEDS_REDIRECT: 10 } as const;

function usePayment() {
  const finalizeSuccess = async (
    provider: PaymentProvider,
    ctx: PaymentContext
  ) => {
    await provider.beforeSuccess?.(ctx);
    await markOrderPaid(ctx.order); // 共用收尾：更新訂單、發通知、記 log
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
        // 需要驗證一律導向付款頁，骨架統一處理
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

退款用同一套骨架，把 `provider.charge` 換成 `provider.refund` 即可，這裡不再貼。

注意 `NEEDS_REDIRECT` 那段。三家金流在「需要 3D 驗證」時，都得導去付款頁，這是流程的共同處，provider 只透過 `onNeedRedirect` 補各自多出來的動作（例如 LINE Pay 要先存 transaction id）。共用的放骨架、差異的留 hook，新接的金流就不可能漏掉導向這一步。

## 一個容易寫錯的地方：別把 business code 當例外丟

上面 unhandled code 是用 `provider.onError(ctx, result)` 分派，而不是 `throw result` 丟進 `catch`。後者也能跑，但筆者刻意不這樣寫。

`result` 是一個 `{ code }` 回應物件，不是 `Error`。`throw` 一個非 Error 的值沒有 stack trace，而且 eslint 的 `only-throw-error` 會擋。更重要的是語意：後端回一個失敗 code 是**預期內**的業務結果；`charge()` 真的爆掉（網路斷、JSON parse 失敗等）才是**預期外**的例外。兩者混在同一個 `catch` 處理，讀的人就分不清哪個是哪個。

> 留給 `throw` 的是「程式壞掉」，業務 code 失敗用一般的 function call 分派。control flow 不靠 exception。

## 結

接第四家金流時，做的事變成：`PaymentType` 加一個值、registry 補一行、寫一個 `createPaypalProvider`。骨架和呼叫端一行都不用動，這就是 Open-Closed Principle 想要的「對擴充開放、對修改封閉」。

代價是多了一層 indirection，讀 code 要多跳一次。如果你的場景永遠只有兩種、而且確定不會再長，那直接 `if-else` 反而更好讀，不用為了模式而模式。筆者會掏出策略模式的判斷點，是「同樣的骨架已經抄第三遍」或「可預期之後還會再加」的時候。
