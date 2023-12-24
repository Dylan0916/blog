---
author: Dylan
pubDatetime: '2020-09-13T15:22:11.631Z'
title: 在 React Native 上實作 Apple Sign in
postSlug: 2020-09-13_react-native-apple-sign-in
tags:
  - React Native
  - Apple Sign In
description: >-
  前幾天完成了如何在 web 上完成 Apple Sign in 的介紹，想說一開始在做這個功能時，是從 App 先完成的，要不也把 RN
  的也介紹一下好了，但 RN 實在比 Web 上的簡單太多倍的… 畢竟已有別人做好的輪子，直接 import…
---

![Verybuy app](/fromMediumImg/1__xMd__2sq8tMSIy__bNcrS9Uw.png)

前幾天完成了如何在 web 上完成 Apple Sign in 的介紹，想說一開始在做這個功能時，是從 App 先完成的，要不也把 RN 的也介紹一下好了，但 RN 實在比 Web 上的簡單太多倍的… 畢竟已有別人做好的輪子，直接 import 就差不多了，所以這篇篇幅應該挺短的…

[**利用 JavaScript 在 Web 上完成 Apple Sign in**](/posts/2020-09-11_javaScript-web-apple-sign-in)

> 首圖是自家 App 上的登入畫面，也是完成 Apple Sign in 後的樣子

#### 寫在前面

Apple Sign in 在 App 上僅支援 iOS13+ 的，若是低於這版號，在 App 上是看不到 Apple Sign in 按鈕的，不像 web 是都可以看到，所以需注意一下。

#### 引入輪子

在 RN 上我是使用 [react-native-apple-authentication](https://github.com/invertase/react-native-apple-authentication)，這是 RN firebase 團隊提供的，所以還滿可靠的。  
首先就是先安裝 react-native-apple-authentication，照著 README 去安裝就可以了，這邊需要注意的是[環境配置](https://github.com/invertase/react-native-apple-authentication/blob/master/docs/INITIAL_SETUP.md)，前面 xcode 的設置相當重要，沒設定的話，App run 起來會直接紅屏。  
xcode 設定完後，下方的是 Identifier 設定，這與我們在 web 上設定的大同小異，這邊需申請一個新的，不能與 web 的共用，畢竟這邊是 App。

react-native-apple-authentication 有提供一些正規的 Apple 按鈕樣式，若他提供的樣式都不喜歡，也可以自製一個按鈕，按下後去觸發他提供的 function，不過按鈕還是得遵守 Apple 的 guidelines。

code 的部分大概是這樣:

![](/fromMediumImg/1__kDA6__Bc2WcyBjUGcapULRA.png)

其實 README 中也都有介紹到，不過他還有放入不少功能，而我有用到的就如上圖那麼多了，所以是真的挺簡單的。  
這邊我們來看「appleAuthRequestResponse」裡面有什麼，其實 react-native-apple-authentication 的 type 寫挺好的，讀者裝起來後也可以自己去看，我這邊先把部分的擷下來:

![](/fromMediumImg/1__dwMIBnPaaxW1UVj4C6h2tw.png)

可以看到回傳值比 web 多很多，光是 name 就有五種，不過與 web 一樣，當用戶的這個帳號，是在你的 App 第一次註冊的話，回傳值就會有 name，而下次之後都會是 null。  
email 的部分也是一樣，若用戶選擇隱藏 email，那麼拿到的就會是 Apple 自己編成的，不過一樣是可以寄信的信箱地址，Apple 會轉寄給用戶真實的 email。

基本上到這裡，你的畫面已經可以成功出現一個按鈕，點擊後會出現 Apple 自身的驗證視窗。

#### 總結

RN 的部分真的挺簡單的，不過也是我挺懶的… react-native-apple-authentication 裡面有一堆功能我都沒說到，也就只有用到 performRequest() 一個而已…  
不過他的 README 寫的挺詳細的，要什麼答案翻一下就能找到了。