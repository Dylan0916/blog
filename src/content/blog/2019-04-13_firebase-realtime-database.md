---
author: Dylan
pubDatetime: '2019-04-13T13:32:38.879Z'
title: Firebase — Realtime Database 紀錄
postSlug: 2019-04-13_firebase-realtime-database
tags:
  - Firebase
  - Realtime Database
description: >-
  之前寫了一篇 Cloud Firestore 的紀錄，現在來寫另一個我覺得更強大的「Realtime Database」，至於什麼是 Realtime
  Database，這邊就不多說明了。
ogImage: /fromMediumImg/1__B0Av__NnFrCKsyC7gN94ytg.png
---

![](/fromMediumImg/1__B0Av__NnFrCKsyC7gN94ytg.png)

之前寫了一篇 [Cloud Firestore 的紀錄](/posts/2019-04-13_firebase-cloud-firestore)，現在來寫另一個我覺得更強大的「**Realtime Database**」，至於什麼是 Realtime Database，這邊就不多說明了。

### First

若你還沒在 firebase 上啟動過任何專案，可以參考我這篇的前面來跟著操作啟動專案 -> [Cloud Firestore 紀錄](/posts/2019-04-13_firebase-cloud-firestore)，

之後點選左側的「開發 -> database」，待右側畫面更新完後，將上方的選項改為「Realtiem Database」：

![](/fromMediumImg/1__PB6bGgbFyodpDD7d9YbOLg.png)

然後點選「規則」進入編輯，將 `.read` 與 `.write` 設為 `true`，按下「發布」，這樣你就可以讀取與設定資料到資料庫裡了。

### Coding

進入寫 code 時間啦，

在你的編輯器插入以下程式碼：

`user-datas` 為你的資料 key 值，可以隨意自訂名稱，6~7 行為資料的 key-value，一樣可以隨意自訂，

之後將你的程式碼運行到瀏覽器上，按下 set 按鈕後，我們回到 firebase 去查看，可以發現 realtime database 強大的地方，資料馬上更新了：

![](/fromMediumImg/1__fTWKSvVArWMByMpKGegkaw.png)

寫完 set 後，我們來寫 get 吧～

#### Get data

在你的編輯器插入以下程式碼：

get 的部分滿簡短的，這邊設定為頁面載入完後就去取得 DB 資料，

`user-datas` 為你剛剛的「資料 key 值」剛輸入什麼，這邊就需輸入什麼。

此時我們打開 console 來查看：

![](/fromMediumImg/1__XKiFj6BuUtyaaKSYYfXu0g.png)

可以看到剛剛 set 進去的資料。

realtime database 神奇的地方在於即時更新，我們回到 firebase，直接在 firebase 上改變資料內容，然後再回去看剛剛的 console，可以發現資料馬上被印出：

![](/fromMediumImg/1__4BdA2JETVldAUPQUQruung.gif)

> 真是太神奇了～

### End

ok，這篇一樣只講 get 與 set，需要其他功能的讀者得去找別的文章來學習了 😅