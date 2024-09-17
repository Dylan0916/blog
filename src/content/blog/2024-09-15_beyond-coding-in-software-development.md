---
author: Dylan
pubDatetime: 2024-09-15T13:48:46.285Z
title: 走一遭『寫程式』以外的軟體開發 - 大型軟體公司的工作日誌 | HWDC 心得文
postSlug: 2024-09-15_beyond-coding-in-software-development
tags:
  - HWDC
  - 心得文
description: ---
ogImage: /blogs/beyond-coding-in-software-development/cover.jpeg
---

![cover](/blogs/beyond-coding-in-software-development/cover.jpeg)

前幾天參加了 [HWDC](https://hwdc.ithome.com.tw/2024)，裡面有不少厲害的講者，其中最讓我印象深刻的就是「[走一遭『寫程式』以外的軟體開發 - 大型軟體公司的工作日誌 | HWDC 心得文](https://hwdc.ithome.com.tw/2024/session-page/3202)」，講者用詞簡單明瞭、內容清晰好理解、語調不會讓人覺得想睡，讓我覺得這是一場很棒的分享，故我決定寫成一篇文記錄一下其中內容。

> 這是講者的 Medium: https://medium.com/@johnliutw

這場主要是講者去訪談一些大型公司的工程師，詢問他們的技術文化，得出一些結果。

![company logos](/blogs/beyond-coding-in-software-development/company-logos.png)

## 摘要

- 程式開發
- 品質與自動化
- 系統迭代
- 團隊文化

這四個要點主要是基於一本書叫「[Google 的軟體工程之道](https://www.books.com.tw/products/0010938794)」的面向來延伸的。

講者的 Medium 也有分享這本書，有興趣的可以自己去看一下。

## 開發

### 靜態工具 - Style 原則

- 要發揮作用

這意思是像是有些公司在你剛入職時會叫你讀一些文件，有超多的規則，然後要你遵守這些之類的，可能你讀完就想離職了，沒辦法運作。
故我們要簡化這些流程，切中要點。

- 以讀者角度來撰寫

在實際開發中，我們其實有 9 成以上的時間都是在閱讀別人的程式碼，所以說你寫出來的程式有 9 成的時間是被閱讀的，故讓程式碼易讀是很重要的。

- 保持一致性
- 要避免易錯、非預期的情況發生

這邊在後面 CR 階段會再特別提到。

- 要針對實際情況做調整

例如像是 PHP 8.1 出了一個叫 Enum 的功能，像這種新的東西若使用指引的方式來運作，而不是直接 block 掉，針對實際情況做調整。

### 靜態工具 - Style Guide

![Google style guide](/blogs/beyond-coding-in-software-development/google-style-guides.png)

這是在 Google 裡面實際的一個靜態工具的範例，這是在非常大的公司會有的原則，例如 Amazon、TikTok。
而在中小型公司則是依靠自動化或 lint。

### 靜態工具 - Sonarqube

![Google style guide](/blogs/beyond-coding-in-software-development/sonarqube.webp)

這是一個開源的工具，但也提供需付費的 SASS 服務，能自動檢查程式碼的工具，包含但不限於：

- 程式碼是否重複。
- 是否有安全性問題。
- 測試覆蓋率。
- style check。
- 可維護性。

### CR (Code Review) - 看哪裡？

一般在發了一個 PR (Pull Request) 後，你會希望它快點被通過以及被 merge，所以在設計上會注重：

- 正確性

確認程式碼是否能正常運作

- 安全性

確認沒有 security 的問題

- 效能

效能是大部分講者去訪談的公司的工程師都非常看重的一塊，例如：Shopback、Nvidia、Appier、Tesla，看看是否有一定的效能，使用的演算法是否有問題。

- 強固性

看看這個程式碼是否很容易出錯、是否很敏感，例如一個程式碼接受一個參數，型態是數字 (int)，然後你帶了一個字串 (string)，這個程式碼就會出錯，你可能會想設計上就是要數字，帶字串進來本來就會錯，不過如果它夠強固的話，能替它想到各種情境、做各種轉換，就能提升程式碼的強固性。
因為在大型公司，你永遠不知道你的程式碼會給什麼人使用，例如你可能在維護一個 N 年前的程式碼，你根本不知道當初那個人在哪了。

- 可讀性

如果一段程式碼會讓你停頓一下、讓你感到困惑，可能原因有兩種：

1. 可能才剛加入團隊，不了解這個 domain、knowhow。
2. 可能性可以加強，因為你看不懂，如果你看不懂，其他人也很可能看不懂。

所以可讀性是 CR 階段非常看重的一點。

- 風格一致

假設有一段程式，可讀性、效能、安全性什麼的都非常好，但一樣的問題，其他團隊都用了 A 設計方式，就這裡使用了 B 設計方式，這樣可能在未來會造成維護上的困惑：「為什麼這種情境要使用 B 的方式？」。

### CR - 怎麼運作？

- 保持禮貌和專業

像是在 CR 時發現對方少加了什麼，可以使用「Could you please...」、「不好意思幫我加一下...謝謝」、「幫我確認一下...我也不太確定」。

如果是偏向主觀的議題，以作者 (開發者) 的決策比較好，除非是重要的 issue，就要提出來，設定客觀條件，讓大家都認同。

- 盡可能縮小 PR 範疇

可以以 200 行為參考基準 (自己決定就好)，小的 PR 能加速被通過的機率。
若真的太複雜，可以開一個 PR review 會議，讓開發者介紹他的架構、怎麼運作之類的，但嫌開會太麻煩，那就把 PR 拆小，就不會有這些事出現了。

- commit message

使用 [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) 來陳述變更類別。

- reviewers

假設一個 PR 有 20 個 reviewer，但第一個 reviewer 可能有 80% 的貢獻，第二個 5%，第三個剩下 2% 3%，因他們大概率 context 都是差不多的、都是同個 team 的，思考點都差不多。故 reviewer 不是越多越好。
講者說他公司是兩個 reviewer，除非是大型變更。

- 盡可能自動化

搭配剛剛提到的 Sonarqube，搭配一些 CI。

### CR - code owner

![code owner 01](/blogs/beyond-coding-in-software-development/codeowners-01.png)

![code owner 02](/blogs/beyond-coding-in-software-development/codeowners-01.png)

可以使用 Github 本身擁有的 code owner，可以設定哪些檔案是哪些團隊擁有的，當有這些檔案變更時，會明確指示誰該去 review。

### 文件的核心價值

- 針對 feature design 寫文件

除了 API 要寫文件外，也要針對 feature 去寫文件，強迫設計者去清楚了解規格，如果設計者無法文字化來表達他要怎麼設計，通常代表他想的不夠清楚，所以可以強迫開法者釐清自己思維。

- 交給新人

將文件交給新人，就可以不用手把手帶新人，如果要規模化的話可以做一個文件庫。

- 手動流程更容易遵守

例如像是 SOP，當發生問題時，support engineer 該 follow 什麼流程，可能哪天自己的文件會幫助到自己。

- 能回答出為什麼要做這個決策？

例如現在在選資料庫，要 MySQL 還是 PostgreSQL，若你的文件只有介紹用了 MySQL 怎樣怎樣的，但是沒有寫當初為什麼選擇 MySQL，在未來可能會一直被問，例如：「為什麼明明這個語言的生態系最常搭配 PostgreSQL，為什麼這裡要 MySQL？」

### 文件的難處

![block diagram](/blogs/beyond-coding-in-software-development/block-diagram.webp)

第一個難處是文字與事實不符

假設要開始一個功能，然後大家叫你去看文件，結果發現文件與事實完全不匹配。
所以文件也有版本問題，所以不是所有東西都要記成文件，不然很容易發生這個問題，盡量針對重要、長期有價值的來記錄。

也要持續培養自己寫作的能力，持續優化寫文件的技巧。

![documentation everywhere](/blogs/beyond-coding-in-software-development/documentation-everywhere.jpeg)

第二個難處是到處都是文件

什麼地方都有文件，google drive 有文件，他的電腦桌面有文件，他的抽屜也有文件，到底文件都放在哪？
所以要盡可能的把文件都集中在幾個地方。

演講者的公司有自己的 AI gpt，可以在裡面搜尋問題，因為統一化了，所以可以 training。

### 哪時候要寫文件？

- on call SOP

前面提到的操作手冊。

- 系統架構

例如系統有 20 30 幾個服務，他們怎麼交互運作的。
或是這個 E2E 流程超長，該怎麼設計之類的。

-
