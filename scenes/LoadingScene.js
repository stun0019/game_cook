import {
  GameConfig
} from "../js/core/GameConfig.js";


const sleep =
  ms =>
    new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );


export class LoadingScene {

  constructor({
    sceneManager,
    sceneRoot,
    assetManager
  }){

    this.sceneManager =
      sceneManager;

    this.sceneRoot =
      sceneRoot;

    this.assetManager =
      assetManager;

    this.alive =
      false;

    this.enterHandler =
      null;

  }

  async enter(){

    this.alive =
      true;

    this.sceneRoot.innerHTML = `

      <section
        class="app-scene loading-scene"
      >

        <img
          class="loading-background"
          src="${GameConfig.assets.loadingBackground}"
          alt=""
          draggable="false"
        >

        <div
          class="loading-shade"
        ></div>

        <div
          class="loading-progress"
        >

          <div
            class="loading-status"
          >

            <span
              data-loading-message
            >
              画像を読み込んでいます
            </span>

            <span
              data-loading-number
            >
              0%
            </span>

          </div>

          <div
            class="loading-track"
          >

            <div
              class="loading-bar"
              data-loading-bar
            ></div>

          </div>

          <button
            class="loading-enter"
            data-enter-button
            type="button"
            disabled
          >
            メニューへ
          </button>

        </div>

      </section>

    `;

    const message =
      this.sceneRoot.querySelector(
        "[data-loading-message]"
      );

    const number =
      this.sceneRoot.querySelector(
        "[data-loading-number]"
      );

    const bar =
      this.sceneRoot.querySelector(
        "[data-loading-bar]"
      );

    const enterButton =
      this.sceneRoot.querySelector(
        "[data-enter-button]"
      );

    let realProgress =
      0;

    let loadError =
      null;

    let finishedLoading =
      false;

    const loadPromise =
      this.assetManager
        .preload(
          GameConfig.assetManifest,
          progress => {

            realProgress =
              progress;

          }
        )
        .then(
          () => {

            realProgress =
              1;

            finishedLoading =
              true;

          }
        )
        .catch(
          error => {

            loadError =
              error;

            finishedLoading =
              true;

          }
        );

    const startTime =
      performance.now();

    const minimumDuration =
      1150;

    let displayedProgress =
      0;

    while(
      this.alive
    ){

      const elapsed =
        performance.now() -
        startTime;

      const timeProgress =
        Math.min(
          .92,

          elapsed /
          minimumDuration *
          .92
        );

      const target =
        loadError
          ? displayedProgress
          : Math.min(
              .98,
              Math.max(
                realProgress *
                .96,

                timeProgress
              )
            );

      displayedProgress +=
        (
          target -
          displayedProgress
        ) *
        .22;

      if(
        Math.abs(
          target -
          displayedProgress
        ) <
        .003
      ){

        displayedProgress =
          target;

      }

      this.updateProgress(
        displayedProgress,
        message,
        number,
        bar
      );

      if(
        finishedLoading &&
        elapsed >=
        minimumDuration
      ){

        break;

      }

      await sleep(
        24
      );

    }

    await loadPromise;

    if(
      !this.alive
    ){

      return;

    }

    if(
      loadError
    ){

      message.textContent =
        "背景画像を読み込めませんでした";

      message.classList.add(
        "loading-error"
      );

      number.textContent =
        "--";

      console.error(
        loadError
      );

      return;

    }

    this.updateProgress(
      1,
      message,
      number,
      bar
    );

    message.textContent =
      "準備完了";

    enterButton.disabled =
      false;

    enterButton.classList.add(
      "visible"
    );

    this.enterHandler =
      () => {

        this.sceneManager
          .changeScene(
            "menu"
          );

      };

    enterButton.addEventListener(
      "click",
      this.enterHandler,
      {
        once:true
      }
    );

  }

  updateProgress(
    progress,
    message,
    number,
    bar
  ){

    const value =
      Math.max(
        0,

        Math.min(
          100,

          Math.round(
            progress *
            100
          )
        )
      );

    bar.style.width =
      `${value}%`;

    number.textContent =
      `${value}%`;

    if(
      value < 20
    ){

      message.textContent =
        "画像を読み込んでいます";

    }
    else if(
      value < 42
    ){

      message.textContent =
        "食材を確認しています";

    }
    else if(
      value < 64
    ){

      message.textContent =
        "調理器具を準備しています";

    }
    else if(
      value < 84
    ){

      message.textContent =
        "キッチンを整えています";

    }
    else if(
      value < 100
    ){

      message.textContent =
        "まもなく開店です";

    }

  }

  async exit(){

    this.alive =
      false;

    await sleep(
      120
    );

  }

  destroy(){

    this.alive =
      false;

    this.enterHandler =
      null;

  }

}
