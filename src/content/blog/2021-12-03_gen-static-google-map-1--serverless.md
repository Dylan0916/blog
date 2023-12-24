---
author: Dylan
pubDatetime: '2021-12-03T09:49:47.537Z'
title: 來做個靜態地圖產生器吧 (一) | Serverless
postSlug: 2021-12-03_gen-static-google-map-1--serverless
tags:
  - Aws Cloudfront
  - Google Map Api
  - AWS Lambda
  - S3 Bucket
  - Serverless
description: >-
  最近在公司專案上完成了一個我認為挺有趣的功能，在公司購物車頁填寫超商取貨資料的地方加上靜態地圖，封面圖就是完成後的樣子。你可能會想問為何是靜態地圖?
  其他網站的地圖都是可拖動的，為何要靜態的? 主要是靜態地圖相對便宜，就選擇它了。
---

![](/fromMediumImg/1__6ufHr4gA8clnVPe2EKhNoA.png)

最近在公司專案上完成了一個我認為挺有趣的功能，在公司購物車頁填寫超商取貨資料的地方加上靜態地圖，封面圖就是完成後的樣子。  
你可能會想問為何是靜態地圖? 其他網站的地圖都是可拖動的，為何要靜態的? 主要是靜態地圖[相對便宜](https://mapsplatform.google.com/pricing/)，就選擇它了。

而因地圖的 API 有金鑰，故不能直接在寫在前端，鑰匙被拿走遲早被打爆，但又不想花到後端資源，這時候 AWS 上的幾個服務就滿適合的。

此篇就來記錄我是如何完成這項功能，以及我認為我學到了什麼，篇幅可能兩篇吧，也可能這篇就講完了。  
文章內不會詳細記錄 code 怎麼寫的，只會說明邏輯的走法，主要是細節有點雜，且 Medium 的 markdown 實在有點鳥…  
在 AWS 上將會使用到 API Gateway、Cloudfront、EdgeLambda、Lambda 與 S3。

那就開始吧!

### Google Static Map API

可以在[官方文件](https://developers.google.com/maps/documentation/maps-static/overview)看到地圖的 API，其中 key 的部分需填上自己的，若還沒有 key 則可以照著官方介紹去申請。  
以我公司地址為例，將 API 的一些參數填上後會像這樣:

https://maps.googleapis.com/maps/api/staticmap?center=台北市中山區中山北路三段47號&zoom=13&size=600x300&key=YOUR\_API\_KEY

`center` 滿直覺的，地圖中心點，其他還有挺多參數可以設定，例如封面圖的 711 icon 是額外添加上去的 [markers](https://developers.google.com/maps/documentation/maps-static/start#Markers)。

現在可以順利透過 Static Map 的 API 拿到一張靜態圖，但如同開頭說的，網址裡有鑰匙的部份，需額外處理。

### 使用 Cloudfront + EdgeLambda 來取得圖片吧!

在說明如何產生圖片前，我們先決定之後要透過什麼方式來取得圖片。

關於此需求，希望用戶在選好任一超商店家時，地圖圖片能馬上出現，第一個想到的就是 CDN，雖然第一個選擇到該店家的用戶依然要等地圖產生出來，但之後下個選到該店家的就能馬上出現了。

Cloudfront 的 origin 我們接 S3，圖片將會存在這，當用戶訪問任一超商店家時，Cloudfront 若沒快取，會往 S3 (origin) 拿，但若 S3 沒圖片怎麼辦? 此時我們需要在 Cloudfront 與 S3 傳遞間做一些事，類似攔截器，可以轉變 request / response，詳細可以看我主管 - Bingo 寫的[相關文章](https://medium.com/verybuy-dev/prerender-in-the-cloud-683ce4b927f2)。

![](/fromMediumImg/1__2fXYwlWNsH9trjNPdXa4rw.png)

關係圖大概是這樣，當用戶向 Cloudfront 發 request 時，若 Cloudfront 有快取則會直接回傳 response，反之則會往後走向 origin 訪問，之後把結果回傳給 Cloudfront，可能為找得到 (200)，或找不到 (404)，Cloudfront 再傳回給用戶。

以我們的需求來說，我們要在 S3 到 Cloudfront 的 response 上掛個攔截器，當沒圖片時做產生圖片的動作。

此攔截器稱為 EdgeLambda，可從[官方介紹](https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-edge.html)來得知更多，以及[如何添加](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works.html)與實現。

該 EdgeLambda 做的事滿單純的，在 response (S3 的回應) 的 `status` 為 404 時做產生地圖，而因 EdgeLambda 限制挺多的，例如無法加 layers，這對於發 request 非常不方便 (筆者認為 nodejs 內建的 http 非常難用)，故我們要到一般的 lambda 上做處理 。

S3 的部份可以先完全公開，方便 Cloudfront 存取，之後會再額外介紹 OAI (Origin Access Identity) 來限制它。

![](/fromMediumImg/1__ge5P4gB__fCSXwpnCpQQGig.png)

### 使用 API Gateway + Lambda 來產生地圖

上章節提到產圖的 Lambda 需額外寫，這章節將會介紹。

Lambda 的部份會使用 Nodejs 來寫，不熟悉 API Gateway + Lambda 的讀者可以先試試[官方提供的教學](https://docs.aws.amazon.com/zh_tw/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)。

新增一個 Lambda function 來做產生地圖的工作，發 request 者會將地址資訊一併帶過來，例如這樣:

https://xxx?fileName=台北市中山區中山北路三段47號麥田門市.png

可能放在 uri、也可能在 query string 中，看怎麼設計。

之後將拿到的地址去打 Google Static Map API 來產生圖片，若使用 `axios` 來發 request，那 `responseType` 得填 `arraybuffer`，因要取得檔案內容。  
再來將該圖片存進 S3，為了讓當 Cloudfront 沒快取時可以直接到 S3 拿，不必再次產圖，之後做一些 base64 的處理後回傳即可。

這邊需注意幾件事:

1.  axios 非 nodejs 內建的，需額外用 layers 來[添加](https://stackoverflow.com/questions/48356841/how-can-i-use-axios-in-lambda/68608384#68608384)。
2.  Lambda 有提供環境變數，可以將 Google API Key 放在那。

API Gateway 的地方新增一個 REST API，接到剛剛建立的 Lambda function。

### 取得產生好的圖片

上章節完成後，我們有了一個可以產生靜態地圖的 API，EdgeLambda 直接呼叫就好。

到這邊已經拿到產生的圖片內容了，剩下在 response 中加入適當的內容就可以回傳給 Cloudfront 了，差不多這樣:

```javascript
response.body = {圖片內容};  
response.headers["content-type"] = [  
  {  
    key: "Content-Type",  
    value: "image/png",  
  },  
];  
response.bodyEncoding = "base64";  
response.status = "200";
```

因產生圖片的 Lambda 傳回來的圖為 base64 字串，故 `bodyEncoding` 需告知編碼方式 -> base64。

到這邊就已經完成最基本內容了，可以直接在 `<img />` tag 的 `src` 上放上如下的網址，圖片就能顯示了

[https://{Cloudfront](https://%7Bcloudfront) URL}/台北市中山區中山北路三段47號麥田門市.png

### 小結

此篇簡單的說明從 client 呼叫 Cloudfront URL，到 EdgeLambda 處理 S3 的 response，到 Lambda 產生靜態地圖，再到將圖傳回給 client。

一開始做這些時，EdgeLambda 與一般的 Lambda 之間的呼叫有點小複雜，但習慣後覺得還不算難理解。

下篇將會補上一些安全性問題，例如:

1.  如何把 S3 設為 private，讓指定的 Cloudfront 才拿得到資料。
2.  API Gateway 添加金鑰，否則任何知道 API URL 的人都能呼叫得到。
3.  在 EdgeLambda 添加鑰匙，不讓該 Cloudfront 被當圖床。