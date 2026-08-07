import {
  GameConfig
} from "../js/core/GameConfig.js";


export class MenuScene {

  constructor({
    sceneManager,
    sceneRoot
  }){

    this.sceneManager =
      sceneManager;

    this.sceneRoot =
      sceneRoot;

    this.cleanups =
      [];

    this.toastTimer =
      null;

  }

  async enter(){

    this.sceneRoot.innerHTML = `

      <section
        class="app-scene menu-scene"
      >

        <!--
          使用 Loading Page 相同背景。
          Menu 僅在 CSS 進行 Blur / Dark Overlay。
        -->

        <img
          class="menu-background"
          src="${GameConfig.assets.loadingBackground}"
          alt=""
          draggable="false"
        >

        <div
          class="menu-background-overlay"
        ></div>

        <div
          class="menu-background-vignette"
        ></div>


        <header
          class="menu-header"
        >

          <small>
            SUNNY PAW CAFÉ
          </small>

          <h1>
            選擇營業模式
          </h1>

        </header>


        <div
          class="mode-grid"
        >

          <!-- STORY -->

          <article
            class="mode-card story"
          >

            <span
              class="mode-tag"
            >
              第一章
            </span>

            <div
              class="mode-art"
            >

              <div
                class="mode-mark"
              >
                1-1
              </div>

            </div>

            <h2>
              故事模式
            </h2>

            <p>
              經營咖啡廳、完成關卡目標，
              逐步解鎖新餐點與全新店面。
            </p>

            <div
              class="mode-footer"
            >

              <div
                class="mode-status"
              >

                <span>
                  目前進度
                </span>

                <span>
                  1-1
                </span>

              </div>

              <button
                class="mode-button primary"
                data-story-button
                type="button"
              >
                進入故事
              </button>

            </div>

          </article>


          <!-- ONLINE -->

          <article
            class="mode-card online"
          >

            <span
              class="mode-tag"
            >
              CO-OP
            </span>

            <div
              class="mode-art"
            >

              <div
                class="mode-mark"
              >
                2P
              </div>

            </div>

            <h2>
              連線模式
            </h2>

            <p>
              與其他玩家組隊合作，
              一起完成高壓廚房挑戰。
            </p>

            <div
              class="mode-footer"
            >

              <div
                class="mode-status"
              >

                <span>
                  狀態
                </span>

                <span>
                  開發中
                </span>

              </div>

              <button
                class="mode-button locked"
                data-message="連線模式目前開發中"
                type="button"
              >
                尚未開放
              </button>

            </div>

          </article>


          <!-- EVENT -->

          <article
            class="mode-card event"
          >

            <span
              class="mode-tag"
            >
              EVENT
            </span>

            <div
              class="mode-art"
            >

              <div
                class="mode-mark"
              >
                EV
              </div>

            </div>

            <h2>
              限時活動
            </h2>

            <p>
              挑戰期間限定關卡，
              取得活動料理與特殊獎勵。
            </p>

            <div
              class="mode-footer"
            >
