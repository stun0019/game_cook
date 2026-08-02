# 暖陽小廚房｜商用美術規格

版本：1.0
適用範圍：遊戲場景、角色、食材與設備圖示、HUD、操作控制、動態回饋與商店宣傳截圖。
核心定位：明亮、溫暖、容易辨識的原創 2.5D 俯視料理遊戲；畫面先服務操作閱讀，再追求裝飾密度。

## 1. 視覺原則

1. **背景安靜、互動物醒目**：地板與牆面維持低對比；角色、食材、設備狀態與按鍵使用較高彩度。
2. **輪廓先於細節**：縮小至手機尺寸時，僅看剪影仍應辨認工作站、食材和角色動作。
3. **暖色為主、冷色分層**：奶油、烤麵包與番茄色建立食慾；薄荷與湖水藍用於清潔設備、正向狀態和資訊層。
4. **同功能同語彙**：可互動物具有一致描邊、接觸陰影、狀態光和動畫節奏。
5. **不可依賴單一顏色傳意**：危險、完成、鎖定等狀態須同時使用圖形、亮度或動態提示。

## 2. CSS 色彩 Token

以下 token 為程式端唯一建議色彩入口。新元件不得散落未命名的十六進位色值。

```css
:root {
  color-scheme: light;

  /* Brand / appetite */
  --art-cream-050: #fffaf0;
  --art-cream-100: #fff1d2;
  --art-cream-200: #f7dda7;
  --art-toast-300: #e9ad68;
  --art-toast-500: #c9783f;
  --art-tomato-400: #f26b5e;
  --art-tomato-500: #df5147;
  --art-tomato-700: #9f352f;

  /* Functional accents */
  --art-mint-300: #86d8bb;
  --art-mint-500: #55b894;
  --art-mint-700: #267b65;
  --art-sky-300: #89d4de;
  --art-sky-500: #4da9bb;
  --art-blueberry-500: #626db5;
  --art-yolk-400: #ffd45e;
  --art-yolk-600: #e7a72e;

  /* Neutrals / outlines */
  --art-cocoa-950: #35251f;
  --art-cocoa-800: #54372d;
  --art-cocoa-600: #7a5545;
  --art-stone-500: #8c918c;
  --art-white: #ffffff;
  --art-black-alpha-12: rgb(53 37 31 / 12%);
  --art-black-alpha-24: rgb(53 37 31 / 24%);
  --art-black-alpha-42: rgb(53 37 31 / 42%);

  /* Semantic */
  --color-canvas: var(--art-cream-100);
  --color-floor-a: #d9bd8c;
  --color-floor-b: #cfb181;
  --color-surface: var(--art-cream-050);
  --color-surface-raised: var(--art-white);
  --color-ink: var(--art-cocoa-950);
  --color-ink-muted: var(--art-cocoa-600);
  --color-outline: var(--art-cocoa-800);
  --color-primary: var(--art-tomato-500);
  --color-primary-dark: var(--art-tomato-700);
  --color-success: var(--art-mint-500);
  --color-warning: var(--art-yolk-600);
  --color-danger: #cf3f3f;
  --color-info: var(--art-sky-500);

  /* Controls: required resting opacity */
  --control-joystick-alpha: 0.38;
  --control-joystick-active-alpha: 0.78;
  --control-action-alpha: 0.72;
  --control-action-active-alpha: 0.94;
}
```

### 色彩使用比例

- 60%：奶油白、淺木色、低對比地板。
- 25%：工作台櫃體、牆面和場景輔助色。
- 10%：番茄紅、薄荷綠等功能色。
- 5%：蛋黃黃、藍莓紫等獎勵與稀有狀態色。
- 大面積文字與背景對比至少 4.5:1；大型文字與圖示至少 3:1。

## 3. 字體與字級

優先使用具繁體中文完整字形、圓潤但不幼稚的無襯線字體。程式字體堆疊：

```css
:root {
  --font-ui: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
  --font-weight-regular: 500;
  --font-weight-strong: 750;
  --font-weight-display: 900;

  --text-xs: clamp(10px, 0.72vw + 5px, 13px);
  --text-sm: clamp(12px, 0.80vw + 6px, 15px);
  --text-md: clamp(14px, 0.92vw + 6px, 18px);
  --text-lg: clamp(18px, 1.35vw + 7px, 26px);
  --text-xl: clamp(26px, 2.35vw + 8px, 46px);
  --text-display: clamp(34px, 3.5vw + 8px, 68px);
}
```

- 工作站短標籤：`--text-sm`、字重 750，最多 6 個中文字。
- 訂單內容與計時：`--text-md` 至 `--text-lg`、字重 750–900。
- 結算數字與重要 CTA：`--text-xl` 或 `--text-display`。
- 正文行高 1.45–1.6；按鍵與短標籤行高 1.05–1.2。
- 禁止以描邊厚度超過字高 6% 的文字陰影補救低對比。

## 4. 2.5D 工作台結構

### 基本模組

- 以單一 `1u` 工作站模組建構；橫向遊戲基準 `1u = clamp(76px, 8.2vw, 126px)`。
- 標準檯面：寬 `1u`、視覺深度 `0.62u`、正面櫃體高度 `0.30u`。
- 大型設備可使用 `1.5u` 或 `2u`，但不可產生介於模組之間的零碎走道。
- 玩家可行走走道淨寬至少 `0.9u`；中央主走道建議 `1.2u–1.6u`。

### 視覺分層

每座工作台必須包含以下五層，由後至前：

1. 後緣或擋板：建立俯視方向，明度比檯面低 6–10%。
2. 檯面：主要互動面，保持最大且乾淨的形狀。
3. 設備／容器：比檯面高一級陰影，輪廓清楚。
4. 正面櫃體：使用短垂直面建立 2.5D 厚度。
5. 接觸陰影：向右下偏移，禁止純黑硬邊。

```css
:root {
  --unit-station: clamp(76px, 8.2vw, 126px);
  --station-radius: clamp(10px, 1.0vw, 18px);
  --station-outline: clamp(2px, 0.24vw, 4px);
  --station-depth: calc(var(--unit-station) * 0.30);
  --walkway-min: calc(var(--unit-station) * 0.90);
  --shadow-contact: 0 clamp(5px, 0.7vh, 10px) clamp(7px, 1.1vh, 16px) var(--art-black-alpha-24);
}
```

- 食材區、加工區、加熱區、組裝區、送餐區須以造型和小面積功能色同時區分。
- 互動高亮使用外圈、向上浮動 2–4 px 與短促亮光；禁止整座工作台持續閃爍。
- 工作流程建議由左至右或逆時針單向閱讀，避免玩家頻繁折返穿過中央島。

## 5. 角色比例與造型

- 基準為 **2.7 頭身**；可接受範圍 2.5–3.0 頭身。
- 頭部約佔全高 38–42%，帽子另增加 10–16% 視覺高度。
- 手掌直徑約為頭寬 18–22%，持有物不得完全遮住臉部或工作站狀態。
- 腳掌可縮短，但移動方向必須透過身體傾斜、腳步或圍裙擺動辨認。
- 角色在 1280×720 基準畫布上的高度建議 92–118 px；不得小於短邊的 12%。
- 角色描邊使用 `--color-outline`，外輪廓寬 2.5–4 px；內部線條為外輪廓的 55–70%。
- 膚色、髮型、體型和輔具需預留多樣化方案；不得只靠顏色區分職業或狀態。

## 6. 地板低對比紋理

- 地板負責空間方向，不負責吸引注意。
- 相鄰磚塊的明度差控制在 6–8%；彩度差不超過 10%。
- 基準磚塊尺寸為短邊的 7–10%，避免密集棋盤造成摩爾紋。
- 紋理細節透明度 3–7%；每 4–7 塊允許一個淡污漬、木節或麵粉痕跡。
- 角色活動區中央比邊緣亮 3–5%，可使用大範圍柔光，不使用明顯聚光燈圓圈。

```css
.kitchen-floor {
  background-color: var(--color-floor-a);
  background-image:
    linear-gradient(45deg, rgb(255 255 255 / 4%) 25%, transparent 25%),
    linear-gradient(-45deg, rgb(53 37 31 / 5%) 25%, transparent 25%);
  background-size: clamp(44px, 7vh, 72px) clamp(44px, 7vh, 72px);
}
```

## 7. 食材與設備圖示一致性

### 共用規格

- 統一使用左上主光、右下接觸陰影與 3/4 微俯視角。
- 圖示安全邊界為畫布寬高各 10%；主體佔畫布 70–82%。
- 每個圖示使用 2–4 個主要色階；高光面積不超過主體 18%。
- 外輪廓寬約為圖示尺寸 3%；內線為 1.5–2%。
- 同系列圖示的投影方向、模糊半徑和透視角不可變動。

### 食材狀態

- 生食：較高彩度、較柔軟高光。
- 加工完成：輪廓改變，搭配少量切面高光；不可只加文字。
- 熟食：色相向暖棕移動並加入蒸氣或焦痕；避免以全圖變暗表示。
- 燒焦／失敗：深棕焦邊、煙霧與警示符號三者至少使用兩項。

### 設備識別

- 砧板：寬而低、具切痕；鍋具：深色圓形受熱面；組裝台：淺色中央盤；出餐台：暖紅或金色邊緣。
- 設備關閉、進行中、完成三態需具備可見差異。
- 進度條放在設備前緣或上方，厚度不得低於 6 px；完成後停留至少 450 ms。

## 8. HUD、安全區與操作控制

### HUD 分區

- 頂部 HUD 建議佔可用短邊 10–12%，最高不超過 14%。
- 左上：品牌／關卡；中央：最多三張訂單；右上：時間與分數。
- 訂單卡第一張為 100% 尺寸，其後縮至 90–94%，並降低至 62–72% 不透明度。
- 不可把裝飾性 Logo 擴張到訂單閱讀區；遊戲進行時 Logo 可縮成圖章。

### 安全區 Token

```css
:root {
  --safe-top: max(env(safe-area-inset-top, 0px), 12px);
  --safe-right: max(env(safe-area-inset-right, 0px), 16px);
  --safe-bottom: max(env(safe-area-inset-bottom, 0px), 16px);
  --safe-left: max(env(safe-area-inset-left, 0px), 16px);

  --hud-height: clamp(64px, 11.5vh, 104px);
  --touch-min: 56px;
  --joystick-size: clamp(84px, 12.5vmin, 132px);
  --action-size: clamp(68px, 9.8vmin, 104px);
  --secondary-action-size: clamp(54px, 7.4vmin, 76px);
  --control-gap: clamp(12px, 2vw, 28px);
}

.hud {
  min-height: var(--hud-height);
  padding:
    var(--safe-top)
    var(--safe-right)
    10px
    var(--safe-left);
}

.joystick {
  left: var(--safe-left);
  bottom: var(--safe-bottom);
  width: var(--joystick-size);
  height: var(--joystick-size);
  opacity: var(--control-joystick-alpha); /* 38% */
}

.joystick:is(:active, .is-active) {
  opacity: var(--control-joystick-active-alpha);
}

.action-primary {
  right: var(--safe-right);
  bottom: var(--safe-bottom);
  width: var(--action-size);
  height: var(--action-size);
  opacity: var(--control-action-alpha); /* 72% */
}

.action-primary:is(:active, .is-active) {
  opacity: var(--control-action-active-alpha);
}
```

- **搖桿靜止透明度固定為 38%**；觸控時提高至 78%，並顯示拇指位移與方向刻度。
- **主要操作鍵靜止透明度固定為 72%**；觸控時提高至 94%。
- 主要操作鍵與次要丟棄鍵須有至少 18% 尺寸差；危險操作不可與主要操作使用同色同尺寸。
- 任何可點區不得小於 56×56 CSS px；視覺圖形可以較小，但點擊區需保持。
- 控制區不得覆蓋工作站標籤、進度條、角色持有物或出餐提示。

## 9. 動畫與回饋

| 事件 | 時長 | 規格 |
|---|---:|---|
| 按鍵按下 | 80–110 ms | 下沉 3–5 px、縮放至 96–98% |
| 按鍵回彈 | 120–180 ms | 回到 100%，可輕微超越至 102% |
| 工作站被選取 | 160–220 ms | 上浮 2–4 px、外圈亮起 |
| 切菜循環 | 320–450 ms | 2–3 次清楚節拍，工具不穿透檯面 |
| 翻鍋／加熱 | 450–650 ms | 食材拋起不超過鍋寬 45% |
| 料理完成 | 300–480 ms | `90% → 112% → 100%`，搭配 2–3 顆星光 |
| 加分數字 | 600–850 ms | 上移 18–28 px、末段淡出 |
| 警告脈衝 | 520–700 ms | 最多連續 3 次，之後改為常亮 |

- 移動動畫建議 10–12 fps 的玩具感步態，畫面更新仍保持裝置原生刷新率。
- 蒸氣、星光等循環特效同屏不超過 3 組，避免遮擋訂單和食材。
- 重要回饋同時使用位移、縮放或圖示，不以震動或聲音作為唯一訊號。
- 尊重減少動態偏好：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

## 10. 不同螢幕比例適配

基準畫布為 1280×720（16:9 橫向），所有重要內容依「可用安全矩形」排版，不依固定螢幕邊緣定位。

| 比例 | 版面策略 |
|---|---|
| 16:9、16:10 | 完整三張訂單、標準工作站間距與雙操作鍵 |
| 18:9–21:9 | 中央廚房維持 16:9 核心區；額外寬度只擴充走道與背景，不拉伸物件 |
| 4:3 | HUD 改為較緊密間距；次要訂單縮至 86–90%；中央島縮短 10–15% |
| 小型橫向裝置 | 工作站標籤只保留圖示和 2–4 字；次要按鍵可移到主鍵左上，但點擊區不得縮小 |
| 直向 | 商用版本應提供專用排版；若未製作，不以單純旋轉或非等比縮放替代 |

```css
.game-stage {
  --design-width: 1280;
  --design-height: 720;
  position: relative;
  width: min(100vw, calc(100vh * 16 / 9));
  height: min(100vh, calc(100vw * 9 / 16));
  container-type: size;
}

@media (max-aspect-ratio: 3 / 2) and (orientation: landscape) {
  :root {
    --hud-height: clamp(60px, 10.5vh, 88px);
    --unit-station: clamp(70px, 7.6vw, 106px);
  }
}

@media (min-aspect-ratio: 2 / 1) {
  .kitchen-core {
    width: min(100%, calc(100vh * 16 / 9));
    margin-inline: auto;
  }
}
```

- 禁止非等比拉伸角色、圖示或工作台。
- 超寬螢幕新增的空間應留給背景、走道或裝飾，不得增加玩家必須跨越的操作距離。
- HUD 與控制必須測試 1280×720、960×540、844×390、740×360、1024×768，以及至少一種含瀏海／圓角安全區的裝置。

## 11. 原創與商用授權原則

Pinterest 僅作為趨勢研究與視覺語言分析來源，不是可直接取用的素材庫。

### 禁止事項

- 不得下載、描圖、重製或切割 Pinterest 圖片作為遊戲素材。
- 不得複製特定作品的角色剪影、服裝、Logo、字標、關卡布局、設備造型、圖示組合或獨特配色比例。
- 不得以生成式工具要求「做成某位藝術家／某款遊戲完全相同的風格」。
- 不得因 Pin 標示「免費」就直接商用；必須追溯原始來源與實際授權條款。

### 可採用的研究方式

- 可歸納跨多個案例共同存在的抽象規律，例如大頭短身、低對比地板、左移動右操作及暖色食慾感。
- 每項最終資產必須重新設計輪廓、比例、細節、配色與動畫，並能保留草圖或製作歷程。
- 外購素材、字體、音效與外包交付物必須保存授權證明、作者、來源網址、購買日期與允許平台。

### 資產登記最低欄位

```text
asset_id | 檔名 | 作者/供應商 | 原始來源 | 授權類型 | 商用/改作/轉售限制 | 取得日期 | 專案用途 | 證明檔位置
```

- 自製資產標示 `original`，保留來源檔、草稿與匯出紀錄。
- 第三方素材未完成授權核對前只能放入隔離的 prototype 區，不得進入正式 build。
- 若來源或授權無法確認，預設不可商用並重新製作。

## 12. 交付與驗收清單

- [ ] 所有色彩均引用命名 token，沒有散落的臨時色值。
- [ ] 工作台具備檯面、正面厚度、設備與接觸陰影。
- [ ] 角色維持 2.5–3.0 頭身，縮小後仍能辨識方向和持有物。
- [ ] 地板相鄰色塊明度差不超過 8%。
- [ ] 食材與設備圖示使用同一光源、視角、描邊與安全邊界。
- [ ] HUD 位於安全區內，訂單、時間和分數無互相遮擋。
- [ ] 搖桿靜止為 38%，主要操作鍵靜止為 72%。
- [ ] 所有觸控區至少 56×56 CSS px。
- [ ] 動畫具備 reduced-motion 降級方案。
- [ ] 16:9、超寬、4:3 與小型橫向裝置均無拉伸或裁切重要資訊。
- [ ] 每項非自製資產都有可追溯的商用授權紀錄。
