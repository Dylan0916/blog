---
author: Dylan
pubDatetime: 2021-04-21T15:10:25.498Z
title: "粗略講解 display: none / visibility: hidden / opacity: 0 差異"
postSlug: 2021-04-21_display-none-visibility-hidden-opacity-0
tags:
  - CSS
  - Css3
  - Opacity
  - Display
  - Visibility
description: 本篇主要是給我自己做個紀錄的，方便以後回頭查詢。
ogImage: /fromMediumImg/1__5nvvoF__U3zTbmhb0pVOhxg.jpeg
---

![](/fromMediumImg/1__5nvvoF__U3zTbmhb0pVOhxg.jpeg)

本篇主要是給我自己做個紀錄的，方便以後回頭查詢。

主要會講解這三個屬性的:

- DOM 結構
- 事件監聽
- 效能
- 樣式繼承
- transition

### DOM 結構

- **display: none** -> 元素會從 render tree 消失，不佔據渲染空間。
- **visibility: hidden** -> 元素不會從 render tree 消失，會佔據渲染空間。
- **opacity: 0** -> 元素不會從 render tree 消失，會佔據渲染空間。

### 事件監聽

- **display: none** -> 無法進行 DOM 事件監聽，意即無法被點擊。
- **visibility: hidden** -> 同 display: none。
- **opacity: 0** -> 可以進行 DOM 事件監聽，意即可被點擊。

### 效能

- **display: none** -> 因會從 render tree 消失，故動態設置此屬性會造成 reflow，效能最差。

![](/fromMediumImg/1____rHs8ILCDZ0FMkS5jc2qKQ.png)

- **visibility: hidden** -> 動態設置會觸發 repaint，效能較優。

![](/fromMediumImg/1__qMXEaDDeNvTX__szf3BeFaw.png)

- **opacity: 0** -> 一般情況: 會觸發 repaint；利用 animate 動畫: 會默認觸發 GPU 加速，只會觸發 GPU 的 composite。  
  (opacity 的 performance 圖看不是很明白，等之後瞭解了再補圖。)

### 樣式繼承

- **display: none** -> 樣式不被子元素繼承，故在子元素設 display: block 也顯示不出來。
- **visibility: hidden** -> 樣式會被子元素繼承，故子元素可設置 visibility: visible 來顯示。

![](/fromMediumImg/1__gx5JileqNEYcVtHiTirk9g.png)

- **opacity: 0** -> 同 `display: none`。

### Transition

- **display: none** -> 不支持 transition。
- **visibility: hidden** -> 支持 transition，但會立即顯示，延遲隱藏。

![](/fromMediumImg/1__pse255QO29UH1z7d__V6okA.gif)

- **opacity: 0** -> 支持 transition，顯示與隱藏皆有延遲效果。

### 結

以上分別講解了 `display: none` / `visibility: hidden` / `opacity: 0` 這三種屬性的DOM 結構、事件監聽、效能、樣式繼承、與 transition，

當初看到 visibility 的「樣式繼承」與 「transition」 最為驚訝，沒想到子元素設置 `visibility: visible` 就可以顯示出來了，平時沒這樣寫過，還真不知道。

在講到效能的 opacity 那邊時，與前兩屬性一樣想要截圖，但發現 performance 竟然出現 Layout 與 Paint，有點傻眼，不知道哪邊弄錯了，故打算更看得懂時再回來補圖 😓

以上若哪裡寫的與你認知有出入，麻煩不吝賜教，感激不盡~
