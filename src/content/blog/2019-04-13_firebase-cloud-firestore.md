---
author: Dylan
pubDatetime: '2019-04-13T12:54:37.607Z'
title: Firebase — Cloud Firestore 紀錄
postSlug: 2019-04-13_firebase-cloud-firestore
tags:
  - Firebase
  - Cloud Firestore
description: "因一些因緣際會下，跑來玩 firebase，玩下來覺得滿強大的一個東西，想說來寫個紀錄文好了\U0001F928"
---

![](/fromMediumImg/1__B0Av__NnFrCKsyC7gN94ytg.png)

因一些因緣際會下，跑來玩 firebase，玩下來覺得滿強大的一個東西，想說來寫個紀錄文好了🤨

_此篇為 Cloud Firestore 的紀錄，筆者有寫另一篇 Realtime Database 的，_[_傳送門在此_](/posts/2019-04-13_firebase-realtime-database)_。_

### First

新增完 firebase 專案後需拿到初始化 firebase 的 code，此時點選 </> 這個符號，見下圖：

![](/fromMediumImg/1__1VX5eNc2hXl8bfsIxm546Q.png)

之後依指示將顯示的 code 貼在編輯器上。

上述完成後，點選左側的「開發 -> database」，之後右側畫面更新後，選擇 「建立資料庫 -> 以測試模式啟動」之後按下「啟動」後等待數秒，待畫面更新後選擇「Cloud Firestore」(預設已是 Cloud Firestore)，見下圖：

![](/fromMediumImg/1__fc62OcngooVGRWub6q5UGA.png)
![](/fromMediumImg/1__h5i8ZCjR9jMMYopEJnyfYQ.png)

現在可以看到下方會顯示 集合/文件，這邊不贅述這個是什麼東西，我們就從 code，以及結果畫面來理解吧～

### Coding

終於進入我們寫 code 時間了，

因是使用 **firestore**，故需引入一段 script

https://www.gstatic.com/firebasejs/5.5.5/firebase-firestore.js

之後在你的編輯器下插入下方的程式碼

上方第 4 行為啟動 firestore，而 `to-do-list` 為剛剛看到的 `集合`，`to-do` 為 `文件` ，當然，`to-do-list` 以及`to-do` 都是可以隨意更改的名字，除此之外，8~10 行的 key-value 也一樣是可以隨意填入的。

此時將你的程式運行在瀏覽器上，點擊 set 按鈕後，我們回去 firebase 查看，可以看到剛剛的資料已經進來的：

![](/fromMediumImg/1__Yf9Nhkr9nf8____BvZsOm83Q.png)

set 的部份就講到這，現在我們來講如何 get 資料：

#### Get data

在你的編輯器上插入以下程式碼：

`collection` 為你剛剛的集合名，`doc` 為文件名，上段程式碼應該滿好理解的，就不多贅述了，最後打開你的 console，若成功拿到資料的話，應該會看到這樣的畫面：

![](/fromMediumImg/1__p6p__r4FQopefoFE7tPpC5Q.png)

### **End**

ok，因我只想記錄如何取得與設置資料，所以就只講這兩個，雖然講的哩哩辣辣的，當然還有除了 get/set 外還有很多功能，但讀者就需要上別處去查詢如何使用了😅