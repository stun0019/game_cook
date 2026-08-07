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
   1280 × 720 FIT
========================================================= */

function fitStage(){

  const visualWidth =
    window.visualViewport
      ?.width ||
    window.innerWidth;

  const visualHeight =
    window.visualViewport
      ?.height ||
    window.innerHeight;

  const availableWidth =
    Math.min(
      viewport.clientWidth,
      visualWidth
    );

  const availableHeight =
    Math.min(
      viewport.clientHeight,
      visualHeight
    );

  const scale =
    Math.min(

      availableWidth /
      GameConfig.logicalWidth,

      availableHeight /
      GameConfig.logicalHeight

    );

  stage.style.transform =
    `translate(-50%,-50%) scale(${scale})`;

}


window.addEventListener(
  "resize",
  fitStage,
  {
    passive:true
  }
);


window.addEventListener(
  "orientationchange",
  () =>
    setTimeout(
      fitStage,
      160
    ),
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
