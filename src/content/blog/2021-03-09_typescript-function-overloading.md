---
author: Dylan
pubDatetime: 2021-03-09T14:57:14.608Z
title: TypeScript | Function Overloading
postSlug: 2021-03-09_typescript-function-overloading
tags:
  - Typescript
description: "一般在寫函式時，可能會有接收不同參數而回傳不同內容的情境，例如這樣:"
---

一般在寫函式時，可能會有接收不同參數而回傳不同內容的情境，例如這樣:

![](/fromMediumImg/1__ArmrjiX7XKX9MB5pqEa8GQ.png)

這函式相當易懂，可接收三個參數，前兩個是 required，第三個是 optional，function 內會判斷有什麼參數或參數什麼型態來執行 / 回傳不同內容。  
但這時就有個問題，當在使用時，得到的型態被判斷可能是這三個:

![](/fromMediumImg/1__Y9fkBkMBAP8sSXS3zxMaNA.png)
![](/fromMediumImg/1__II__FARf9GG4__1BGvt__oFJA.png)

此時也無法享受到編輯器對 TS 帶來的 autocomplete 效果。

### Function Overload

而解決這個辦法的就是 function overload，最近因一些因緣際會下，認識到了這個，  
這邊先上 code，來看一下這個東西是長怎樣:

![](/fromMediumImg/1__Ls__MLYhfQLksN8MTq6EJ8A.png)

它會對 `foo` 定義所有可能的型態，在使用時會根據傳進的參數符合哪種定義來回傳正確的 type:

![](/fromMediumImg/1__LforSVI7f9n5aC2gPrrcGw.png)
![](/fromMediumImg/1__tt6LvSjDBmDm25g7mVTirg.png)
![](/fromMediumImg/1__YvwSmX2iLLXRiJNthUlhHA.png)

可以看到當我前兩個參數皆為 number 時，得到的 type 會是 number；而有第三個參數時，得到的 type 就是 void。

![](/fromMediumImg/1__h0w5b1rvyBtHjc6ykd4IYQ.png)

autocomplete 就能正常使用了。

### 結

其實在滿早以前，公司專案中就有人這樣寫過了，但當時我還不知道它的好處是什麼，以為只是單純給「人」讀的時候會比較方便，結果沒想到最大的好處是讓編輯器正確判別它的型態 (個人認為)。

時隔一段時間才真正瞭解它用處，這之間應該也用了不少錯誤的方式來解決這型態問題...

這篇只是簡單說明 function overload 這東西，沒什麼深度，單純希望能快速讓閱讀中的你認識到此功能。
