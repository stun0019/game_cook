# 暖陽小廚房｜第三階段動態美術與體驗規格

本規格針對「手機 16:9、可愛商用、第一眼就懂」重新建立視覺層級，並回應目前畫面「全部靜態、很乾」的問題。程式整合以事件切換 class 為主，不要求改動 SVG 內部圖形。

## 1. 目前畫面診斷

以 960×540 橫向畫面檢視，目前主要問題如下：

1. 角色尺寸偏小，與大面積地板相比不像主角，持有物與朝向不易被第一眼辨認。
2. 工作站像固定資訊卡，未互動時與互動時的差異不足，玩家需要閱讀文字才知道下一步。
3. 中央地板留白過大且對比平均，視線沒有被帶向「角色 → 最近工作站 → 訂單」。
4. 底部文字提示離對應工作站太遠，玩家需在場景和說明之間來回掃視。
5. 料理完成、交付、得分與連擊沒有形成視覺高潮，遊戲節奏因此顯得乾燥。
6. 訂單卡只有狀態變化，欠缺進場、緊急、完成和失敗的節奏區分。

## 2. 第一眼視覺層級

### 層級 A：此刻要操作的內容

- 角色高度：手機 16:9 建議 `96–126px`，約短邊 18–23%。
- 手持食材：`42–58px`，固定浮在角色胸前，不與臉部重疊。
- 最近工作站：金色 2.5D 外框＋互動提示泡泡，同時只允許一座工作站啟用。
- 進行中工作站：使用蒸氣或碎屑，不與最近工作站高亮競爭。

### 層級 B：下一個任務

- 第一張訂單維持 100% 尺寸與不透明度；後續訂單縮至 90–94%、透明度 64–72%。
- 第一張訂單食材圖示至少 `28px`，時間條至少 `6px` 高。
- 緊急訂單只在剩餘 35% 時開始紅色呼吸，不持續抖動。

### 層級 C：結果與獎勵

- 完成餐點在組裝台上以 `burger-complete.svg` 回彈出現。
- 成功送餐時，餐點向出餐口飛送；分數星芒在出餐口與分數 HUD 之間出現。
- 連續成功第二次起顯示 `combo-badge.svg`，不得遮住角色或訂單。

### 層級 D：環境

- 未互動工作站降低 8–12% 彩度，但圖示仍清楚。
- 地板保持低對比，不新增高彩度裝飾；中央可用極淡柔光而非圖案吸引角色周圍視線。
- 工作站標籤作為補充而非主要導航；優先讓設備剪影與圖示說明功能。

## 3. 資產與 DOM 對應

| 資產 | 建議 DOM class | 功能 |
|---|---|---|
| `chef-rig.svg` | `.art-chef` | 分層角色、步態、左右鏡像、朝上狀態及工作動作 |
| 現有食材 SVG | `.art-held-item` | 拿取、持有、送餐拋物線 |
| `station-highlight.svg` | `.art-station-highlight` | 最近可互動工作站的 2.5D 金色外框 |
| `interact-prompt.svg` | `.art-interact-prompt` | 跟隨工作站的局部互動提示 |
| `steam-puff.svg` | `.art-steam` | 鍋具加熱與熟食完成前的循環蒸氣 |
| `prep-crumbs.svg` | `.art-crumbs` | 砧板切菜、快速加工碎屑 |
| `burger-complete.svg` | `.art-meal-complete` | 完成餐點、組裝成功與交付物 |
| `score-starburst.svg` | `.art-score-pop` | 加分、完美送餐、首份完成 |
| `combo-badge.svg` | `.art-combo-badge` | 連擊數字與短文字的空白徽章底框 |
| 無新增 SVG | `.art-order-card` | 訂單卡進場、緊急、成功與失敗退場 |

`chef-rig.svg` 若要驅動內部分層，必須 inline 注入 DOM；以 `<img>` 載入時只能對整體套用位移、縮放與鏡像。

## 4. 角色分層與朝向

角色 SVG 已提供：

- `#art-chef-shadow`
- `#art-chef-feet`，左右腳各有獨立 class
- `#art-chef-body`
- `#art-chef-arm-left`
- `#art-chef-arm-right`
- `#art-chef-head`
- `#art-chef-face`
- `#art-chef-hat`
- `#art-chef-back-detail`
- `#art-held-anchor`

程式狀態：

```text
向左：.art-chef.is-facing-left
向右：.art-chef.is-facing-right
向上：.art-chef.is-facing-up
移動中：.art-chef.is-moving
加工中：.art-chef.is-working
```

- 左右使用整體鏡像，避免製作兩套不一致角色。
- 朝上時隱藏臉部並顯示後腦／領巾細節。
- 角色停下時立即移除 `.is-moving`，步態須在 100 ms 內回到穩定站姿。
- 持有食材應以獨立 DOM 疊在 `#art-held-anchor` 對應位置，不嵌入角色 SVG。

## 5. 觸發時機與動畫對應

| 遊戲事件 | 加入／移除狀態 | 資產 | 建議持續時間 |
|---|---|---|---:|
| 玩家開始移動 | 加 `.is-moving`；依方向加 facing class | `chef-rig.svg` | 移動期間 |
| 玩家停止 | 移除 `.is-moving` | `chef-rig.svg` | 100 ms 內復位 |
| 偵測到最近工作站 | 舊站移除 `.is-near`，新站加入 | `station-highlight.svg`、`interact-prompt.svg` | 靠近期間 |
| 拿取食材 | 建立手持圖，加入 `.is-picked-up` | 現有食材 SVG | 520 ms |
| 開始切菜 | 角色加 `.is-working`，工作站加 `.is-processing` | `prep-crumbs.svg` | 加工期間，每 360 ms 一次碎屑 |
| 開始煎煮 | 工作站加 `.is-processing` | `steam-puff.svg` | 加熱期間，每 1200 ms 循環 |
| 工作站完成 | 移除 `.is-processing`、短暫加 `.is-ready` | `station-highlight.svg` | 380–680 ms |
| 組裝成功 | 餐點加 `.is-revealed` | `burger-complete.svg` | 620 ms |
| 出餐成功 | 手持餐點加 `.is-delivered` | `burger-complete.svg` | 520 ms 後移除 DOM |
| 加分 | 建立 `.art-score-pop.is-active` | `score-starburst.svg`＋程式文字 | 760 ms 後移除 DOM |
| 連續第二份成功 | 建立／更新 `.art-combo-badge.is-active` | `combo-badge.svg`＋程式數字 | 900–1300 ms |
| 新訂單 | 訂單卡加 `.is-entering` | 現有 DOM | 420 ms |
| 訂單剩餘 35% | 加 `.is-urgent` | 現有 DOM | 到完成／失敗為止 |
| 訂單完成 | 移除 urgent、加 `.is-completed` | 現有 DOM | 520 ms 後換卡 |
| 訂單失敗 | 加 `.is-failed`，震動一次 | 現有 DOM | 420 ms，禁止無限抖動 |

同一 DOM 若需重播動畫，程式應先移除狀態 class，再於下一個 animation frame 重新加入；不要複製整張卡或整座工作站。

## 6. 成功回饋節奏

單次成功應形成 0–760 ms 的小高潮：

1. `0 ms`：出餐口和餐點上浮 3–4 px。
2. `80 ms`：完成餐點向右上交付，出餐鈴同步下沉再回彈。
3. `180 ms`：星芒與 `+分數` 由出餐口生成。
4. `320 ms`：訂單卡完成並向右上退場。
5. `420 ms`：新訂單從上方進場。
6. `520 ms`：若達連擊門檻，連擊徽章回彈出現。
7. `760 ms`：星芒淡出，控制權全程不鎖定。

避免同時顯示超過一個大型星芒、兩個連擊徽章或三組蒸氣，以免手機畫面過度擁擠。

## 7. 建議整合骨架

```html
<div class="station art-station" data-station="pan">
  <img class="art-station-highlight" src="assets/art/station-highlight.svg" alt="">
  <img class="art-steam" src="assets/art/steam-puff.svg" alt="">
  <img class="art-interact-prompt" src="assets/art/interact-prompt.svg" alt="">
</div>

<div class="art-score-pop" aria-hidden="true">
  <img src="assets/art/score-starburst.svg" alt="">
  <span>+120</span>
</div>
```

```css
@import url("../assets/art/art-motion.css");
```

此骨架僅說明資產與狀態 class 的關係；正式整合時由程式助手依現有 DOM 結構調整，不應為套用美術而重寫遊戲邏輯。

## 8. 手機 16:9 驗收

- [ ] 第一眼先看到角色與最近工作站，而不是地板或 Logo。
- [ ] 玩家不閱讀底部句子也能知道可互動工作站。
- [ ] 角色向左、向右、向上與移動中狀態可辨識。
- [ ] 食材拿起時有明顯路徑，持有物不遮臉。
- [ ] 切菜與加熱使用不同粒子語彙。
- [ ] 料理完成、出餐、得分與連擊形成連續但不阻塞操作的回饋。
- [ ] 訂單新建、緊急、完成和失敗狀態不依賴文字。
- [ ] 動態效果不遮擋搖桿、操作鍵、計時及第一張訂單。
- [ ] `prefers-reduced-motion` 下仍能以瞬時亮度、圖示和位置變化理解狀態。
