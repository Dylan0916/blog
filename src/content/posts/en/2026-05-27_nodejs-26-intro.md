---
author: Dylan
pubDatetime: 2026-05-27T00:00:00Z
title: What to Know Before Upgrading to Node.js 26
postSlug: 2026-05-27_nodejs-26-intro
featured: false
draft: false
tags:
  - nodejs
  - 後端
description: Node.js 26 shipped on 2026/05/05. A few changes I found worth noting after reading the release notes, kept here as a reference for a future upgrade.
---

Node.js 26 [shipped on 2026/05/05](https://nodejs.org/en/blog/release/v26.0.0) and is currently the Current release; it's scheduled to move to LTS around October 2026.

## Temporal API on by default

This is probably the most talked-about change in Node.js 26. Using [Temporal](https://tc39.es/proposal-temporal/docs/) used to require a flag like `--harmony`; now it's available globally with no flag.

`Temporal` is meant to replace `Date`. A few of the long-standing complaints about `Date`:

- Months are zero-indexed (you think `1` is January, but it's February).
- The objects are mutable, so they get mutated by accident.
- Time-zone handling depends on the runtime's local timezone, which breaks easily across environments.

Temporal fixes all of these: immutable objects, explicit time zones, one-indexed months. If you're building scheduling, billing, or cross-timezone logic, it's worth moving over.

One caveat: Temporal is still at TC39 stage 3, so the API may still shift. For something going to production, it's worth holding off a little.

## V8 upgraded to 14.6

V8 jumps all the way to 14.6 (pulled from Chromium 146), bringing two new APIs I'm personally looking forward to:

- `Map.prototype.getOrInsert()` / `getOrInsertComputed()` — no more writing the `if (map.has(key)) ... else ...` pattern.
- `Iterator.concat()` — chains multiple iterators into one, like array `concat` but for iterators.

`getOrInsert` especially: previously you'd either wrap your own helper or lean on `??=`, and now it's built in.

## Undici upgraded to 8

Node.js's built-in `fetch` is backed by [Undici](https://github.com/nodejs/undici), now bumped to 8.0.2 — mostly closer alignment with the WHATWG Fetch spec, plus changes to streaming and connection pooling.

For everyday `fetch` calls the API is unchanged, so there's nothing to do.

## A few removals

Things to watch for before upgrading:

- `http.Server.prototype.writeHeader()` — use `writeHead()` instead.
- The legacy modules `_stream_wrap`, `_stream_readable`, `_stream_writable`, `_stream_duplex`, `_stream_transform`, `_stream_passthrough` are all removed.
- The `--experimental-transform-types` flag is gone (the experimental flag for running TypeScript).

Also, `module.register()` is now a runtime deprecation — it still works but logs a warning, so it's worth replacing when you get a chance.

Build requirements went up too: GCC 13.2+, Python 3.9 no longer supported, Windows SDK 11. Worth noting if you build Node yourself.

## Upgrade steps

Going from Node 22 / 24 to 26, here's what I'd do:

1. Switch locally and run the tests, looking for any `_stream_*` or `writeHeader()` calls.
2. Watch the console for new deprecation warnings, especially `module.register()`.
3. If there's any date/time logic, take the chance to evaluate migrating to Temporal.
4. Bump the CI build image to GCC 13.2+.

For actual production I'd wait until it becomes LTS in October; for now it's fine to try in a dev environment.

One side note: per the [official announcement](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule), Node.js 26 is the last release on the old cycle. From v27 on it changes to "one major every April, LTS in October, with no more skipped odd-numbered versions." I'll write that up once I actually run into it.

## Closing

This is mainly a record of the Node.js 26 changes I found relevant, so I don't have to re-read the release notes next time I upgrade.

For day-to-day development the most noticeable are Temporal and `Map.getOrInsert`; the rest is mostly internal optimization and legacy cleanup. I'll add a migration write-up once a project actually moves over.
