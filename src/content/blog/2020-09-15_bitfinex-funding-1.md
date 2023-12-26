---
author: Dylan
pubDatetime: 2020-09-15T16:03:09.076Z
title: 打造自己的 Bitfinex 放貸機器人 (1)
postSlug: 2020-09-15_bitfinex-funding-1
tags:
  - Nodejs
  - Bitfinex
  - Websocket
  - Sockets
description: 前言
ogImage: /fromMediumImg/1__JZi__bnHGmG79f__MSNghBIw.jpeg
---

![](/fromMediumImg/1__JZi__bnHGmG79f__MSNghBIw.jpeg)

#### 前言

差不多在去年的這個時候，看到了班神的「[用 300 萬本金創造每月 6 萬的被動收入 — — Bitfinex 出借美元全攻略教學](https://medium.com/@bensonsun/%E7%94%A8-300-%E8%90%AC%E6%9C%AC%E9%87%91%E5%89%B5%E9%80%A0%E6%AF%8F%E6%9C%88-6-%E8%90%AC%E7%9A%84%E8%A2%AB%E5%8B%95%E6%94%B6%E5%85%A5-bitfinex-%E5%87%BA%E5%80%9F%E7%BE%8E%E5%85%83%E5%85%A8%E6%94%BB%E7%95%A5%E6%95%99%E5%AD%B8-47634cc54fbf)」的這篇文，當時覺得挺有趣的，也聽區塊鏈不少次了，想說藉此機會玩玩看好了，就打了些錢進去。  
在玩了一段時間發現風險還挺 ok 的，即使今年 312 事件，Bitfinex 也沒發生什麼事，我想近 3~5 年應該還挺穩的。

想知道放貸是什麼，建議去看班神的那篇文，他才是專業的。  
而班神的那篇文推薦的機器人是 Fuly，一開始也試用了一下，後來想說既然也身為工程師，為何不自己做一個呢? 於是就開始研究 Bitfinex 提供的 API 了。  
在接下來的文章，我會使用 NodeJS 來實作後端的部分，因筆者只是個初心前端，故 nodejs 的部分只能做完成需求而已，若有更棒更有效率的寫法，還請不吝指教了。

#### 序

在接下來的篇幅中，我會介紹:

1.  取得當前 XXX 幣的放貸利率。
2.  取得自己錢包的各幣種金額。
3.  利用 API 做出放貸動作。
4.  取得今日所賺利息。
5.  取得待出借的列表。
6.  取得已被借出的列表。
7.  將上述第四點做成排程，達到自動化。

#### 初入 Bitfinex API

要做到放貸，還是得要有個 Bitfinex 帳號，可以使用我的[推薦碼連結](https://www.bitfinex.com/?refcode=IKcmqSRy)進行註冊，或使用班神他文中提供的也可以。

接下來就直接到 [Bitfinex api 文件](https://docs.bitfinex.com/docs)，Bitfinex 有提供 RESTful 與 websocket 的方式，我們兩個都會用到，像是要知道當前利率，就得用 socket 不斷接收資料，但若是做放貸行為，直接打一般 api 就行了。  
RESTful 與 websocket 都各有分為 public 與 authenticate 的，會需要身份的都屬於後者。

因需在 nodejs 中使用 websocket，故先將 [ws](https://www.npmjs.com/package/ws) 裝起來:

```bash
$ yarn add ws
```

一開始我們先做取得某某貨幣當前放貸利率，因要一直監聽最新利率，故使用 socket 的方式，而這種不需要身份，所以他被歸為 [public](https://docs.bitfinex.com/docs/ws-public)。

Bitfinex public socket 上限為每分鐘 20 個連接，所以若你沒斷開前一個，就開了下一個連接，達到上限後就什麼資料都收不到了，剛開始我一直碰到上限，當時還不知道為何會這樣…  
使用 socket 的話，就得選擇要訂閱的頻道，Bitfinex 提供的頻道不算太多，這邊我們直接跳到[相關說明文件](https://docs.bitfinex.com/reference#ws-public-trades)。

![](/fromMediumImg/1__hZmG0LX1UntdU5mZa5__LSw.png)

Bitfinex 的 pub socket 頻道為「wss://api-pub.bitfinex.com/ws/2」，故上圖中的第二行為建立此連接。  
接下來訂閱的頻道都會是 trades，透過發生的放貸交易來得出目前放貸利率，其他頻道我是沒訂閱過啦，讀者可自己嘗試看看。  
而 symbol 的部分為要訂閱的幣種，這邊我們先選 USD，而 USD 前面的 f 為 funding 的縮寫，Bitfinex 的放貸都屬 funding，故若要改看 BTC，則改為 fBTC。

將上圖程式碼片段儲存起來，並用 node 直接執行，會看到一堆數字:

![](/fromMediumImg/1__2Mdsd39MePAXT1yIFYgJ__Q.png)

Bitfinex 麻煩的地方在這，他會將資料全部丟進 array 中，然後文件內再來說明索引值多少的內容為什麼，個人認為挺麻煩的...  
上圖這樣的格式太難看懂了，我們改一下程式碼，將 message callback 中的 msg 用 JSON.parse 解析一下:

```javascript
w.on("message", msg => {
  const parse = JSON.parse(msg);

  console.log(parse);
});
```

再次執行:

![](/fromMediumImg/1__nTm36fAilb__9HQHy1pVELQ.png)

前兩項 object 先忽略，重點在第三項的 array，我們鎖定在 `[ 173621141, 1600182091685, 53.94, 0.00032789, 2]` 這筆交易，翻譯成人話為:  
`[ channel ID, 交易 ID, 出價與提供量, 日利率 (數字需再乘上 100), 借貸天數]`

再來若我們想知道不只 USD 一個幣種的放貸利率的話，需對 socket 多 send 一段信息，code 大概是這樣:

![](/fromMediumImg/1__C0UF8oMBiL__D64SB3dNe1Q.png)

將要訂閱的幣種放在一個陣列中，再用迴圈來 send message，程式碼滿好理解的。  
但這邊遇到些問題，再首次執行時能夠看出哪段信息是哪個幣種的，但在接下來收到的交易信息，就看不出到底誰是誰了，所以我們需整理一下，這時候就得用上剛剛說先忽略的 object。

![](/fromMediumImg/1__Qot5UpFOmCkxhOtPbhhW6g.png)

這邊可以看到，只要狀態是 subscribed 的，都會配有 chanId 與 symbol，後來的交易信息也都會有 chanId，這樣我們就能知道這是哪個幣種的了，  
故在收到 chanId 與 symbol 時，得將他們的配對保存起來，後面收到信息時來配對。  
最後程式碼會是這樣:

在 10 ~ 12 行中，將 chanId 與 symbol 做配對；14 ~ 20 行做篩選取得利率；22 行內就拿到 symbol 對應的利率了，這邊就能做進一步操作，看要保存在哪裡之類的。  
而上段程式碼執行下去後會看到利率與 symbol 對應好好的:

![](/fromMediumImg/1____pHLgSIHM9LffZJqgb8K__g.png)

#### 小節

這篇先介紹如何透過 Bitfinex 的 websocket 取得放貸的交易紀錄，從中獲得當前的放貸利率。  
我自己在取得這些利率後，是保存在一個變數中，然後在 server 端再建一個 websocket，前端接上這個 socket，一段時間就將這些利率丟到前端，前端整理後顯示這樣。

在接下來的文章中，我會將此篇開頭的「序」依序講完，但實在太忙了，想到才會寫... 希望我不會富堅。
