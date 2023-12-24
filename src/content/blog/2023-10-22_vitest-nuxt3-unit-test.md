---
author: Dylan
pubDatetime: '2023-10-22T12:31:02.164Z'
title: 使用 Vitest 測試 Nuxt3 的程式
postSlug: 2023-10-22_vitest-nuxt3-unit-test
tags:
  - Nuxt 3
  - Vitest
  - Vuejs
  - Vue
  - Unit Testing
description: 最近工作開始接觸 Nuxt3，在寫完需求的 code 後，總是希望有單元測試來保護我們的程式，而當前的專案還沒有引入單元測試，所以打算自己建起來。
ogImage: /fromMediumImg/1__jFRwb4qlDi44TiTFeH1Xpw.png
---

![](/fromMediumImg/1__jFRwb4qlDi44TiTFeH1Xpw.png)

最近工作開始接觸 Nuxt3，在寫完需求的 code 後，總是希望有單元測試來保護我們的程式，而當前的專案還沒有引入單元測試，所以打算自己建起來。

在使用 Vite 時，官方推薦使用 Vitest，所以在使用 Nuxt 時，也優先採用這套。  
在 google `nuxt + vitest` 後，發現有一個現成的工具：[nuxt-vitest](https://github.com/danielroe/nuxt-vitest)，但它仍在非常初期的開發階段，使用起來很多問題，且它是完全依照 nuxt 執行方式去啟動程式，所以 middlewares 那些全都會執行，跑起來有點花時間，所以只好放棄它，改由自己配置 vitest。

在配置過程中遇到一些問題，例如 config 的配置、nuxt auto import (vue methods or components)、nuxt 的一些 functions (`definePageMeta`, `useSeoMeta`)，這篇將紀錄逐一的解決辦法。  
這篇不會講如何寫測試，這部分網上已有很多文章。

### Vitest Configuration

首先，需要裝這幾個 packages 在你的專案：

> vitest jsdom @vitejs/plugin-vue @vue/test-utils @nuxt/test-utils

然後新增 `vitest.config.ts` 檔案，添加基礎的配置：

```javascript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

這邊需要注意要在 `plugins` 特別加上 `vue`，否則在執行 `component` 的測試時會噴錯。

> 在使用 `_Vite_` 時，可以在 `_vitest.config.ts_`中使用 `_mergerConfig_` 來將 `_vite.config.ts_` 的配置合併起來，所以不需要額外再 import vue plugin。  
> 但在 nuxt 中，我沒找到相似的辦法，所以只好直接 import 它。

在 `globals` 中，將值設為 `true`，來避免每次使用 `describe、it` 時都需要額外 import。

到這裡就完成初步的設置了，我們來執行一個簡單的測試：

在專案下新增一個 `test.spec.ts`，並在裡面新增非常簡單的測試，並執行它：

```javascript
describe('my describe', () => {  
  it('test', () => {  
    expect(1).toBe(1);  
  });  
});
```

預期能正常 pass 這個測試，到這裡就代表我們的測試能執行了，並且一般的 util 測試沒問題。

### Component test

現在我們試試看 component 的測試：

在 `components` folder 下新增一個 component 檔案：`Test.vue`，內容如下：

```vue
<template>  
  <p>{{ msg }}</p>  
</template>  
  
<script setup lang="ts">  
const msg = ref('123');  
  
function changeMsg() {  
  msg.value += '!';  
}  
</script>
```

這是一個非常常見的 Vue component，因 Nuxt 會自動 import vue 的 method，所以我們無需再 `import { ref } from 'vue';`。

接下來我們新增這隻 component 的測試，內容如下：

```javascript
import { mount } from '@vue/test-utils';  
  
import Test from './Test.vue';  
  
describe('my describe', () => {  
  it('test', () => {  
    const wrapper = mount(Test);  
  
    console.log(wrapper.html());  
  });  
});
```

執行這隻測試後，會發現噴了錯誤：`ReferenceError: ref is not defined` 在 Vitest 中，並不知道 auto import 這件事。

解決這個辦法是安裝 [unplugin-auto-import](https://www.npmjs.com/package/unplugin-auto-import)，並在 `vitest.config.ts` 中的 `plugins` 添加它：

```javascript
import AutoImport from 'unplugin-auto-import/vite';  
  
export default defineConfig({  
  // ...  
  plugins: [  
    // ...  
    AutoImport({  
      imports: ['vue'],  
    }),  
  ],  
  // ...  
});
```

再次執行後就能 pass 了。

#### Custom Component

接下來我們依然在 `components` 下新增一個檔案：`MyButton.vue`：

```vue
<template>  
  <button>Button</button>  
</template>
```

並且在剛剛新增的 `Test.vue` 使用它：

```diff
<template>  
  <p>{{ msg }}</p>  
+ <MyButton />  
</template>  
  
<script setup lang="ts">  
const msg = ref('123');  
  
function changeMsg() {  
  msg.value += '!';  
}  
</script>
```

因 Nuxt 也會自動 import components folder 底下的檔案，所以我們也無需寫一次 `import MyButton from './MyButton';` 。

但當我們執行測試時，會發現 Vue 給了我們一個 `warning：[Vue warn]: Failed to resolve component: MyButton` ，這也是因為 Vitest 不知道該 component 來自哪裡。

解決辦法是安裝 [unplugin-vue-components](https://www.npmjs.com/package/unplugin-vue-components)，並在 `vitest.config.ts` 中的 `plugins` 添加它：

```javascript
import Components from 'unplugin-vue-components/vite';  
  
export default defineConfig({  
  // ...  
  plugins: [  
    // ...  
    Components({  
      dirs: ['./components'],  
    }),  
  ],  
  // ...  
});
```

再次執行測試後就沒有警告了。

#### Nuxt Function

接下來我們依然在 `Test.vue` 中新增如下程式碼：

```diff
<template>  
  <p>{{ msg }}</p>  
  <MyButton />  
</template>  
  
<script setup lang="ts">  
const msg = ref('123');  
  
function changeMsg() {  
  msg.value += '!';  
}  
  
+ definePageMeta({  
+   layout: 'main',  
+ });  
  
+ useSeoMeta({  
+   title: 'Test Page',  
+   description: 'this is desc',  
+ });  
</script>
```

Nuxt 提供了一些 function 來讓我們直接使用，這些也不需要額外 import 的。

接下來我們執行測試，會發現得到了錯誤：`ReferenceError: definePageMeta is not defined` 。

我目前的解決辦法是使用 `vi.stubGlobal` 對 `function` 去賦值，不確定有沒有更好的辦法。

```javascript
vi.stubGlobal('definePageMeta', vi.fn());  
vi.stubGlobal('useSeoMeta', vi.fn());
```

這個 `vi.stubGloal` 你可以寫在測試的開頭，也可以在 `vitest.config.ts` 中去定義 `setupFiles`，這樣就不用每新增一個測試都要寫一遍。

### 結

這篇主要是記錄如何在 Nuxt3 中使用 Vitest 來寫單元測試，讓我自己在未來若再次遇到時，可以有個參考的地方。

其中介紹了如何配置 config、如何解決 Vitest 遇到 Nuxt 中自動 import vue methods 與 components 的問題，最後介紹如何解決若有使用 Nuxt function 時，在 Vitest 遇到的問題，雖然這個解法我不是很滿意，但在找到更好的解決辦法之前，此方法能讓測試繼續進行。