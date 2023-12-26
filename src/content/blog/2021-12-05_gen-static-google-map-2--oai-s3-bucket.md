---
author: Dylan
pubDatetime: 2021-12-05T04:38:54.712Z
title: 來做個靜態地圖產生器吧 (二) | 使用 OAI 訪問 S3 bucket
postSlug: 2021-12-05_gen-static-google-map-2--oai-s3-bucket
tags:
  - S3 Bucket
  - Aws Cloudfront
  - Aws Policies
  - Aws Oai
  - Origin Access Identity
description: "若你還沒看過第一篇的，可透過下方連結抵達:"
ogImage: /fromMediumImg/0__8TMW9P1HCspWgiFq.jpg
---

![](/fromMediumImg/0__8TMW9P1HCspWgiFq.jpg)

若你還沒看過第一篇的，可透過下方連結抵達:

[**來做個靜態地圖產生器吧 (一) | Serverless**](/posts/2021-12-03_gen-static-google-map-1--serverless)

在上一篇中，我們完成了地圖產生器的基本功能，但有些細節沒有顧到，例如產圖的 API 與 Cloudfront 都沒添加金鑰，這樣隨便一個人都能拿去產生任一地圖。  
以及 S3 的訪問權，目前是全開的，故隨便一個人都能從裡面拿到圖片。

該篇將會將封鎖 S3 的公開取權，改用 OAI 來訪問。

### Cloudfront 搭配 OAI 訪問 S3 bucket

先前為方便寫功能，故將 bucket 設為全公開的，這樣會造成任何人都可以拿到你 bucket 的內容。  
為避免這狀況，我們要封鎖 bucket 的公有存取權:

![](/fromMediumImg/1__TNONi__ZD5hhfu8nL7z2nGA.png)

接著，為方便測試，我們先清除 Cloudfront 的快取。  
首先點進「無效判定」->「建立無效判定」，在輸入框中輸入「`/*`」代表要清除根目錄下的所有，接著按下建立，等待它跑完即可。

![](/fromMediumImg/1__tGHzuzSyOk2SJvxdytWSzQ.png)
![](/fromMediumImg/1__MCQvq3nYRlpe3QQfgkmKpQ.png)

此時你會發現 client 那邊發出的 request 皆為 403，代表無權訪問，我們需額外設定一條路讓它能拿到資料。

我們可以透過 OAI (Origin Access Identity) 來達到需求，詳細可參考[官方文件](https://docs.aws.amazon.com/zh_tw/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)說明。

首先，我們先到先前建立好的 Cloudfront 分佈，點進「來源」->「選擇來源」->「編輯」

![](/fromMediumImg/1__sTC8NtQFhz6OovZ2rLqEvQ.png)

在「S3 儲存貯體存取」選擇使用 OAI 的選項，此時下方會多一個下拉選單，當前是空的，可以點選右側的「建立新的 OAI」來建立，名稱我取為「google-static-map-OAI」。  
接著下方的貯體政策選項，選擇更新貯體政策的選項，這裡意思是 S3 bucket 的一個 policy 的 JSON，若選擇「否」的話，那邊的 JSON 就得自己輸入。

選完「是」之後，滑到底按下儲存即可。

![](/fromMediumImg/1__bf9TuarPSy0pXZYqiBwvbw.png)

接著到 S3 的 bucket，點進「許可」，往下滑找到「儲存貯體政策」，會看到已被更新了:

![](/fromMediumImg/1__NL6s7OV2pb9usrE1f72kuw.png)

這時 client 發出的 request 就會 200 了，但發現怎麼換個新的地址又會 403 了?

主要是剛剛在 bucket 設定的 policy 的關係，我們僅設定 `GetObject`，並無權知道 bucket 內有什麼，故當訪問一個不存在的檔案時，並不會直接告訴你它不存在 (404)，而是覺得你在做一個不允許的事 (403)。

那要怎麼修復呢? 關於這問題，在 [Stackoverflow](https://stackoverflow.com/a/19038017/9636125) 上有找到相關答案，只要在剛剛的 policy JSON 中的 `Action` 中添加 `s3:ListBucket`，以及 `Resource` 中添加 `arn:aws:s3:::your_bucket_name` 即可:

![](/fromMediumImg/1__aTHUIC9sqIh77CcTWz6cOQ.png)

這時不管是新的地址還是舊的地址，皆能拿到正常的 response 了!

### 小結

這篇我們彌補了之前為測試方便，將 bucket 設為全公開的問題，透過 bucket policy JSON 來控制這個 OAI 能做到哪些事情。

當初在弄這個 policy JSON 時，只添加 `GetObject`，想說為何試著拿不存在的檔案會是 403 而不是 404，後來才發現權限細分成這樣。

下篇將會補上這兩個問題:

1.  API Gateway 添加金鑰，否則任何知道 API URL 的人都能呼叫得到。
2.  在 EdgeLambda 添加鑰匙，不讓該 Cloudfront 被當圖床。
