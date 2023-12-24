---
author: Dylan
pubDatetime: '2021-12-05T06:09:09.727Z'
title: 來做個靜態地圖產生器吧 (三) | API 加上金鑰吧
postSlug: 2021-12-05_gen-static-google-map-3--api-key
tags:
  - Aws Lambda Functions
  - Lambda Edge
  - Axios
  - Fetch
  - Api Key
description: '這篇是地圖系列的第三篇，若你還沒看過前兩篇的，可透過下方連結抵達:'
---

![](/fromMediumImg/1__ceb__FiEkHePAqH1k0PZicA.png)

這篇是地圖系列的第三篇，若你還沒看過前兩篇的，可透過下方連結抵達:

[**來做個靜態地圖產生器吧 (一) | Serverless**](/posts/2021-12-03_gen-static-google-map-1--serverless)

[**來做個靜態地圖產生器吧 (二) | 使用 OAI 訪問 S3 bucket**](/posts/2021-12-05_gen-static-google-map-2--oai-s3-bucket)

在上一篇中，我們完成了 S3 的私有訪問權，透過 OAI 限制存取權，不讓隨便一個人都能從裡面拿到圖片。  
目前還剩一些問題，例如產圖的 API 與 Cloudfront 都沒添加金鑰，這樣隨便一個人都能拿去產生任一地圖。

該篇將會補足這些問題，雖不會到非常完美，但能多一道牆總不是壞事。

### 為 API Gateway 添加金鑰

在 EdgeLambda 觸發地圖產生器 (另一個 Lambda) 是透過一個 API URL，這隻 API 完全是開放的，代表誰都可以呼叫到，並且產生地圖，這樣很容易把我們資源吃爆，需上把鑰匙。

上鑰匙方式有很多種，這邊介紹的是在 API Gateway 這加上金鑰，發 request 者需在 headers 中帶上 `x-api-key` 才能訪問成功，否則會得到 403。

首先，到 API Gateway，點進先前創建的，左側清單往下滑，找到「API 金鑰」。

![](/fromMediumImg/1__Ioq__pzW3ginmnr866yXkjQ.png)

接著建立金鑰，名稱取一個自己能識別的，接著按儲存。

![](/fromMediumImg/1__5qhszk8Qw__VO8jBzgMtFTg.png)
![](/fromMediumImg/1__jy8XUbsL6V__OrwWKSqVv__Q.png)

接著要將 API 綁上這個金鑰，在此之前需要新增「用量計畫」，位置一樣在剛剛進到「API 金鑰」的左側清單中，用量計畫在 API 金鑰上方，

直接建立用量計畫，名稱一樣輸入自己能識別的，下方的「調節」與「配額」可以依自己需求調整，DEMO 這先不勾，按下一步。

![](/fromMediumImg/1__8QmdncMrn2YpQolO2XN__vg.png)

到這一步就可以關聯 API 了，選擇先前建立的，按下勾勾後，就可以按下一步了。

![](/fromMediumImg/1__6hJoyd__eEyytLmBUatugkA.png)
![](/fromMediumImg/1__D3fQe2rYphpStYKIKaK3kw.png)

這一步，要選擇先前建立的 API 金鑰，添加完後按下完成。

![](/fromMediumImg/1__A6eLN0u0SU__1rs__uxg6HZQ.png)
![](/fromMediumImg/1__szYJUxGojbfbIZQaXpJ3Gw.png)

接著，我們要將 API Key 加到 EdgeLambda 中，回到剛新增的 API 金鑰，點擊 API 金鑰右側的「顯示」，複製它。

![](/fromMediumImg/1__QhRc4qDuY5uU2OkV5skK2A.png)

複製完後，回到 EdgeLambda，要將此 key 添加到 request headers 中，名為 `x-api-key`。

Code 大概這樣:

const https = require("https");

function fetchData(url) {  
  const parsedUrl = new URL(url);  
  const options = {  
    host: parsedUrl.host,  
    path: parsedUrl.pathname + parsedUrl.search,  
    headers: {  
      "x-api-key": "your key",  
    },  
  };

  return new Promise((resolve, reject) => {  
    https  
      .get(options, (res) => {  
        let body = "";

        res.on("data", (chunk) => {  
          body += chunk.toString();  
        });

        res.on("end", () => {  
          resolve(body);  
        });  
      })  
      .on("error", reject);  
  });  
}

此時可以測試看看，若 `x-api-key` 沒帶或帶錯是否會得到 403，若為 403 則代表設定成功了。

### Cloudfront 也上道鎖吧

目前還有個隱憂問題，若其他人拿了 Cloudfront 網址，在哪發 request 都是會過的，故也要防止這塊。

採取方式是檢查 request headers 中是否有指定的鑰匙，這裡姑且叫 `x-dylan` 好了，值先設 `test`，然後在 EdgeLambda 檢查該鑰匙是否存在，不存在則直接回傳 403 狀態碼，code 如下:

const { request, response } = event.Records\[0\].cf;  
const { headers } = request;  
const xDylan = headers?.\['x-dylan'\]\[0\].value;

if (xDylan !== "test") {  
  response.body = JSON.stringify({ msg: "403" });  
  response.status = "403";

  return response;  
}

這樣沒帶鑰匙的人，在程式中滿上面就被判定完了，也不會走到產生地圖的地方。

現在回到 client 的程式，因要在 request headers 中帶上值，故原本直接在 `<img />` tag 的 src 上放 URL 方式得換掉，改用 XHR 方式，使用 blob ，再轉成 DOMString 來顯示圖片。

*   若使用 JS 原生的 `fetch`，拿到 response 後，使用 `response.blob()`。
*   若使用 `axios`，則 config 需添加 `responseType: "blob"`。

headers 帶上鑰匙後，試著發 request 看看，會發現 console 出現一個錯誤信息:

> Access to XMLHttpRequest at ‘https://xxx/yyy.png' from origin ‘http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn’t pass access control check: No ‘Access-Control-Allow-Origin’ header is present on the requested resource.

主要是跟 CORS 有關，且也有 preflight request，為何會有這問題呢? 原因是只要 request 符合下列之一，即會有 preflight request:

*   method 非 `GET`, `POST`, `HEAD`。
*   包含自訂的 headers。
*   `Content-Type`非 `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`。

且發現 server 那的 response header 中並未添加 `Access-Control-Allow-Origin`，才會被阻擋，詳細可看 Huli 大的 [CORS 系列文](https://blog.huli.tw/2021/02/19/cors-guide-1/)。

為解決這問題，我們需在 Cloudfront 添加一些重要的 response headers。  
首先，進到先前建立的 Cloudfront function，點進「行為」->「編輯」。

![](/fromMediumImg/1__qd7MRrHRsEfK3JxmcMDJ__g.png)

往下滑，開啟允許 OPTIONS HTTP method

![](/fromMediumImg/1__xPuLKxM6tOS1lhaCpxpLIg.png)

再往下滑，點擊回應標頭政策 (response headers policy) 的建立政策

![](/fromMediumImg/1__9KsnBdrfdjyqvYmBvHtg__w.png)

名稱一樣輸入自己可辨識的，然後打開「設定 CORS」，將「Access-Control-Allow-Headers」選擇「Customize」，填上自己的鑰匙名稱，這邊若選擇 All headers 依然有問題，沒深追為何。  
滑到底按完成即可。

![](/fromMediumImg/1__LN9RJBe5F3o1PGIDl7HY0Q.png)

回到 Cloudfront 編輯行為那，點擊 response headers policy 右側的重整按鈕，接著下拉選單找到自己剛新增的政策。  
往下滑按下儲存，等待 Cloudfront 部屬完成。

![](/fromMediumImg/1__gEWJXhwSm7j25l6Itl9p0A.png)
![](/fromMediumImg/1__bhLr8t70HsDeoLJiIs6YXg.png)

部屬完後，再試著發 request 看看，會發現錯誤訊息變了:

> Access to XMLHttpRequest at ‘https://xxx/yyy.png' from origin ‘http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn’t pass access control check: It does not have HTTP ok status.

preflight request 沒有 HTTP status code? 這裡意思是即使剛剛添加允許 OPTIONS method，但要怎麼回應還是得自己控制。

所以我們得回到 EdgeLambda，去對 `OPTIONS` 的 method 做處理。  
將以下 code 放到最優先判斷位置:

const { request, response } = event.Records\[0\].cf;  
const { method } = request;

if (/OPTIONS/i.test(method)) {  
  response.status = "200";

  return response;  
}

目前先判斷只要是 `OPTIONS` 則一律回 200，可根據自己需求做調整，提升嚴謹性。

記得 Deploy 後部屬到 Lambda@Edge。

這邊有個狀況，每當我們部屬 EdgeLambda 後，Cloudfront 行為中的 response headers policy 都需重選:

![](/fromMediumImg/1__W2V__Rt4vr7Z__cjv15F4Rfw.png)

設定完後，等待 Cloudfront 部屬完，再次發 request 試試，會發現 CORS 問題修復了，但卻得到 403 status code，這是為何?  
原因是我們是對 Cloudfront 發 request，當 request 經過 Cloudfront 後，並不會將我們帶的 headers 往後傳，故當到 EdgeLambda 時，我們帶的鑰匙已經掉了，需在 Cloudfront 的 request policy 做一些處理才行。

首先，到 Cloudfront 行為中的「來源請求政策」，選擇「建立政策」:

![](/fromMediumImg/1__7k__PDyFTMQON9hIkZP09qg.png)

名稱一樣輸入自己能辨識的，標頭 (headers) 選擇「包含下列標頭」->「新增自訂」，輸入自己的鑰匙名稱，之後往下滑按下建立。

![](/fromMediumImg/1__0FLq7RktJFVMw10myJjjAw.png)

回到 Cloudfront，一樣按下右側的重整鈕，下拉選單找到剛建立的，之後儲存等待 Cloudfront 部屬完。

![](/fromMediumImg/1__TTNfmseRuFoi89Kui__i6gQ.png)

這時再到瀏覽器發一次 request，此時地圖就順利出現了。

### 結

今天我們幫建立好的 API Gateway 添加金鑰，避免任何知道 URL 的人都可以發 request，必需帶關鍵鑰匙才會過。  
以及在 EdgeLambda 中也加上鑰匙需求，沒帶或值不正確者也會被擋下，不會被當作地圖產生器。

在 response headers policy 那，也可以針對 Origin 做設定，僅支援你的網站來的 request，但這僅能防止從 browser 來的。

這系列文僅這三篇了，本來這篇會與第三篇合一，後來發現篇幅越來越長，就拆開了。  
感謝看到這的讀者。