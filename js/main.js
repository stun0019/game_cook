import {
  GameConfig
} from "./core/GameConfig.js";

import {
  AssetManager
} from "./core/AssetManager.js";

import {
  InputManager
} from "./core/InputManager.js";

import {
  SceneManager
} from "./core/SceneManager.js";


import {
  LoadingScene
} from "../scenes/LoadingScene.js";

import {
  MenuScene
} from "../scenes/MenuScene.js";

import {
  GameScene
} from "../scenes/GameScene.js";


/* =========================================================
   DOM
========================================================= */

const viewport =
  document.getElementById(
    "viewport"
  );

const stage =
  document.getElementById(
    "stage"
  );

const threeRoot =
  document.getElementById(
    "three-root"
  );

const sceneRoot =
  document.getElementById(
    "scene-root"
  );

const uiRoot =
  document.getElementById(
    "ui-root"
  );


/* =========================================================
   Dynamic Full Screen Stage

   基準：
   高度永遠使用 720 logical px。

   16:9
   1280 × 720

   20:9
   1600 × 720

   這樣不是把 1280 × 720 拉伸，
   而是真的增加左右可視範圍。
========================================================= */

function fitStage(){

  const visualWidth =
    window.visualViewport?.width ||
    window.innerWidth;

  const visualHeight =
    window.visualViewport?.height ||
    window.innerHeight;


  const viewportWidth =
    viewport.clientWidth ||
    visualWidth;

  const viewportHeight =
    viewport.clientHeight ||
    visualHeight;


  const availableWidth =
    Math.max(
      1,
      Math.min(
        viewportWidth,
        visualWidth
      )
    );

  const availableHeight =
    Math.max(
      1,
      Math.min(
        viewportHeight,
        visualHeight
      )
    );


  /*
   * 高度固定以 720 為 logical resolution。
   */

  const logicalHeight =
    GameConfig.logicalHeight;


  /*
   * 先讓 720 logical px
   * 剛好填滿裝置高度。
   */

  const scale =
    availableHeight /
    logicalHeight;


  /*
   * 根據實際螢幕比例反算
   * 這個裝置需要多少 logical width。
   *
   * 最低仍保留 1280。
   */

  const logicalWidth =
    Math.max(
      GameConfig.logicalWidth,

      availableWidth /
      scale
    );


  /*
   * Stage 本體真的變寬。
   */

  stage.style.width =
    `${logicalWidth}px`;

  stage.style.height =
    `${logicalHeight}px`;


  stage.dataset.logicalWidth =
    String(
      logicalWidth
    );

  stage.dataset.logicalHeight =
    String(
      logicalHeight
    );


  document.documentElement
    .style
    .setProperty(
      "--stage-logical-width",
      `${logicalWidth}px`
    );


  document.documentElement
    .style
    .setProperty(
      "--stage-logical-height",
      `${logicalHeight}px`
    );


  /*
   * Stage 高度剛好貼滿 viewport。
   *
   * Stage 寬度已依裝置比例動態計算，
   * 所以寬度也會剛好填滿。
   */

  stage.style.transform =
    `translate(-50%,-50%) scale(${scale})`;


  const metrics = {

    logicalWidth,

    logicalHeight,

    physicalWidth:
      availableWidth,

    physicalHeight:
      availableHeight,

    scale,

    aspect:
      logicalWidth /
      logicalHeight

  };


  /*
   * 讓新進入的 GameScene
   * 可以立即取得目前 Stage 尺寸。
   */

  window.__GAME_STAGE_METRICS__ =
    metrics;


  /*
   * 如果 GameScene 已經存在，
   * 通知 Three.js 更新 Renderer / Camera。
   */

  window.dispatchEvent(

    new CustomEvent(
      "game-stage-resize",
      {
        detail:
          metrics
      }
    )

  );

}


/* =========================================================
   Resize
========================================================= */

window.addEventListener(
  "resize",
  fitStage,
  {
    passive:true
  }
);


window.addEventListener(
  "orientationchange",
  () => {

    setTimeout(
      fitStage,
      160
    );

  },
  {
    passive:true
  }
);


if(
  window.visualViewport
){

  window.visualViewport
    .addEventListener(
      "resize",
      fitStage,
      {
        passive:true
      }
    );


  window.visualViewport
    .addEventListener(
      "scroll",
      fitStage,
      {
        passive:true
      }
    );

}


/*
 * Scene 建立前先完成一次
 * Stage 尺寸計算。
 */

fitStage();


/* =========================================================
   Core
========================================================= */

const assetManager =
  new AssetManager();


const input =
  new InputManager();


const sceneManager =
  new SceneManager({

    viewport,

    stage,

    threeRoot,

    sceneRoot,

    uiRoot,

    assetManager,

    input

  });


/* =========================================================
   Scene Register
========================================================= */

sceneManager

  .register(
    "loading",
    LoadingScene
  )

  .register(
    "menu",
    MenuScene
  )

  .register(
    "game",
    GameScene
  );


/* =========================================================
   Start
========================================================= */

sceneManager
  .changeScene(
    "loading"
  )
  .catch(
    error => {

      console.error(
        error
      );


      sceneRoot.innerHTML = `

        <section
          class="app-scene"
          style="
            display:flex;
            align-items:center;
            justify-content:center;
            background:#111a20;
            color:#fff;
            text-align:center;
            padding:40px;
          "
        >

          <div>

            <h1
              style="
                font-size:34px;
                margin-bottom:12px;
              "
            >
              遊戲初始化失敗
            </h1>

            <p
              style="
                font-size:16px;
                color:rgba(255,255,255,.72);
              "
            >
              請重新整理頁面後再試一次。
            </p>

          </div>

        </section>

      `;

    }
  );


/* =========================================================
   Cleanup
========================================================= */

window.addEventListener(
  "pagehide",
  () => {

    sceneManager.destroy();

  },
  {
    once:true
  }
);
