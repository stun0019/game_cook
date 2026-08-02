# 第四階段垂直切片交接規格

版本：1.0

適用範圍：第一關商用垂直切片，美術交付給助手 3，程式交付給助手 1。

規格優先級：本文件高於其他企劃文件及目前原型。任何歧義由主對話整合者裁決，助手不得自行擴充產品範圍。

## A. 使用者不可妥協要求

以下任一項未達成即禁止標記第四階段完成：

1. 玩家可見介面不得出現 Unicode Emoji。HUD、食材、訂單、按鈕、教學、提示、錯誤備援、旋轉畫面、CSS 偽元素、Canvas 文字及 SVG 文字全部適用。
2. 正式視覺圖示使用專案原創 SVG。SVG 不得引用系統 Emoji、外部字型、遠端圖片或第三方 Emoji 圖庫。
3. 玩家角色必須是原創柴犬主廚，不得保留人類主廚作為正式顯示或錯誤備援。
4. 柴犬主廚必須支援 N、NE、E、SE、S、SW、W、NW 八方向；停止移動時保留最後朝向。
5. 八方向切換不得在搖桿分界附近抖動；角色腳底、碰撞及手持狀態不得因換向跳位。
6. 廚房必須是下方開口的連續 U 型餐廳流理台。禁止分離、漂浮、四面描邊的工作台卡片。
7. 動線固定為左側備料、上側加工、右側組裝與出餐。角色只在 U 型內側及下方開口活動。
8. 工作站必須嵌入連續檯面，兩個轉角必須在檯面、櫥櫃、踢腳板、視覺及碰撞上連接。
9. 觸控控制區不得遮住任何站點、站點標籤、訂單、倒數、必要提示或必要行走路徑。
10. 第一單開始時玩家已手持完成的試吃漢堡，只需移動至出餐口並互動。成功後才啟動 60 秒倒數。
11. 第一關不扣分、不跑單、不銷毀錯餐。錯誤必須可在 2 秒內理解並修正。
12. 第一關具手動暫停、失焦自動暫停、音樂與音效設定、震動設定、減少動態、localStorage 保存、結算、重試及下一關入口。
13. 1280x720、960x540、844x390 三種指定尺寸必須全數通過本文件 F 節。
14. 不得修改本文件所列的他人責任檔案，不得 commit，不得 push。

## B. 助手 3 美術交付清單

### B1. 美術輸出根目錄與通則

助手 3 只新增或修改 `assets/art/stage4/` 下的檔案。

通則：

- SVG 使用 `viewBox`，不得只寫固定像素而缺少 `viewBox`。
- SVG 根節點不得包含 `<text>`、`<foreignObject>`、外部 `href` 或 base64 點陣圖。
- 色彩、描邊、陰影與圓角遵循同一視覺系統；1 倍顯示不得出現半像素裂縫。
- 角色與食材保留透明背景。U 型流理台基底保留外圍透明區。
- 所有檔名固定小寫 ASCII 及連字號，不得產生帶空格或版本尾碼的重複檔案。
- 每個素材需列入 `assets/art/stage4/manifest.json`，包含 `id`、`path`、`viewBox`、`nominalWidth`、`nominalHeight`、`category`。

### B2. 八方向柴犬主廚

以下 8 個檔案全部必交，規格皆為 `viewBox="0 0 160 180"`，名義尺寸 160x180：

| 方向 | 精確檔名 | 視角 |
|---|---|---|
| N | `assets/art/stage4/chef/chef-shiba-n.svg` | 背面 |
| NE | `assets/art/stage4/chef/chef-shiba-ne.svg` | 後方四分之三，朝右 |
| E | `assets/art/stage4/chef/chef-shiba-e.svg` | 右側面 |
| SE | `assets/art/stage4/chef/chef-shiba-se.svg` | 前方四分之三，朝右 |
| S | `assets/art/stage4/chef/chef-shiba-s.svg` | 正面 |
| SW | `assets/art/stage4/chef/chef-shiba-sw.svg` | 前方四分之三，朝左 |
| W | `assets/art/stage4/chef/chef-shiba-w.svg` | 左側面 |
| NW | `assets/art/stage4/chef/chef-shiba-nw.svg` | 後方四分之三，朝左 |

角色資產共同限制：

- 腳底中心固定在 `(80,164)`，八方向誤差不得超過 2 個 viewBox 單位。
- 主要角色內容安全區為 `x=24..136`、`y=8..168`。帽頂、耳朵、尾巴及手臂不得超出安全區。
- 柴犬辨識特徵固定為三角耳、奶油色口鼻、捲尾、白色主廚帽、紅色圍巾與暖色圍裙。
- 八方向共用相同視覺高度、頭身比、地面陰影中心與碰撞暗示。不得因側面視角縮短整體角色。
- SVG 群組 ID 固定提供 `shadow`、`body-back`、`body`、`arm-far`、`arm-near`。程式以獨立 DOM 疊加手持物，不要求 SVG 內含食物。
- 可由原創稿鏡像產生左右視角，但輸出仍須是 8 個獨立檔案，且圍巾結、尾巴與手部遮擋需人工檢查。

### B3. 手持物錨點與角色安全區

助手 3 必須依下表輸出角色姿勢。錨點使用 160x180 viewBox 座標，程式接口由 C2 實作。

| 方向 | 錨點 `(x,y)` | 圖層 | 食物最大外框 |
|---|---|---|---|
| N | `(80,86)` | `body` 後、`arm-near` 前 | `68x48` |
| NE | `(93,90)` | `body` 後、`arm-near` 前 | `68x48` |
| E | `(101,97)` | `body` 前 | `68x48` |
| SE | `(93,104)` | `body` 前 | `68x48` |
| S | `(80,108)` | `body` 前 | `68x48` |
| SW | `(67,104)` | `body` 前 | `68x48` |
| W | `(59,97)` | `body` 前 | `68x48` |
| NW | `(67,90)` | `body` 後、`arm-near` 前 | `68x48` |

驗收限制：

- 麵包、番茄、肉排與完成漢堡在八方向都需接觸至少一隻手掌，不可漂浮。
- 手持物不得遮住雙眼面積超過 20%，不得穿過帽子、腳底或角色外框。
- N、NE、NW 的遠側物品可被身體遮擋，但仍需露出足以辨識的部分。
- 相鄰方向切換時，錨點路徑不得穿越角色頭頂。

### B4. U 型連續流理台視覺組件

| 精確檔名 | viewBox | 名義尺寸 | 用途 |
|---|---|---:|---|
| `assets/art/stage4/kitchen/kitchen-u-counter-base.svg` | `0 0 1200 620` | 1200x620 | 連續檯面、左右轉角、底櫃、櫃門、踢腳板與整體陰影，不含設備與文字 |
| `assets/art/stage4/kitchen/station-prep-bin.svg` | `0 0 120 96` | 120x96 | 左側原料嵌入盒，共用基底 |
| `assets/art/stage4/kitchen/station-cutting-inset.svg` | `0 0 160 104` | 160x104 | 上側嵌入砧板區 |
| `assets/art/stage4/kitchen/station-pan-inset.svg` | `0 0 160 104` | 160x104 | 上側嵌入爐台與煎鍋區 |
| `assets/art/stage4/kitchen/station-ready-tray.svg` | `0 0 140 96` | 140x96 | 上側現成品與暫放區 |
| `assets/art/stage4/kitchen/station-assembly-inset.svg` | `0 0 150 104` | 150x104 | 右側嵌入組裝盤 |
| `assets/art/stage4/kitchen/station-service-inset.svg` | `0 0 150 104` | 150x104 | 右側嵌入出餐鈴與窗口 |
| `assets/art/stage4/kitchen/station-disassembly-inset.svg` | `0 0 120 96` | 120x96 | 右側垃圾與拆解區 |
| `assets/art/stage4/kitchen/station-focus-ring.svg` | `0 0 180 120` | 180x120 | 單一站點鄰近或教學高亮，不包含文字 |
| `assets/art/stage4/kitchen/station-progress-track.svg` | `0 0 160 24` | 160x24 | 加工進度底與完成狀態框 |

`kitchen-u-counter-base.svg` 的硬性安全區：

- 整體內容位於 `x=24..1176`、`y=16..604`。
- 上側檯面占 `x=96..1104`、`y=24..155`。
- 左側檯面占 `x=96..288`、`y=24..459`。
- 右側檯面占 `x=912..1104`、`y=24..459`。
- 內側活動開口至少為 `x=288..912`、`y=155..580`。
- 左上與右上轉角的檯面前緣、櫃門基線及踢腳板必須連續，接縫視覺誤差不得超過 2 個 viewBox 單位。
- 不得將工作站畫成各自完整四面框、獨立底櫃或大面積浮動陰影。

### B5. 食材與餐點 SVG

以下均使用 `viewBox="0 0 96 96"`，名義尺寸 96x96，透明背景：

- `assets/art/stage4/food/food-bun.svg`
- `assets/art/stage4/food/food-tomato-raw.svg`
- `assets/art/stage4/food/food-tomato-chopped.svg`
- `assets/art/stage4/food/food-meat-raw.svg`
- `assets/art/stage4/food/food-meat-cooked.svg`
- `assets/art/stage4/food/food-burger-complete.svg`
- `assets/art/stage4/food/food-placeholder.svg`

生食、熟食及加工後狀態須同時用輪廓與細節區分，不得只靠色相。`food-placeholder.svg` 是素材載入失敗的唯一圖像備援，不含文字與 Emoji。

### B6. UI SVG 與狀態

所有 UI 圖示使用 `viewBox="0 0 64 64"`，名義尺寸 64x64，除非表格另列尺寸：

| 精確檔名 | 狀態或用途 |
|---|---|
| `assets/art/stage4/ui/ui-hud-star.svg` | 星級與分數 |
| `assets/art/stage4/ui/ui-hud-clock.svg` | 剩餘時間 |
| `assets/art/stage4/ui/ui-pause.svg` | 暫停 |
| `assets/art/stage4/ui/ui-music-on.svg` | 音樂開啟 |
| `assets/art/stage4/ui/ui-music-off.svg` | 音樂關閉 |
| `assets/art/stage4/ui/ui-sound-on.svg` | 音效開啟 |
| `assets/art/stage4/ui/ui-sound-off.svg` | 音效關閉 |
| `assets/art/stage4/ui/ui-vibration-on.svg` | 震動開啟 |
| `assets/art/stage4/ui/ui-vibration-off.svg` | 震動關閉 |
| `assets/art/stage4/ui/ui-motion-on.svg` | 一般動態 |
| `assets/art/stage4/ui/ui-motion-reduced.svg` | 減少動態 |
| `assets/art/stage4/ui/ui-interact.svg` | 情境互動 |
| `assets/art/stage4/ui/ui-discard.svg` | 丟棄或拆解 |
| `assets/art/stage4/ui/ui-direction-arrow.svg` | 教學路徑方向 |
| `assets/art/stage4/ui/ui-state-ready.svg` | 可拿取或完成 |
| `assets/art/stage4/ui/ui-state-error.svg` | 可修正錯誤 |
| `assets/art/stage4/ui/ui-screen-rotate.svg` | 裝置旋轉提示 |
| `assets/art/stage4/ui/ui-retry.svg` | 重試 |
| `assets/art/stage4/ui/ui-next.svg` | 下一關 |
| `assets/art/stage4/ui/ui-back.svg` | 返回 |
| `assets/art/stage4/ui/ui-order-current.svg` | 當前訂單底板，`viewBox="0 0 240 112"`，名義尺寸 240x112 |
| `assets/art/stage4/ui/ui-order-waiting.svg` | 等待訂單底板，`viewBox="0 0 240 112"`，名義尺寸 240x112 |
| `assets/art/stage4/ui/ui-order-zero.svg` | 耐心歸零但保留的訂單底板，`viewBox="0 0 240 112"`，名義尺寸 240x112 |
| `assets/art/stage4/ui/ui-result-medal.svg` | 結算獎牌，`viewBox="0 0 160 160"`，名義尺寸 160x160 |

按鈕底板狀態另交付以下 8 個檔案，均為 `viewBox="0 0 240 80"`，名義尺寸 240x80：

- `assets/art/stage4/ui/ui-button-primary-idle.svg`
- `assets/art/stage4/ui/ui-button-primary-focus.svg`
- `assets/art/stage4/ui/ui-button-primary-pressed.svg`
- `assets/art/stage4/ui/ui-button-primary-disabled.svg`
- `assets/art/stage4/ui/ui-button-secondary-idle.svg`
- `assets/art/stage4/ui/ui-button-secondary-focus.svg`
- `assets/art/stage4/ui/ui-button-secondary-pressed.svg`
- `assets/art/stage4/ui/ui-button-secondary-disabled.svg`

UI 狀態限制：

- `idle`、`focus`、`pressed`、`disabled` 必須同尺寸、同內容安全區，切換不得造成文字或 hit area 位移。
- 狀態差異不得只靠顏色；至少同時改變外框、明暗、凹凸或圖形細節。
- 按鈕文字由 HTML 純文字提供，不得烘焙在 SVG 中。
- 所有 64x64 圖示內容安全區為 `x=8..56`、`y=8..56`，在 16 CSS px 顯示仍需可辨識。

### B7. 助手 3 完成交付定義

- B2 至 B6 每個精確檔名都存在且可獨立開啟。
- `assets/art/stage4/manifest.json` 可解析，條目無缺漏及重複 ID。
- 八方向角色腳底錨點、手持物位置及 U 型轉角均附 1280x720 合成預覽圖，但預覽圖放在 `assets/art/stage4/previews/`，不得由程式引用。
- 所有 SVG 通過 G 節機械檢查及人工原創、授權檢查。
- 不修改 `index.html`、`assets/game/`、`assets/audio/` 或任何非 `assets/art/stage4/` 檔案。

## C. 助手 1 程式交付清單

### C1. 程式責任檔案

助手 1 可修改或建立：

- `index.html`
- `assets/game/stage4.css`
- `assets/game/stage4.js`
- `assets/audio/stage4/` 下的正式音訊檔
- `scripts/check-stage4-assets.mjs`
- `scripts/check-no-emoji.mjs`

助手 1 只能讀取 `assets/art/stage4/`，不得修改其中任何檔案。

### C2. DOM、class 與 data-direction 接口

以下 DOM ID 與 class 為整合契約，不得自行改名：

```html
<main id="game" data-game-state="TITLE">
  <header id="hud"></header>
  <section id="kitchen-safe-area">
    <div id="u-counter" class="u-counter"></div>
    <button class="station" data-station="bun"></button>
    <button class="station" data-station="tomato"></button>
    <button class="station" data-station="meat"></button>
    <button class="station" data-station="board"></button>
    <button class="station" data-station="pan"></button>
    <button class="station" data-station="ready-tray"></button>
    <button class="station" data-station="assembly"></button>
    <button class="station" data-station="service"></button>
    <button class="station" data-station="disassembly"></button>
    <div id="chef" class="chef" data-direction="s">
      <img class="chef-sprite">
      <img id="held-item" class="held-item" data-item="none">
    </div>
  </section>
</main>
```

狀態接口：

- `#game[data-game-state]` 值固定為 `BOOT`、`TITLE`、`TUTORIAL_DELIVERY`、`PLAY_INTRO`、`PLAY_ACTIVE`、`PAUSED`、`FINAL_GRACE`、`RESULT`。
- `#chef[data-direction]` 值固定為小寫 `n`、`ne`、`e`、`se`、`s`、`sw`、`w`、`nw`。
- `.station` 可用 class 固定為 `is-near`、`is-guide`、`is-processing`、`is-ready`、`is-error`、`is-disabled`。
- `#held-item[data-item]` 值固定為 `none`、`bun`、`tomato-raw`、`tomato-chopped`、`meat-raw`、`meat-cooked`、`burger-complete`。
- 圖片路徑只由資料映射產生，不得在多個事件函式中散落硬編碼。
- 純裝飾 SVG 使用空 `alt` 及 `aria-hidden="true"`；有功能的按鈕以純文字 `aria-label` 描述。

### C3. 八方向角度、遲滯與停止保留

畫面座標為右方正 X、下方正 Y，以 `atan2(y,x)` 量化：

| 角度區間 | data-direction |
|---|---|
| `[-22.5, 22.5)` | `e` |
| `[22.5, 67.5)` | `se` |
| `[67.5, 112.5)` | `s` |
| `[112.5, 157.5)` | `sw` |
| `[157.5, 180]` 或 `[-180, -157.5)` | `w` |
| `[-157.5, -112.5)` | `nw` |
| `[-112.5, -67.5)` | `n` |
| `[-67.5, -22.5)` | `ne` |

實作規則：

- 搖桿向量長度小於 0.18 時停止移動且不改變 `data-direction`。
- 新方向需越過現有區段邊界 7.5 度並持續 60 ms 才切換。
- 輸入長度至少 0.55 且一次跨越至少兩個方向區段時立即切換。
- 鍵盤數位方向立即切換，不套用 60 ms 等待；雙鍵對角速度先正規化。
- 相反鍵同按時該軸為 0。總向量為 0 時停止並保留最後朝向。
- 碰撞阻止位移時仍保留玩家輸入方向；放開後保留該方向。
- 預設方向為 `s`。只有有效移動向量可以更新方向，互動、暫停、出餐及重試不得重設方向。
- 資產切換後角色腳底中心畫面位移不得超過 2 CSS px。

### C4. 手持物接口

程式使用 B3 固定錨點，不得從角色 SVG 外框動態推算：

```js
const HELD_ANCHOR = {
  n:  { x: 80,  y: 86,  layer: 'back'  },
  ne: { x: 93,  y: 90,  layer: 'back'  },
  e:  { x: 101, y: 97,  layer: 'front' },
  se: { x: 93,  y: 104, layer: 'front' },
  s:  { x: 80,  y: 108, layer: 'front' },
  sw: { x: 67,  y: 104, layer: 'front' },
  w:  { x: 59,  y: 97,  layer: 'front' },
  nw: { x: 67,  y: 90,  layer: 'back'  }
};
```

- 以 160x180 比例轉成 CSS 百分比，方向切換以 100 ms 內完成位置插值。
- 減少動態時立即切換，不插值。
- 切換圖層只能改變視覺堆疊，不得重建物品狀態或攔截 pointer event。
- 素材載入失敗使用 `food-placeholder.svg` 及純文字名稱，不得使用 Unicode 圖符。

### C5. U 型佈局、站點與碰撞

`#kitchen-safe-area` 使用置中 16:9 安全框：

```css
width: min(100vw, calc(100vh * 16 / 9));
height: calc(100vh - var(--hud-height));
```

若實際視窗比 16:9 更寬，左右多餘區域只放非互動背景，不得拉長 U 型動線。

U 型三段碰撞使用安全區百分比：

```text
top:   x 8..92,  y 4..25
left:  x 8..24,  y 4..74
right: x 76..92, y 4..74
```

站點中心固定為：

| data-station | 區域 | 中心 `(x%,y%)` |
|---|---|---|
| `bun` | 左備料 | `(16,17)` |
| `tomato` | 左備料 | `(16,38)` |
| `meat` | 左備料 | `(16,60)` |
| `board` | 上加工 | `(36,14)` |
| `pan` | 上加工 | `(53,14)` |
| `ready-tray` | 上加工 | `(69,14)` |
| `assembly` | 右完成 | `(84,30)` |
| `service` | 右完成 | `(84,51)` |
| `disassembly` | 右完成 | `(84,68)` |

硬性行為：

- U 型視覺基底、碰撞與站點使用同一個安全區座標系，不得分別以視窗和安全框定位。
- 角色碰撞是固定腳底膠囊，不隨八方向 SVG 外框改變。
- 上、左、右三個矩形碰撞取聯集，兩個轉角不得存在可穿越縫隙。
- 角色合法活動區為 U 型內側及下方開口；若尺寸重算後角色落在碰撞內，移至最近合法點。
- 站點 hit area 置於檯面內側前緣，互動距離以角色腳底至 hit area 最近點計算。
- 同時接近多站時只取最近站；新站需比舊站近至少 8 CSS px 或持續 80 ms 才切換，防止交界抖動。
- 觸控控制矩形加 8 CSS px 安全邊後，不得與站點、標籤或主流程最短路徑相交。

### C6. 素材引用

- 角色、U 型廚房、食材與 UI 只引用 `assets/art/stage4/manifest.json` 中存在的路徑。
- 禁止引用舊 `chef-rig.svg` 或任何人類角色 fallback。
- 禁止以 JavaScript 字串內 Unicode Emoji 作為圖示或食材字典。
- 圖片失敗處理集中於單一 loader；角色失敗使用原創柴犬輪廓 placeholder，食材失敗使用 `food-placeholder.svg`，UI 失敗使用純文字。
- 助手 1 不得修改、格式化或重新輸出 `assets/art/stage4/` 內 SVG。

### C7. 60 秒流程、不扣分與最後上菜

- `TUTORIAL_DELIVERY`：玩家手持完成漢堡，僅顯示試吃單及出餐引導，時間顯示 60 且不下降。
- 試吃單成功後進入 `PLAY_INTRO` 並啟動精確 60 秒單調時鐘。
- 固定順序：試吃漢堡、現成肉排堡、加工肉排堡、番茄堡、肉排堡；之後只交替兩種簡單堡。
- 正式倒數前 20 秒只顯示目前一單；第三單完成後才允許最多兩單。
- 剩餘 10 秒停止補單。第一關不生成豪華堡。
- 耐心歸零保留訂單、速度加分歸零、連擊歸零，不扣分、不跑單。
- 錯誤材料退回手上；錯誤完成餐點在組裝台可拆解，不扣分、不銷毀。
- 0 秒時若手持完成餐點或組裝台已有完成餐點，進入 5 秒 `FINAL_GRACE`；只能移動和出餐。
- 計分與星級固定為：每單 100，速度加分 0 至 50，第二連擊加 25，第三連擊起加 50，首次加工教學加 25；星級門檻 100、350、600。

### C8. 暫停、失焦、音效與震動

- `Escape`、暫停按鈕、`visibilitychange`、`pagehide`、`blur` 均可進入 `PAUSED`。
- 失焦只暫停一次；重新可見不得自動恢復，需玩家按繼續。
- 暫停凍結正式倒數、最後上菜、耐心、加工、連擊獎勵與遊戲動畫邏輯。
- 加工工作保存 `remainingMs`，不得讓背景 `setTimeout` 直接完成。
- 音訊需有音樂、取放、加工開始、加工循環、加工完成、錯誤、出餐、連擊、倒數及結算事件。
- 音樂與音效音量分開，預設 0.7 與 0.8；一鍵靜音保留原音量值。
- 震動預設開啟但可關閉；不支援 `navigator.vibrate` 時隱藏設定且不得報錯。
- 第一次使用者手勢後才建立或恢復音訊；瀏覽器拒絕自動播放時遊戲仍可靜音完成。
- 音訊檔放在 `assets/audio/stage4/`，檔名由 `audio-manifest.json` 集中映射，不得散落硬編碼。

### C9. localStorage 與結算重試

儲存鍵固定為 `stove-brawl.save.v1`，資料格式遵循 `docs/VERTICAL_SLICE_ACCEPTANCE.md` 第 10 節。

- 只保存最高星數、最高分、最高連擊、解鎖、教學完成與設定，不保存進行中單局。
- 壞 JSON、未知版本、儲存被拒或配額不足時使用記憶體預設值繼續，不阻斷遊戲。
- 每局建立唯一 `runId`；舊局計時器、加工、動畫及音效回呼不得修改新局。
- 結算只執行一次，顯示星級、總分、完成數、最快一單、最高連擊、重試及下一關。
- 重試清除局內狀態但保留設定與最佳成績；500 ms 內回到可操作的試吃單。

### C10. 助手 1 完成交付定義

- C2 至 C9 全部完成，無人類角色、Emoji fallback、分離工作台或 90 秒舊流程殘留。
- 通過 `scripts/check-no-emoji.mjs` 與 `scripts/check-stage4-assets.mjs`。
- 通過 `docs/VERTICAL_SLICE_ACCEPTANCE.md` 的 E01 至 E29、D01 至 D18、L01 至 L14。
- 通過本文件 F 節三尺寸矩陣。
- 不修改 `assets/art/stage4/` 或本文件，不 commit，不 push。

## D. 禁止互相覆蓋的檔案責任邊界

| 路徑 | 唯一負責人 | 另一助手權限 |
|---|---|---|
| `assets/art/stage4/**` | 助手 3 | 助手 1 唯讀，不得格式化、優化或改名 |
| `index.html` | 助手 1 | 助手 3 不得修改 |
| `assets/game/stage4.css` | 助手 1 | 助手 3 不得修改 |
| `assets/game/stage4.js` | 助手 1 | 助手 3 不得修改 |
| `assets/audio/stage4/**` | 助手 1 | 助手 3 不得修改 |
| `scripts/check-stage4-assets.mjs` | 助手 1 | 助手 3 唯讀 |
| `scripts/check-no-emoji.mjs` | 助手 1 | 助手 3 唯讀 |
| `docs/STAGE4_HANDOFF_SPEC.md` | 主對話整合者 | 助手 1、3 均不得修改 |

共同規則：

- 既有 `assets/art/` 根目錄舊素材視為凍結，不作第四階段正式引用，也不由兩位助手修改。
- 若需要更改接口或檔名，先回報主對話，不可在自己的責任區建立同名替代規格。
- 不得執行全專案格式化、搬移或清理，避免覆蓋他人尚未提交的工作。
- 交付時只回報新增或修改清單、驗證結果與已知風險，不 commit，不 push。

## E. 整合順序

1. 主對話凍結本文件並通知兩位助手檔案邊界。
2. 助手 3 先建立完整 `assets/art/stage4/` 結構、八方向柴犬、U 型基底、站點、食材、UI 與 manifest。
3. 助手 1 可並行建立狀態機、計時、暫停、保存及測試腳本，但先使用與正式檔名相同的純 CSS placeholder，不得寫入美術目錄。
4. 助手 3 通過素材存在、viewBox、零 Emoji 與合成預覽檢查後，回報素材凍結。
5. 助手 1 讀取 manifest 接上正式素材，完成 DOM、八方向、手持錨點、U 型碰撞及所有流程。
6. 助手 1 先跑 G 節機械檢查，再跑 F 節三尺寸矩陣。
7. 主對話整合者依 F 節截圖、錄影及除錯覆蓋圖驗收，不直接修改助手 3 素材；美術問題退回助手 3，程式問題退回助手 1。
8. E01 至 E29、D01 至 D18、L01 至 L14 全通過後，才進入商用垂直切片出貨判定。

## F. 指定解析度驗收矩陣

共同設定：瀏覽器縮放 100%，裝置像素比另記錄但以 CSS px 驗收。每個尺寸都要保存無高亮截圖、站點 hit area 除錯截圖、碰撞路徑錄影、八方向持物錄影及完整第一關錄影。

| 項目 | 1280x720 | 960x540 | 844x390 |
|---|---|---|---|
| 16:9 安全框 | 填滿 1280x720；HUD 與廚房共用左右邊界 | 填滿 960x540；不得以縮圖方式使文字不可讀 | 安全框寬約 693、高 390並置中；兩側餘區只放非互動背景 |
| U 型輪廓 | 三段、兩轉角、櫥櫃及下方開口完整 | 轉角接縫不超過 2 CSS px，無漂浮站點 | U 型仍一眼可辨，左備料、上加工、右完成順序不變 |
| 內側活動區 | 最窄路徑至少 1.4 倍角色碰撞直徑 | 角色可在轉角迴轉，不穿檯面 | 完成第一關不需走入控制按鈕下方 |
| 柴犬尺寸 | 顯示約 96x108 CSS px，可在合理範圍微調 | 顯示約 82x92 CSS px，腳底錨點固定 | 顯示約 72x81 CSS px，八方向仍可辨識 |
| 八方向切換 | D01 至 D18 全通過，腳底位移不超過 2 px | 相同，方向資產不得因縮放模糊 | 搖桿邊界遲滯有效，停止保留方向 |
| 手持物 | 八方向貼掌，不遮雙眼超過 20% | 食材輪廓仍清楚，不穿身體 | 最小食材仍可辨識且不與互動鍵重疊 |
| HUD | 訂單、分數、時間、暫停完整，零 Emoji | 文字不截斷；當前與等待單可區分 | 只保留必要 HUD；任何項目不得進入安全區外或互相重疊 |
| 觸控控制 | 可顯示但鍵盤模式可淡化，不改布局 | 所有 hit area 至少 44x44 px | 搖桿、互動、丟棄、暫停至少 44x44 px，含 8 px 安全邊後零遮擋 |
| 教學提示 | 單句提示不遮角色、站點或訂單 | 最多兩行且不改變工作區尺寸 | 最多兩行，位於 U 型下方開口中央，與控制區不相交 |
| 站點判定 | 每幀最多一個 `is-near` | 相鄰站點交界無反覆切換 | 手指遮擋下仍由設備高亮及文字確認目標 |
| 第一關流程 | 試吃單後精確 60 秒，暫停與最後上菜正確 | 重試 500 ms 內可操作 | 背景、旋轉、失焦恢復後時間及狀態正確 |
| 效能 | 目標 60 FPS，95 百分位幀時間不超過 20 ms | 目標 60 FPS，95 百分位不超過 24 ms | 最低 30 FPS，95 百分位不超過 33 ms |
| 零 Emoji | 執行期 DOM、偽元素及所有 fallback 為 0 | 同左 | 同左，並在 iOS 或 Android 真機抽測系統字型差異 |

任一列在任一尺寸失敗，即不通過第四階段。844x390 的置中安全框允許左右非互動背景留白，不允許將 U 型工作區橫向拉伸填滿。

## G. 可機械檢查的零 Emoji與素材存在規則

### G1. 零 Emoji 檢查

`scripts/check-no-emoji.mjs` 必須遞迴掃描以下正式執行檔案：

- `index.html`
- `assets/game/**/*.css`
- `assets/game/**/*.js`
- `assets/art/stage4/**/*.svg`
- `assets/art/stage4/**/*.json`

排除 `docs/`、`assets/art/stage4/previews/`、第三方套件與二進位音訊。掃描規則至少包含：

```js
const forbidden = /[\p{Extended_Pictographic}\uFE0F\u20E3]/gu;
```

腳本輸出要求：

- 命中時逐行輸出檔案、行號、欄位及 Unicode code point，exit code 為 1。
- 零命中時輸出 `PASS no visible emoji candidates`，exit code 為 0。
- 另以瀏覽器測試掃描可見文字節點、`alt`、`aria-label`、`title`、按鈕 value、Canvas 字串及 `::before`、`::after` 的 computed `content`。
- 任何正式素材載入失敗時再次掃描 DOM，確認 fallback 仍為零命中。

### G2. 素材存在與結構檢查

`scripts/check-stage4-assets.mjs` 以 `assets/art/stage4/manifest.json` 為唯一清單來源，必須檢查：

1. B2 至 B6 所列每個精確檔名都存在，大小大於 0，manifest 恰有一筆對應條目。
2. 每個 SVG 可解析，根節點具有與本文件一致的 `viewBox`。
3. SVG 不包含 `<text>`、`<foreignObject>`、外部 URL、base64 圖片或事件處理屬性。
4. 角色恰有 8 個方向，檔名集合嚴格等於 `n,ne,e,se,s,sw,w,nw`，不可缺少或多出正式方向。
5. UI 按鈕 `primary` 與 `secondary` 各具 `idle,focus,pressed,disabled` 四態。
6. `food-placeholder.svg` 存在，程式所有錯誤分支不得引用舊食材或 Unicode 圖符。
7. `index.html` 與 `assets/game/stage4.js` 的每個本機圖片引用都能解析到存在檔案，且正式角色不得引用 `chef-rig.svg`。
8. `kitchen-u-counter-base.svg` 只有一個正式基底引用；不得以舊 `.counter` 卡片背景拼裝正式 U 型廚房。

腳本輸出要求：

- 任一缺檔、重複 ID、viewBox 不符、禁止節點或非法引用都逐項列出並以 exit code 1 結束。
- 全部通過時輸出素材總數、角色方向數、UI 狀態數與 `PASS stage4 assets complete`，exit code 為 0。

### G3. 機械檢查完成門檻

以下命令都必須回傳 exit code 0：

```text
node scripts/check-no-emoji.mjs
node scripts/check-stage4-assets.mjs
```

機械檢查不能取代人工驗收。原創性、授權、U 型視覺連續、角色辨識、手持貼掌、方向抖動、控制遮擋與操作樂趣仍依 B、F 及 `docs/VERTICAL_SLICE_ACCEPTANCE.md` 驗收。
