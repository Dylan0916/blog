---
author: Dylan
pubDatetime: 2021-03-16T15:28:13.844Z
title: 使用 index 來當 React list 的 key 會發生意外的結果
postSlug: 2021-03-16_react-list-index-key
tags:
  - React
description: >-
  最近一些因緣際會下，與其他工程師談到 react list 中的 key 的作用，若用 index 當 key 會如何?大家都知道他是 react
  對性能的優化，能在 virtual DOM diff 時去判斷節點的增減，這邊就不贅述這些了，相關的資訊，網路上還挺多的。
---

最近一些因緣際會下，與其他工程師談到 react list 中的 key 的作用，若用 index 當 key 會如何?  
大家都知道他是 react 對性能的優化，能在 virtual DOM diff 時去判斷節點的增減，這邊就不贅述這些了，相關的資訊，網路上還挺多的。

在跟那位工程師聊 key 時，我也很順口的說出是性能優化，他就問:「那 state 呢?」，我就有點愣住了，因從學習以來，就被教導 key 需要是 unique，且不會隨意變動的，故從沒去看若用 index 當 key，re-render 與 lifecycle 的變化會如何。  
但身為一個好奇的工程師，就得試出答案才行。

### 來建立一個使用 index 當 key 的 list 吧

![](/fromMediumImg/1__ZSiJnp8gFixnt0Yfll7qxw.png)

測試的 code 就差不多這樣吧，滿簡單的。  
建立兩個 component，`Item` 在 render 以及建立時會 log，且在按下按鈕時會新增一個 `Item`。

來看執行效果吧:

![](/fromMediumImg/1__Gj0nLHLo__cq3aWJ9z3WRTw.gif)

看起來滿正常的，依序印出 4 再來 5，那麼接下來將新增的資料放到開頭處吧:

![](/fromMediumImg/1__nyZCgFMypmAU3I35__teFoA.png)

來看一下執行的效果如何:

![](/fromMediumImg/1__0zITXmUz9gUkIIaUs9nDOA.gif)

會發現滿神奇的事情發生，re-render 的地方沒什麼問題，問題在 did mount 的部分，為何 3 號位置的 `useEffect` 會重複被觸發?

原因在於我們是用 `index` 來當 key，所以當按下按鈕後，index 從 0~2 變成 0~3，0~2 的數字沒變，多出了一個 index 3，故 react 會判定我們新增了一個 component 出來，也就是 index 3 的位置的 id 3，進而得到這樣的 log 結果。

可以想像一下，若我目的為在 component mounted 後發一個 request，並帶上 props 的一些資料，那我會在 useEffect 裡觸發此 request，並帶上應有資料。  
這樣若用 `index` 當 key，則會是每隻 request 都被帶上相同資料。

### 結

一開始在測試時，看到這樣的結果有點搞不清楚為何，但仔細思考後發現 log 出來的 component 就是 index 多出來的那位，就覺得合理了。

但若有任何地方是我誤解的，還請不吝留言讓我知道，我會馬上修改。
