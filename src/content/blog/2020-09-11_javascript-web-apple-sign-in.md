---
author: Dylan
pubDatetime: '2020-09-11T15:47:33.269Z'
title: 利用 JavaScript 在 Web 上完成 Apple Sign in
postSlug: 2020-09-11_javaScript-web-apple-sign-in
tags:
  - Apple Sign In
  - JavaScript
description: >-
  因 Apple 限制上架商品只要有第三方登入就一定要有 Apple Sign in 功能，而在完成 App 的 Apple Sign in 後，也得在
  web 上實作，不然可能會發生昨日客戶在 App 上使用 Apple 做登入，隔天改跳到 web…
---

![](/fromMediumImg/1__fFS6Sm4__h0CkMFM5CPGWCg.jpeg)

前些日子完成自家 App 的 Apple Sign in，因 Apple 限制上架商品只要有第三方登入就一定要有 Apple Sign in 功能，  
而在完成 App 的後，也得在 web 上實作，不然可能會發生昨日客戶在 App 上使用 Apple 做登入，隔天改跳到 web 上，卻發現沒有他的登入方式，可能會造成流失，故就得研究如何在 web 上接上 Apple Sign in。

而 Apple 的開發文件寫得真的很散，想找個資料得跳來跳去的，故在完成此功能後，決定寫份心得文記錄一下。

> 先在前面說明一下，因筆者是前端工程師，故文內不會有如何在 Apple developer 申請 ID、以及 JWT 與後端有關係的處理說明。

#### 前期準備

這邊參閱 [Apple 官方文件](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple)，可以看到首先引入 script source:

<script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en\_US/appleid.auth.js"></script>

再來往下看到可以使用 meta 方式，而筆者是用再往下的 init() 方式，較自由。

![](/fromMediumImg/1__d2lfimd__5ZlN8wYpX4zazg.png)

這邊是基本配置:  
clientId (string): 產品 identifier，非常重要，Apple 識別產品用的，稍後會帶著去申請。  
scope (string): 在用戶授權後，開發者能拿到的資料。一般都填「name email」，注意 name 與 email 須有一個空白。  
redirectURI (string): 用戶登入完後會回到的頁面網址，這邊是不能隨意填的，稍後在申請 clientId 時會需填入此資料。  
state (string): 給開發者隨意填入的值，用戶登入完後回傳的資料內，會原封不動地回傳一樣的值，可以用在驗證送出與回傳是否相等，避免一些攻擊。  
usePopup (boolean): 是否只用 popup 方式開啟，若為 false，則會將原本頁面導至登入目的頁，反之則開啟一個 popup，這邊筆者填入 true。

接下來就是去申請 clientId 與填寫 redirectURI 了。

#### 註冊 ngrok

在申請 clientId 前，有個很重要的步驟是取得真實可用的 https 網址，因在 local 端起的 server 也只能自己內網能讀取，要如何獲得外網也能連進的網址呢?  
除了丟上自己的網站外，還有個方便的選擇就是 [ngrok](https://ngrok.com/)，這是個簡單又好用的工具，只要照著官網的步驟做，就能獲得一個暫時的 https 網址了，而這個網址稍後會用到。

#### 申請 Certificates, Identifiers

首先進入 [Apple Developer 官網](https://developer.apple.com/)，登入成功後進入「Account」，之後會看到這個畫面 (很可能網站更新所以不再長這樣)，點選「Certificates, Identifiers & Profiles」。

![](/fromMediumImg/1__woaTrD6qtxZMcJEgCAVR9w.png)

點選左側的「Identifiers」會看到這樣的畫面:

![](/fromMediumImg/1__WEI5fOYGlhuC__pubEM4QHg.png)
![](/fromMediumImg/1__u6YDlVIFFTa8E8SVvUc9rA.png)

點擊「Identifiers」右側的加號 (新增)，這邊會看到一堆選擇，我們選擇「Services IDs」，進入下一步後，這邊有個重要的欄位為「Identifier」，為剛剛 redirectURI 要填入的資料，這邊筆者先填入 com.test.abcd.web，而 Description 隨便就好。

![](/fromMediumImg/1__u6YDlVIFFTa8E8SVvUc9rA.png)

接下來就繼續往下走，申請完後會看到這樣的畫面:

![](/fromMediumImg/1__AUNKZzh9cKJxtECYpEST7Q.png)

點進剛剛申請的「test」內，將「Sign In with Apple」打勾，且點擊右側的「Configure」，將上面的 ngrok 網址填入「Return URLs」，這邊筆者會順邊在網址後方加上 appleLoginDone，大概會這樣:

![](/fromMediumImg/1__dCIlazvWTmOYPLyWyfI36w.png)

之後一直點擊下一步 / 繼續，儲存完後可以再回到此 identifier 裡，再次點擊「Configure」，點擊「Search」框，可以看到剛剛添加的網址:

![](/fromMediumImg/1__gHBEjmVc9wXyl__AisN7E6w.png)

Certificates, Identifiers 的部分就先到這裡，接下來回到 code 中。

#### 完成剩餘的

將剛剛申請的細節填回 code 中，會長這樣:

![](/fromMediumImg/1__rd2Hh5WkSGMpww62te__8rg.png)

到這邊初始的部分已經完成了，接下來就差一個按鈕，點擊按鈕後會觸發登入行為。  
回到 Apple 文件，往下看到這段:

![](/fromMediumImg/1__dHoXg1CMzxfXEwNYvUGgLw.png)

只要在按鈕點擊後觸發上面那段就好，signInt() 是個 promise，會在使用者登入 / 註冊完後得到 fulfilled 或 rejected。  
在觸發上面那段後，會因 init 裡面寫說使用「popup」而開啟一個小窗。使用者登入 / 註冊完成後會自動關閉這個小窗，就能從 data 中取得使用者資訊，做進一步動作。

這邊筆者會隨意加個按鈕，而實際 Apple 有限制 Apple Button 的 guidelines，若有上線需求的話，建議去看一下。  
而按鈕點擊後觸發的 code 大概長這樣:

![](/fromMediumImg/1__uTsS__Ih04Wc0Vn3C__4wnUQ.png)

拿到回應的「token」與「code」後就可以向後端發 api，做產品的登入或註冊了。  
這邊比較需要注意的是 name 的部分，若用戶使用的 Apple 帳號是第一次在你的產品進行 Apple Sign in，那回應的資料就會有「user」，可以看到上方 code 中的 type，它為 optional，故只有在第一次才會拿到，其次就沒這欄位了。

error 的部分，目前只知道「popup\_closed\_by\_user」、「user\_cancelled\_authorize」、「user\_trigger\_new\_signin\_flow」這三種，意思就跟字面上一樣。  
若有人知道還有什麼樣的錯誤信息，麻煩不吝告知一下。

#### 總結

在 web 上實現 Apple Sign in 大概就是這樣，其實挺單純挺簡單的，麻煩的是在翻文件的部分。  
而上面提到使用者在登入 / 註冊完成後回應的資料內，還有個欄位是「email」，他會在使用者選擇 share email 或 hide email 而呈現不同的樣子，而這部份就得看自己的專案需要這資料做什麼樣的操作了。

之後會再找個時間寫如何在 RN 上實作 Apple Sign in，在 RN 上就更簡單了，因相關 method 都有人幫忙包成一個工具了。

#### 20200913 更新

在寫 RN 的部分時，想起忘了寫支援性的部分:  
在 web 上，iOS 13 以上的是拉起裝置本身的驗證視窗，而 iOS 13 以下的則是導頁到 Apple 的頁面。

RN 的部分完成囉，篇幅短很多:

[**在 React Native 上實作 Apple Sign in**](/posts/2020-09-13_react-native-apple-sign-in)