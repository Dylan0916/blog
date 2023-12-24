---
author: Dylan
pubDatetime: '2023-08-22T11:43:01.075Z'
title: 淺談 HTTPS 的 TLS 四次握手
postSlug: 2023-08-22_https-tls-handshake
tags:
  - SSL Handshake
  - Https
description: 此篇單純紀錄 HTTPS 的 TLS 4 次揮手過程，因每次讀到相關文章時，總覺得少講了什麼，所以只好自己記錄一篇。
ogImage: /fromMediumImg/1__i__HjA5P3Anoaxmc__Jajp__Q.png
---

![](/fromMediumImg/1__i__HjA5P3Anoaxmc__Jajp__Q.png)

此篇單純紀錄 HTTPS 的 TLS 4 次揮手過程，因每次讀到相關文章時，總覺得少講了什麼，所以只好自己記錄一篇。

此篇並不會講到 HTTP 的 3 次握手以及 4 次揮手，相關文章太多了。

TLS 通訊中，一開始使用非對稱加密方式，而非對稱加密的速度比對稱加密還慢，但對稱加密的安全性又相對低，所以有人想出先使用非對稱加密，後再使用對稱加密，流程如下：

1.  當 client 端訪問一個 server 時，會先生成一個隨機數，稱為 random1，將 random1 發送到 server 端，並且告知 server 端它支援的加密方式。
2.  server 端收到 client 端的隨機數 (random1)，也生成一個隨機數，稱為 random2，並將 random2 + 加密方式 (從剛剛 client 端發送支援的加密方式中選出) + CA 證書 (含公鑰) 發送至 client 端它支援的加密方式。
3.  client 端驗證 CA 證書是否有效 (包含發放日期、到期時間、頒發機構等資訊)，若無效，則警示訪問者，並讓訪問者決定是否繼續訪問；若有效，則再生成一個隨機數，稱為 pre-master，並利用公鑰 (從 server 傳的 CA 證書中取出) 將其加密，傳送至 server 端。
4.  client 端再利用剛剛 server 傳的加密方式，將 random1 + random2 + pre-master 加密，生成 master-secret，以用於後續通訊的加密。
5.  server 端利用自己的私鑰解開，得到 pre-master，也利用一樣的加密方式將 random1 + random2 + pre-master 加密，生成 master-secret。
6.  client 與 server 皆使用該 master-secret 加密的資料來進行通信，稱為對稱式加密。

![](/fromMediumImg/1__zklPcmdbmRRgFU3wrmpwvA.png)

#### 結語

此篇並沒有講到非常詳細，像是 CA 如何驗證有效性之類的都沒提到，因網上已經很多資料在講解這塊。

若是有哪個節點與讀者的理解有出入，還請告知，謝謝