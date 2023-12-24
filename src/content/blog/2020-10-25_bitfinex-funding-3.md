---
author: Dylan
pubDatetime: '2020-10-25T13:12:11.391Z'
title: 打造自己的 Bitfinex 放貸機器人 (3)
postSlug: 2020-10-25_bitfinex-funding-3
tags:
  - Bitfinex
  - Blockchain
  - Funding
  - JavaScript
  - Nodejs
description: 最近真的太多事了，沒想到第三篇拖了一個月才寫…
---

![](/fromMediumImg/1__zoZASHGYl2PLyZhv0EWqHQ.jpeg)

最近真的太多事了，沒想到第三篇拖了一個月才寫…

這篇是系列中的第三篇，一樣在開頭處附上這系列要講的順序，已寫的就附上超連結:

1.  [取得當前 XXX 幣的放貸利率。](/posts/2020-09-15_bitfinex-funding-1)
2.  [取得自己錢包的各幣種金額。](/posts/2020-09-20_bitfinex-funding-2)
3.  利用 API 做出放貸動作。
4.  取得今日所賺利息。
5.  取得待出借的列表。
6.  取得已被借出的列表。
7.  將上述第四點做成排程，達到自動化。

### Authenticated API

終於到了把錢借出去的階段了，還沒入金的讀者再自行入金喔，因 Bitfinex 限制每次出借最低為 50 美金。

一樣先到 Bitfinex 的 [Api docs](https://docs.bitfinex.com/docs/rest-auth)，這篇要用的是他的 REST Api，直接將範例程式碼複製並貼到檔案上，將 apiKey 與 apiSecret 改成[第二篇](/posts/2020-09-20_bitfinex-funding-2)介紹時，所申請的 API key，這邊官方範例用的 api request 工具為「request」故需額外裝起來，若讀者習慣用 axios 或其他的也是沒問題的。

```bash
$ yarn add request
```

安裝好後直接執行，依官方的範例 code，可以看到你的錢包資訊:

上面程式碼能順利執行的話，我們直接進入本篇的主題，借款。

### Submit Funding

參考[官方 Submit Funding Offer 文件](https://docs.bitfinex.com/reference#rest-auth-submit-funding-offer)，可以看到需要將 apiPath 改為 「v2/auth/w/funding/offer/submit」，並且還要帶入應有 request body，  
下方以文件給的 request body 來說明:

```
body: {
  type: 'LIMIT',
  symbol: 'fUSD',
  amount: '123.45',
  rate: '0.001',
  period: 2,
  flags: 0
}
```

官方這邊有個滿雷的地方，在「type: ‘LIMIT’ 」這邊，官方的 LIMIT 前有個空白，那邊得刪掉，不然執行下去會得到 500 status code。

上面 code 的意思是借出 123.45 的 USD，開頭 f 為 funding 的意思，且以年化 36.5% 借出兩天，這邊得自己算一下，若要以年化 20%，則為 20 / 365 / 100 = 0.0005479452，  
而 flags 為進階功能，筆者目前沒用到，有興趣的可以自己去[文件](https://docs.bitfinex.com/docs/flag-values)看一下。

將 apiPath 與 request body 填進檔案中後，得到:

改好 code 後直接執行，能看到 Bitfinex 的 funding 有一筆正在提供中，等著別人借走:

![](/fromMediumImg/1__pU__rXQ3Y2suJZVw4Que99g.png)

#### 小結

今天介紹如何透過 Bitfinex 提供的 Api 進行放貸的動作，但這邊也只是將單子掛出去，也要等有人借走才算真正借出，而關鍵在你提供的利率以及天數是否符合他人需求，像筆者此時當下 USD 的 APR 為 8.8% 左右，故我放出 36% 的單是不可能有人接走的。

這時候就可以配合前幾天學到的，拿當下的成交利率來設為出借利率，不過很有可能會放出相對較低的成交利率，故筆者的機器人會儲存半小時內的最高成交利率，在進行放貸時就拿這個利率。

這篇的部份就到這了，下次來講借出後，如何拿到每天的利息數額。