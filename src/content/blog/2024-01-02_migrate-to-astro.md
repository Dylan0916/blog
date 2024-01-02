---
author: Dylan
pubDatetime: 2024-01-02T13:48:46.285Z
title: Migrate to Astro
postSlug: 2024-01-02_migrate-to-astro
tags:
  - Astro
description: 還記得大學剛畢業時，為了找工作，在 github page 上建立了自己的網頁，其內容是介紹自己、作品集之類的，後來找到第一份工作後，就沒再維護了。
ogImage: /blogs/migrate.avif
---

![](/blogs/migrate.avif)

## 開頭

還記得大學剛畢業時，為了找工作，在 github page 上建立了自己的網頁，其內容是介紹自己、作品集之類的，後來找到第一份工作後，就沒再維護了。

而最近突然意識到該重新有一個自己的網站，不然身為一個前端工程師，卻沒有自己的網站，總覺得怪怪的，且剛好近幾年有在 Medium 寫一些文，若再晚決定，搬的成本會增加，而我也可以順便練習 SEO。就在這念頭下，我決定開始研究要用哪套框架來做。

想起之前曾看到有人推薦 [Astro](https://astro.build/)，說速度很快、SEO 友善之類的優點，看了一下覺得滿好上手的，就決定是它了。

## theme 選擇

做一個網站最麻煩的地方就是 layout 樣式了，好在 Astro 有提供[一系列的 theme](https://astro.build/themes/) 選擇，可以根據自己的需求來篩選，例如要 React 還是 Vue，是否要 TS、Tailwind 之類的，非常方便。

我自己對網站的需求是：

- 能切換 dark/light mode
- 有分類功能
- 有文章列表
- 使用 tailwind 來處理樣式。
- 有 TS。

在篩選一輪後，找到一個還滿滿意的，個人覺得目前使用的這個很好看。

## 將 Medium 的文章搬過來

先前看 Huli 大的[搬家文](https://life.huli.tw/2023/10/09/goodbye-medium/)介紹，裡面提到 [medium-2-md](https://github.com/gautamdhameja/medium-2-md) 光看名字就知道是個可以將 medium 的文章輸出，並轉成 md 檔案的工具。

因需配合 theme 本身的 md 格式，所以只好 clone 下來小改一下。
後來也得調整 md 內文的 code snippet 和圖片路徑，不知道為何轉出來的 code snippet 都會有不明的底線 (`_`)。

## Host Page

在 local 端處理完畢後，再來就是找個地方部署了，因 Astro build 出來的都是靜態檔案，使用 SSG 的方式，故不需要額外的 server，在金額方面是可以完全免費的。

因之前玩過 github page，所以這次決定使用 [cloudflare page](https://pages.cloudflare.com/)。

cloudflare page 使用方式非常簡單，只要連接到你的 github repo，然後填一下 build 的指令和 main branch 就完成了，之後只要當有 code 被推到 main branch，它就會自動觸發部署，非常的快。
且 cloudflare 本來就是 CDN 專家，所以不需擔心開啟網站速度的問題。

## 結尾

整體來說，我還算滿意這次搬家的舉動，雖然還有很多事沒搞好，例如 google search console 的 site map，不知道為何它一直驗證不到。

在留言方面也是未來需要處理的事，以往可以直接在 medium 上看到別人的留言，現在自己的 blog 得自己做出來。

目前在 Medium 那邊依然還會再更新文章，也就是這邊寫完再複製貼過去。

總之，個人認為架一個自己網站是不虧的決定，雖然挺花時間的，但能學到不少。
