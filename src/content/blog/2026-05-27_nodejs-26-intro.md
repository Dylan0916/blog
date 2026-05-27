---
author: Dylan
pubDatetime: 2026-05-27T00:00:00Z
title: 升上 Node.js 26 之前該知道的事
postSlug: 2026-05-27_nodejs-26-intro
featured: false
draft: false
tags:
  - nodejs
  - 後端
description: Node.js 26 在 2026/05/05 釋出了，這篇紀錄一下筆者看完官方 release note 後，覺得比較有感的幾個變化，當作未來升級時的參考。
---

Node.js 26 在 [2026/05/05 釋出](https://nodejs.org/en/blog/release/v26.0.0)了，目前是 Current 版本，預計 2026 年 10 月會進入 LTS。

## Temporal API 預設開啟

這應該是 Node.js 26 最受關注的變化，過去要用 [Temporal](https://tc39.es/proposal-temporal/docs/) 得加 `--harmony` 之類的 flag，現在直接全域可用。

`Temporal` 是用來取代 `Date` 的。`Date` 幾個被罵很久的點：

- 月份從 0 開始算（你以為 1 是一月，結果是二月）。
- 物件是 mutable 的，一不小心就被改到。
- 時區處理依賴 runtime 的 local timezone，跨環境很容易出包。

Temporal 把這些都修掉了：immutable、時區要明確指定、月份從 1 開始。要做排程、帳務、跨時區計算的功能，是該換過去了。

不過要注意，目前 Temporal 在 TC39 還是 stage 3，API 還可能會微調，正式 production 要用的話可以再觀望一下。

## V8 升級到 14.6

這次 V8 一路升到 14.6（從 Chromium 146 取的），帶來兩個筆者自己很期待的新 API：

- `Map.prototype.getOrInsert()` / `getOrInsertComputed()` — 終於不用寫 `if (map.has(key)) ... else ...` 這種 pattern。
- `Iterator.concat()` — 把多個 iterator 串成一個，類似 array 的 `concat` 但給 iterator 用。

特別是 `getOrInsert`，過去要嘛自己包 helper、要嘛硬用 `??=`，這次直接內建解決。

## Undici 升級到 8

Node.js 內建的 `fetch` 底層就是 [Undici](https://github.com/nodejs/undici)，這次升到 8.0.2，主要是跟 WHATWG Fetch spec 對齊、streaming 跟 connection pool 也有改動。

對日常呼叫 `fetch` 的 code 來說 API 沒什麼變，不用特別改。

## 一些移除掉的東西

升級前要特別注意：

- `http.Server.prototype.writeHeader()` — 改用 `writeHead()`。
- `_stream_wrap`、`_stream_readable`、`_stream_writable`、`_stream_duplex`、`_stream_transform`、`_stream_passthrough` 這些 legacy module 全部移除。
- `--experimental-transform-types` flag 拔掉（這是之前跑 TypeScript 的實驗 flag）。

另外 `module.register()` 變成 runtime deprecation，雖然還能用但會噴 warning，要找時間換掉。

Build 環境要求也提高了：GCC 13.2 以上、Python 3.9 不再支援、Windows SDK 要 11。自己 build Node 的話要注意一下。

## 升級步驟

從 Node 22 / 24 升到 26 筆者自己會這樣做：

1. 本地切過去跑一次測試，看有沒有 `_stream_*` 或 `writeHeader()` 的 call。
2. 看 console 有沒有新的 deprecation warning，特別是 `module.register()`。
3. 有用到時間處理的邏輯，順便評估要不要遷移 Temporal。
4. CI build image 要更新到 GCC 13.2+。

正式上 production 筆者自己會等到 10 月轉 LTS 之後再說，目前可以先在 dev 環境跑跑看。

順帶提一下，根據 [官方公告](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule)，Node.js 26 是最後一個走舊 release cycle 的版本，從 v27 開始改成「每年 4 月發一個 major、10 月轉 LTS，不再有 odd 號版本被跳過」。之後等實際遇到再來寫一篇。

## 結

這篇主要是紀錄 Node.js 26 筆者覺得有感的幾個變化，讓筆者之後升級時不用再重看一次 release note。

對日常開發來說最有感的應該是 Temporal 跟 `Map.getOrInsert`，其他大部分是內部優化跟 legacy 收尾。等手上專案實際升上去之後再來補一篇遷移紀錄。
