---
author: Dylan
pubDatetime: '2021-05-02T13:22:54.719Z'
title: 如何在 react-native 與 react-native-web 上做 A/B testing
postSlug: 2021-05-02_react-native-and-react-native-web-a-b-testing
tags:
  - Firebase Remote Config
  - A B Testing
  - Google Optimize
  - React Native
  - React Native Web
description: >-
  近期工作上接到需做 A/B testing 的需求，而專案上是三平台共同開發的，也就是使用 RN 與 RN-Web，從未在 App 上做 A/B
  testing 的我來說，此需求是項滿有挑戰性的。
---

![](/fromMediumImg/1__taogIHtqzQ7EYtQZEZBchw.png)

近期工作上接到需做 A/B testing 的需求，而專案上是三平台共同開發的，也就是使用 RN 與 RN-Web，從未在 App 上做 A/B testing 的我來說，此需求是項滿有挑戰性的。

在一番研究後，在 App 上可以使用 Google 提供的 [Firebase](https://firebase.google.com/)，Web 上可以使用一樣由 Google 提供的 [Optimize](https://optimize.google.com/)，兩項工具在當前需求上是可以免試使用的。  
而要如何讓 App 與 Web 吃同一套邏輯的 code 呢? 後面會詳細說明。

目前先介紹如何使用這兩套服務吧!

### Firebase A/B testing

首先先來介紹 Firebase 如何實現 A/B testing，在 Firebase 上，是透過他提供的 remote config 服務，再搭配 A/B testing 服務來連結 remote config 進而進行分組，在開發上只要取得 remote config 的值即可。

這邊我們先到 Firebase 的 remote config (還未建立 Firebase 專案的，照著官方指示就能順利建立了)

![](/fromMediumImg/1__ISUbIyBS302YIEiI08q66Q.png)

之後直接新增參數，參數名隨意輸入就好。這邊我取為「experimentTest」，預設值設為 0 (稍後我們會給實驗組為 1，控制組為 0)。  
新增完後直接發佈即可。

![](/fromMediumImg/1__h__bUux6D66DgpHYyoWRxQg.png)

接下來點擊 "筆" 右側的三個點，選擇「A/B 版本測試」。

![](/fromMediumImg/1__61UsjJGaTAuiwPYJ__tOJKg.png)
![](/fromMediumImg/1__VEXKuMCrgvo0X107__zX7Ig.png)

在第一步的地方，看讀者要不要改名稱與說明欄位。  
在第二步的指定目標處，要注意「觸及率」，若要全部使用者都進到這個實驗中，就得拉到 100%。

![](/fromMediumImg/1__1bxq5S2rvH__GetyGGuc1qw.png)

第三步的目標就選擇一個此實驗勝出的目標指標吧。  
第四步的變化版本，要記得將控制組的值設為 "0"，變化組的值設為 “1”。

預設分組比例是一半一半，可以點開「調整變化版本權重」來自訂比重。

![](/fromMediumImg/1__Ol7RXknko77Q7DLQYIanNA.png)

之後按下審查後就可以開始此實驗了。  
到這裡我們已經設定完 Firebase 的前置設定了，接下來是寫 code 的部分。

### React Native Firebase

這邊我們使用 [@react-native-firebase/remote-config](https://www.npmjs.com/package/@react-native-firebase/remote-config) 來接上剛設定的值，注意在裝 **@react-native-firebase/remote-config** 時也要一併把 **@react-native-firebase/app** 裝起來。  
iOS 的 pod install 部份就不多贅述了。

引入以下三段 code:

import remoteConfig from '@react-native-firebase/remote-config';

export const fetchConfig = () => remoteConfig().fetchAndActivate();

export const getRemoteValue = (key: string) => remoteConfig().getValue(key);

我們透過 `fetchAndActivate` 來拉到 Firebase 上的資料，透過 `getValue` 來取得值。  
這邊要注意的是 `getValue` 拿到的並不是個可以直接拿來使用或判斷的值，還需要再使用別的 method 來取得真正的值，詳細參考: [https://github.com/invertase/react-native-firebase/blob/master/packages/remote-config/lib/index.d.ts#L180](https://github.com/invertase/react-native-firebase/blob/master/packages/remote-config/lib/index.d.ts#L180)

接下來就可以使用下段 code 來取得在 remote config 上的值了:

fetchConfig().then(() => {  
  const value = getRemoteValue("experimentTest").asString(); // "0" or "1"  
});

若上述步驟都做正確，基本上你會拿到 0 或者 1 的字串值。

這邊我測試是否真的有分組效果，是一直刪除後再安裝來測試的，我知道挺蠢的，但懶得去查如何更新取得的值，讀者可以自行去研究看看。

App 的部分就先到這裡，接下來我們來看 Web 的實作:

### Google Optimize

首先我們直接到 [Optimize](https://optimize.google.com/)，建立好容器後進入，點擊右側的設定 (齒輪 icon)，將最佳化代碼嵌進你的 code 中

![](/fromMediumImg/1__N6uNGRr__8hdoPPWButqQug.png)
![](/fromMediumImg/1__0LXSrJon1manTl__o34HTvg.png)

接下來我們建立體驗，這邊我們選「A/B 版本測試」

![](/fromMediumImg/1__1clwv16yLsm6MpOss2uRBQ.png)

接下來新增變化版本，但不用進入編輯，我們只需要他的分組功能就好，

之後設定完目標就可以開始此體驗了。開始後，我們滑到目標那，記錄這個實驗 ID，稍後會用到。

![](/fromMediumImg/1__uRmw0grWD78yZAmW2G1KyA.png)

那麼要如何拿到分組資訊呢?  
在 optimize 上，有個 callback 可以用，他會回傳當前用戶的分組，開發者就可以拿此分組來運用，詳細參考: [https://support.google.com/optimize/answer/9059383?hl=en#zippy=%2Cin-this-article](https://support.google.com/optimize/answer/9059383?hl=en#zippy=%2Cin-this-article)

以我的實驗來說，code 是長這樣:

function implementExperimentA(value) {  
  if (value ===  '0') {  
    // Provide code for visitors in the original.  
  } else if (value === '1') {  
    // Provide code for visitors in first variant.  
  }  
}

gtag("event", "optimize.callback", {  
  name: "hfL\_bpEAR2mDEqbAyyOPcw",  
  callback: implementExperimentA,  
});

`name` 就是填剛剛記錄的實驗 ID，你也可以不填，不過到時若有多個實驗，這個 callback 就會都觸發，是建議填一下比較好。  
`implementExperimentA` 吃三個參數，分別為: 組別、實驗 ID、容器 ID。  
組別為字串 0、1、2、3 …，以剛剛在 optimize 所新增的變化版本數量而定。  
然後我們就可以在 `implementExperimentA` 中寫我們的邏輯囉。

Web 方面相對簡單很多，接下來會介紹如何封裝兩邊的 code，讓在使用時，只要 call 一隻 function 就可以拿到組別了。

### 整合 Firebase 與 Optimize

這邊我們先確認一下取得組別時，最大的問題是什麼? 是非同步，故我們需寫一個 promise，在使用時去呼叫，而在拿到 remote confing value 或者 optimize callback 回來時將 pending 轉為 fulfilled。

以上述，code 大概會長這樣:

export enum ExperimentGroup {  
  CONTROL,  
  VARIANT,  
}

let \_abTestingResolve: (group: ExperimentGroup | PromiseLike<ExperimentGroup>) => void;  
let \_abTestingPromise = new Promise<ExperimentGroup>(resolve => {  
  \_abTestingResolve = resolve;  
});

`_abTestingResolve` 為等等將 promise 從 pending 轉為 fulfilled 的手段。

接下來再將剛剛的 remote config 與 optimize 的 code 整在一起:

function handleSetExperimentGroup(value: string) {  
  switch (value) {  
    case "1": {  
      return \_abTestingResolve(ExperimentGroup.VARIANT);  
    }  
    case "0":  
    default: {  
      return \_abTestingResolve(ExperimentGroup.CONTROL);  
    }  
  }  
}

export function abTestingSetup() {  
  if (Platform.OS === 'web') {  
    window.gtag("event", "optimize.callback", {  
      name: "hfL\_bpEAR2mDEqbAyyOPcw",  
      callback: handleSetExperimentGroup,  
    });  
  } else {  
    fetchConfig()  
      .then(() => {  
        const group = getRemoteValue("experimentTest").asString();

        handleSetExperimentGroup(group);  
      })  
      .catch(() => {  
        \_abTestingResolve(ExperimentGroup.CONTROL);  
      });  
  }  
}

這邊需將 `abTestingSetup` export 出去，在需要的地方執行他，可能在 App 啟動的地方之類的。

可以注意到我們在拿到 remote config value 或者 optimize 觸發 callback 時，去執行 `_abTestingResolve`，並將組別放進去。

到這邊基本上都弄好了，不過還有個致命的問題，就是若 promise 一直處於 pending 狀態或者等太久怎辦? 例如使用者安裝 adblock 或者其他原因造成拿不到 remote config value 或 optimize 無法執行。  
故我們需寫另一個 promise，在執行時去倒數 N 秒，N 秒過後強制分組。

function handleException() {  
  return new Promise<ExperimentGroup>(resolve => {  
    setTimeout(() => {  
      resolve(ExperimentGroup.CONTROL);  
    }, N);  
  });  
}

此時我們有兩個 promise 了，以我們要達成的目的，邏輯為: 取得組別，或者 N 秒後強制分組，這邊我們使用 `Promise.race` 來完成需求

export function getABTestingGroup() {  
  return Promise.race(\[\_abTestingPromise, handleException()\]);  
}

`getAbTestingGroup` 就是我們在使用時所呼叫的 function 了。

getAbTestingGroup().then((group: ExperimentGroup) => {  
  if (group === ExperimentGroup.CONTROL) {  
    // ...  
  } else {  
    // ...  
  }  
});

以上便是如何在 RN 與 RN-Web 上做到 A/B testing 的介紹了。

### 結

一開始在 Survey 階段時，是透過這篇來發現 Firebase 有提供 A/B testing 的解決辦法: [A/B Testing in React Native Has Never Been So Easy: Firebase Is Here](https://levelup.gitconnected.com/a-b-testing-in-react-native-has-never-so-easy-firebase-is-here-67836a35e0d3)，那時還挺興奮的想說 web 也可以靠此方法來實現了!!  
殊不知 web 雖有支援 remote config，但不支援 A/B testing…

在那悲劇的當下，主管提供 optimize 的方案參考，當時卡在要如何在 optimize call 到我的 source code，或者我要如何知道它的分組結果?  
後來就找到 callback 那篇解決辦法，一切都往好的方向發展。

在判斷 adblock 的地方，我們是用 [just-detect-adblock](https://www.npmjs.com/package/just-detect-adblock) 這套，用起來滿簡單的。

寫下此篇，是希望哪天有人也在寫一套能支援 App 與 Web 的系統，也碰上 A/B testing 的問題時，能有個解決方案看~  
也順便對自己的記錄。

若以上有哪裡寫錯，或有問題的，麻煩不吝提出，感謝!