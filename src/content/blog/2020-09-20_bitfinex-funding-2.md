---
author: Dylan
pubDatetime: '2020-09-20T14:44:07.185Z'
title: 打造自己的 Bitfinex 放貸機器人 (2)
postSlug: 2020-09-20_bitfinex-funding-2
tags:
  - Websocket
  - Bitfinex
  - Nodejs
  - Blockchain
description: '系列中的第二篇，第一篇放在下方:'
ogImage: /fromMediumImg/1__tjHdURlqCYjYJS__QWODqug.png
---

![](/fromMediumImg/1__tjHdURlqCYjYJS__QWODqug.png)

系列中的第二篇，第一篇放在下方:

[**打造自己的 Bitfinex 放貸機器人 (1)**](/posts/2020-09-15_bitfinex-funding-1)

一開始還是先說下這系列會介紹的東西:

1.  [取得當前 XXX 幣的放貸利率。](/posts/2020-09-15_bitfinex-funding-1)
2.  取得自己錢包的各幣種金額。
3.  利用 API 做出放貸動作。
4.  取得今日所賺利息。
5.  取得待出借的列表。
6.  取得已被借出的列表。
7.  將上述第四點做成排程，達到自動化。

這篇為第二篇:「取得自己錢包的各幣種金額」

#### 申請 Bitfinex API key

上篇介紹的取得當前利率屬於 public api，而從今天開始介紹的都是屬於需 auth 身份的，而會看到此篇文章的人，我相信都是已辦了 Bitfinex 帳號的人，而要使用 Binfinex auth 功能，就得申請 API key。

首先先到 Binfinex 的「[Create New Key](https://www.bitfinex.com/api#new-key)」，將需開啟的功能打開，如下:

![](/fromMediumImg/1__IpeoXy32pz9hLjxvkmqRNQ.png)

共有四個需開啟，其餘開啟的話，會提高你帳戶的風險。  
這邊需注意的是「Generate API key」左側的輸入框，此部分不能是中文，所以直接輸入自己看得懂的英文就好 (不能用全形英文)。

按下 generate 後會收到一封確認信，成功創建的話會看到此畫面:

![](/fromMediumImg/1__QcWl2w__y5JcwvTjAZRM5xw.png)

這樣就成功申請了。

#### 取得錢包資訊

首先，一樣到 [Bifinex 的 api 文件](https://docs.bitfinex.com/reference#ws-auth-account-info)查看 auth 的 websocket，可以看到比 public 的設定還要多，不過文件上說明的還算清楚。  
將程式碼改成以下樣子:

這邊需注意的地方是「apiKey」與「apiSecret」，將這兩個變數填入上面剛申請的 API key 值。  
以及 payload 中的 filter 陣列，因此篇介紹的是查看自己錢包，故這邊為「wallet」，若想知道這陣列還可以填什麼的，可以查看[這篇說明](https://docs.bitfinex.com/docs/ws-auth#channel-filters)，在之後的更多功能介紹中，會回來更改這個 filter array。

現在我們執行這隻檔案，成功的話會看到自己的錢包資訊，這邊會看到有「ws」、「wu」的，ws 為錢包整體狀況；wu 為錢包更新時的當下狀態。可在[此連結](https://docs.bitfinex.com/reference#ws-auth-wallets)下方表格中的 TYPE 查看說明。  
這邊我們只看 wu 就好，在錢包有任何更新時都會收到信息，例如收到利息、借錢人還款之類的。我將執行後的其中一項資訊來說明:

![](/fromMediumImg/1__g6Y4DQKMZPh__0wh0HeKt__g.png)

翻譯成人話為: \[channel ID, 事件型別, \[錢包型別, 幣別, 總金額, 未結利息, 閒置金額\]\] 後面兩個 null 就不管它了。  
需注意的是「錢包型別」，會有 exchange、margin、與 funding，因我們只要看放貸的，所以鎖定 funding 就好。  
這邊說明一下「閒置金額」是什麼，假設你的總金額為 $103，閒置金額為 $3，意思是已有 $100 借給別人，剩餘 $3。

整理一下上述所提到的資訊:

1.  只要事件型別為 wu 的。
2.  只要錢包型別為 funding 的。
3.  只要總金額與閒置金額。

將程式整理一下後，得到:

因 response 會有一些我們用不到的資訊，所以一開始判斷 response 是否為陣列，再來將 wu 與 funding 篩選出來，整理一下所要資訊，就得到 code 中「data」那樣了。  
將上面 code 執行後能看到這樣的畫面:

![](/fromMediumImg/1__WvYs2Q15MlnyNtujnhQGgg.png)

若執行下去能夠看到差不多的畫面，就代表成功了。

#### 小結

今天介紹了 Bitfinex 的 authenticate websocket，因是 auth 的關係，所以需要申請一組 API key，申請成功後就能做一些比較私有的操作，利用此來獲取自己的錢包資訊。

筆者拿到這些資訊的處理與前一篇一樣，存進一個變數中，一段時間發送到前端去，讓前端顯示在畫面上。

感謝看到此的各位，下篇見。