---
author: Dylan
pubDatetime: '2021-09-29T16:48:49.772Z'
title: 使用 lambda + firebase dynamic links 打造自己的動態連結產生器
postSlug: 2021-09-29_using-lambda-firebase-gen-dynamic-links
tags:
  - Firebase dynamic links
  - Aws S3
  - AWS Lambda
  - Aws Api Gateway
  - Deeplink
description: >-
  近期工作有個需求要在商品頁上放個按鈕，按下按鈕後，若有安裝 App 則觸發 deep link 到達該頁，若沒安裝則開啟 App store /
  Google play。
---

![](/fromMediumImg/1__S__pXIJIdzORFYgfVX__UN8Q.png)

近期工作有個需求要在商品頁上放個按鈕，按下按鈕後，若有安裝 App 則觸發 deep link 到達該頁，若沒安裝則開啟 App store / Google play。

翻了一下網上資料，大都是先開啟 scheme URL，數秒後再到 App store / Google play。  
以 momo 為例，在點擊指定的按鈕時會先打開 scheme URL，若我有安裝 App 到還好，會直接開啟 App，但若沒，瀏覽器則無法處理這連結:

![](/fromMediumImg/1__mh9FMBNbH12c__JCzl3pL2A.jpeg)

這樣的體驗非常差，正常用戶不會知道目前什麼狀況。  
雖也有不讓此 alert 出現的方法，但僅限部份瀏覽器，且依然要等數秒後才會到 App store / Google play，用戶不會在點擊當下立即得到反饋。

在主管引導 firebase dynamic links 可以解決此狀況後，決定去研究了一下，發現真的是個很厲害、很有趣的東西。

此篇接下來會介紹:

*   如何在 firebase 上建立第一個 dynamic link。
*   如何透過一隻 REST API 來產生一個 dynamic link。
*   如何將已產生的 link 存起來，再次呼叫時拿到一樣的 link。

### 在 firebase 上建立 dynamic links

這邊筆者先假設讀者都已建立好 firebase 帳號了。

首先，先到 firebase [控制台](https://console.firebase.google.com/)，左側滾到最底後點擊「Dynamic Links」，後在點擊「開始使用」:

![](/fromMediumImg/1__bvizp9skEYftIVMhQMeLJw.png)

輸入你要的網址，建議以 Google 提供的 domain 來建立，若要客製，還得處理 DNS 的部份。

建立完後點擊「新增動態連結」:

![](/fromMediumImg/1__LBhRLSFqAf5YpfvRiS2bZQ.png)

第一步是產生的短網址，這邊也可以自訂內容，好了後按下一步。

第二步則是在「深層連結網址」填寫當開啟第一步的網址時，要去哪裡；「動態連結名稱」則是在看分析時，此連結的名稱。

我以 Verybuy 網址為例，大概會這樣:

![](/fromMediumImg/1__dgaYF3tc66oT__Jm1JmL6Hg.png)

接下來第三步與第四步是設定 iOS 與 Android 要以什麼方式開啟此連結，筆者 demo 帳號沒與 App 連結，故只能選在瀏覽器開啟。

第五步的廣告活動追蹤是用在在社群貼上該短網址時，會顯示什麼樣，例如這樣填之後放到 FB，效果如下:

![](/fromMediumImg/1__sNRChfEA6Y8t1sv6s11WuQ.png)
![](/fromMediumImg/1__stwQpguDfqpI42fQNYrfMw.png)

UTM 則是在成效追蹤上滿好用的，建議還是填一下。

最後「建立」後就可拿到一個短網址了，打開後會導到先前所填的。

![](/fromMediumImg/1__mTiI5FlCviNHPZYv1bNJnw.png)

### 使用 AWS API gateway + lambda 來產生連結

在 firebase 後台來產生 link 滿方便的，但缺點就是必須先知道該短網址要打開的完整連結，若是動態連結則無法這樣操作，例如文章開頭所提到的商品頁，數量太多。  
此時可以用程式來解決掉這個問題，可以在進入商品頁時，打一隻 API，並帶上該頁的網址，該 API 就會回短網址來。

為了達到這個需求，我們需要使用 AWS 的 API gateway 與 lambda，API gateway 負責提供 API URL，lambda 則提供 serverless function，可以直接在上面寫程式。  
下面我們將使用 nodejs 來撰寫，不熟悉的讀者可以先試試[官方提供的教學](https://docs.aws.amazon.com/zh_tw/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)。

Firebase [提供](https://firebase.google.com/docs/dynamic-links/rest)使用 REST API 方式來建立 dynamic links，我們可以使用 POST 方式來戳這隻 API

https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=api\_key

其中，`api_key` 在 Firebase 後台的專案設定 -> 一般設定 -> 網路 API 金鑰:

![](/fromMediumImg/1__x79wPOfgd8WVtfUxhbwajg.png)
![](/fromMediumImg/1__A__PC2LxjMF2XSqTsYY4hFQ.png)
![](/fromMediumImg/1__Eq3hNI2wBhIfHEa7scEo1Q.png)

若發現你的「網路 API 金鑰」是空的，那得先到左側列表的「Authentication」來進行登入

![](/fromMediumImg/1__Eq3hNI2wBhIfHEa7scEo1Q.png)

若只是單純要產生短網址，則 data (payload) 可以這樣帶:

{

  "dynamicLinkInfo": {

    "domainUriPrefix": "https://xxx.page.link",

    "link": "https://www.google.com/"

  }

}

`domainUriPrefix` 為你剛剛在 Firebase 後台產生的短網址前綴。  
`link` 為此短網址要去的地方。

若有 App，並且想在有安裝 App 時，以 deep link 方式開啟的話，可以這樣帶:

{

  "dynamicLinkInfo": {

    "domainUriPrefix": "https://xxx.page.link",

    "link": "https://www.google.com/"

  },

  "androidInfo": {

    "androidPackageName": "package name"

  },

  "iosInfo": {

    "iosBundleId": "bundle ID"

  }

}

JSON 更詳細內容可以到他的[文件](https://firebase.google.com/docs/reference/dynamic-links/link-shortener)查看。

接下來我們到 [lambda](https://aws.amazon.com/tw/lambda/) 開始寫程式，建立函式時，選擇從頭開始撰寫，函式名稱取個自己能識別的就好，這邊筆者先用 `dynamicLinksTest`，執行角色選擇「建立具備基本 Lambda 許可的新角色」，並記得建立的角色名稱，稍後會用到。

![](/fromMediumImg/1__EYc7dwjaT8qNNFpSaCwUxQ.png)

需求是可以藉由 request 的資訊中，拿到目的地連結，故決定在 query string 中加個值: `link`。  
發 API 的庫，這邊使用 `[axios](https://github.com/axios/axios)`，因 `axios` 屬第三方，在 lambda 中需額外添加，可以參考[這個](https://stackoverflow.com/a/68608384/9636125)來做設定。  
若嫌麻煩的讀者，也可以使用 nodejs 自帶的 `https`，因筆者覺得太難用了，才用 `axios`。

dynamic links 的 API 發出後，會得到一個含有 `shortLink` 與 `previewLink` 的 object，這邊我們只需要 `shortLink`。  
因之後要用瀏覽器來戳，故會有 CORS 的問題，簡單填寫 response headers。  
最後再將此連結放進 lambda 要回傳的 response 之中，寫下來大概這樣:

完成後按下「Deploy」。再來我們可以使用 lambda 提供的 Test 來進行測試:

![](/fromMediumImg/1__FlVlzXiOlEnUAutERR__8Tw.png)

在 `queryStringParameters` 中帶上 `link`，命名完事件名稱後建立

![](/fromMediumImg/1__hf9JmXb0kwcKCQ62suWtHw.png)

之後就可以使用此事件來進行測試，記得確保在測試前已 deploy，否則變化的 code 在測試中是吃不到的。

![](/fromMediumImg/1__WAdTeCk47j0n1Vd8vLWU__w.png)

進行測試後，若看到回應 200，並且 `body` 中有連結，代表剛剛的程式皆正常運作

![](/fromMediumImg/1__6393rcCZx4gRBwJ4LqpypA.png)

lambda 的部份到這邊就完成了，接下來要到 API gateway 來產生一個 API 連結，並接到此 lambda function。

切到 [API Gateway](https://aws.amazon.com/tw/api-gateway/)，建立 REST API，簡單命名一下

![](/fromMediumImg/1__EsEK71vZeEpHh__zuBr2__xw.png)

建立 GET 方法

![](/fromMediumImg/1__k__moJ__jZD8Y__ZCppXwECzA.png)

「整合類型」選擇 Lambda 函數，並將「**使用 Lambda 代理整合**」勾選，函數填上剛剛的 lambda function 名稱:

![](/fromMediumImg/1__6Y__q2cWZ__SzWc774wv__Ehw.png)

這邊一樣需處理 CORS 問題，在操作處選擇啟用 CORS，allow-headers 與 allow-origin 則依需求填寫，之後啟用

![](/fromMediumImg/1__aztr2UGVyCRbemSggdMyyw.png)

啟用完後直接部屬

![](/fromMediumImg/1__Pgzh2s4Fq0i7Y7pm__56__xA.png)

「部署階段」選擇新階段，名稱這邊先填上 test，然後部屬

![](/fromMediumImg/1__GR7B5181____HbzDeUNh__ZLQ.png)

接著拿部屬好的 URL 到 devtools 用 `fetch` 戳戳看，若看到成功的回應則正常:

![](/fromMediumImg/1__TLk5lWyQrVjp__7gB7M00fg.png)

到這裡，我們已經成功做出短網址產生器了，不過還是有一點點問題。

### 將產生的 link 存進 S3

Firebase dynamic links 有每個 IP 每秒 5 個請求，以及每天 200,000 個請求的限制，超過此限制，則會回 status code 429。  
以文章開頭處所提到，要在商品頁使用，若達到上限而無法產生 link 則很尷尬，故需要把已產生過的 link 存起來，若有用戶再次訪問同樣的商品頁，則回應先前產生的。

這邊選擇將資料存在 AWS 提供的 S3 中。  
首先，切到 S3 後建立儲存貯體，簡單命名一下，底下的設定都先預設不動，完成後按下建立

![](/fromMediumImg/1__BRRCGd0TxVO4vmwRwDFlkA.png)

存在 S3 的資料內容，格式是個 object，key 為 query string 的 link，value 為短網址，大概這樣:

{

  "origin link": "short link"

}

故我們先建立一個空 object 的檔案，並上傳

![](/fromMediumImg/1__BBpn__LJxUgiJ7Ce__RXCq1A.png)

因在 lambda 中操作 S3 bucket 資料需權限，故需到 IAM 的角色中，找到剛剛建立 lambda function 時，自動建立的角色

![](/fromMediumImg/1__y9imaspo6QlvO6HhMZoyiw.png)

點進該角色後，選擇「連接政策」

![](/fromMediumImg/1__xC2CN7PN53pztohl__dC3hQ.png)

這邊為求方便，筆者直接選擇完全 S3 操作權限，讀者可自行建立較嚴謹的規則，因也只需用到 get 與 put 操作而已

![](/fromMediumImg/1__tdD92u3ayXWBkKauZpiByA.png)

連接完成後，我們回到 lambda，進到原先建立的 function，需要加些 code 來操作 S3。

使用 [aws-sdk](https://github.com/aws/aws-sdk-js)，這邊無需像 `axios` 一樣要額外添加，此為 lambda 自帶的。  
大概定義下 get 與 put 的 function:

在先前的 code 中加上判斷邏輯: 一開始先查 S3 是否有該 link，若有則直接回傳，反之則戳 Firebase dynamic links API，拿到短網址後存進 S3 中，並回傳該 link，大概這樣:

我們可以在 code 中加個 `console.log`，印出 `s3Data`，並測試幾個連結:

![](/fromMediumImg/1__mwy__1NRh1nesST__WaP4pXA.png)

在連續請求產生同個 link 時，會發現得到的短網址是相同的，表示運作正常。  
到這裡，我們已經完成所有功能了。

### 結

這是我第一次在 API Gateway 上連到 lambda function 來產生 API，覺得挺有趣的，故 API Gateway 那有講錯還不吝指教。

整體 demo code 算是很精簡了，部份與安全性有關的都沒設定好，例如以文章開頭所提到的需求，不會希望任何 link 都要產生短網址，故還需判斷 request 的 link 是否是白名單內的；以及 CORS 的 allow-origin 與 allow-headers 也得嚴謹點。  
lambda 那邊的 code 也不算完整，async-await 的 catch 也沒處理，讀者可自己 handle 下。

在保留已產生過的 link 那，可以將 S3 換成 redis，速度會快很多，但相對需花點費用，筆者只是選擇相對便宜 / 免費的方案。

感謝您的觀看。