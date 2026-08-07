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

    /*
     * MenuScene 時：
     * 讓 16:9 Stage 外側區域
     * 也延續 Loading_page_BG.png。
     *
     * 因此 19.5:9 / 20:9 手機
     * 不會在左右看到純黑色。
     */
    document.documentElement
      .style
      .setProperty(
        "--outer-bg-image",
        `url("${GameConfig.assets.loadingBackground}")`
      );

    document.documentElement
      .style
      .setProperty(
        "--outer-bg-color",
        "#101522"
      );


    this.sceneRoot.innerHTML = `

      <section
        class="app-scene menu-scene"
      >

        <!-- ===============================================
             Loading Page 背景延續
        ================================================ -->

        <img
          class="menu-background"
          src="${GameConfig.assets.loadingBackground}"
          alt=""
          draggable="false"
        >

        <div
          class="menu-background-blur"
        ></div>

        <div
          class="menu-background-shade"
        ></div>


        <!-- ===============================================
             Menu Content
        ================================================ -->

        <div
          class="menu-content"
        >

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

            <!-- ===========================================
                 STORY
            ============================================ -->

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


            <!-- ===========================================
                 ONLINE
            ============================================ -->

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


            <!-- ===========================================
                 EVENT
            ============================================ -->

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

                <div
                  class="mode-status"
                >

                  <span>
                    活動
                  </span>

                  <span>
                    尚未開始
                  </span>

                </div>


                <button
                  class="mode-button locked"
                  data-message="目前沒有進行中的限時活動"
                  type="button"
                >
                  查看活動
                </button>

              </div>

            </article>


            <!-- ===========================================
                 DLC
            ============================================ -->

            <article
              class="mode-card dlc"
            >

              <span
                class="mode-tag"
              >
                EXTRA
              </span>


              <div
                class="mode-art"
              >

                <div
                  class="mode-mark"
                >
                  +
                </div>

              </div>


              <h2>
                DLC
              </h2>


              <p>
                額外店面、全新地圖，
                以及更多特殊料理內容。
              </p>


              <div
                class="mode-footer"
              >

                <div
                  class="mode-status"
                >

                  <span>
                    內容
                  </span>

                  <span>
                    準備中
                  </span>

                </div>


                <button
                  class="mode-button locked"
                  data-message="DLC 內容仍在準備中"
                  type="button"
                >
                  查看內容
                </button>

              </div>

            </article>

          </div>


          <!-- =============================================
               Toast
          ============================================== -->

          <div
            class="mode-toast"
            data-toast
          ></div>

        </div>

      </section>

    `;


    /* =====================================================
       STORY
    ===================================================== */

    const storyButton =
      this.sceneRoot
        .querySelector(
          "[data-story-button]"
        );


    const onStory =
      () => {

        this.sceneManager
          .changeScene(
            "game"
          );

      };


    storyButton
      .addEventListener(
        "click",
        onStory
      );


    this.cleanups.push(
      () => {

        storyButton
          .removeEventListener(
            "click",
            onStory
          );

      }
    );


    /* =====================================================
       LOCKED MODES
    ===================================================== */

    const toast =
      this.sceneRoot
        .querySelector(
          "[data-toast]"
        );


    const lockedButtons =
      this.sceneRoot
        .querySelectorAll(
          ".mode-button.locked"
        );


    lockedButtons.forEach(
      button => {

        const handler =
          () => {

            toast.textContent =
              button.dataset.message ||
              "準備中";


            toast.classList.add(
              "visible"
            );


            clearTimeout(
              this.toastTimer
            );


            this.toastTimer =
              setTimeout(
                () => {

                  toast.classList.remove(
                    "visible"
                  );

                },
                1600
              );

          };


        button.addEventListener(
          "click",
          handler
        );


        this.cleanups.push(
          () => {

            button.removeEventListener(
              "click",
              handler
            );

          }
        );

      }
    );

  }


  /* =======================================================
     Exit
  ======================================================= */

  async exit(){

    /*
     * Menu → Game 時
     *
     * 移除 Loading BG 延伸。
     * Game 的 16:9 Stage 外圍
     * 改成 Three.js 場景接近的淡綠背景。
     */

    document.documentElement
      .style
      .setProperty(
        "--outer-bg-image",
        "none"
      );


    document.documentElement
      .style
      .setProperty(
        "--outer-bg-color",
        "#c6d7cf"
      );

  }


  /* =======================================================
     Destroy
  ======================================================= */

  destroy(){

    clearTimeout(
      this.toastTimer
    );


    this.toastTimer =
      null;


    this.cleanups
      .splice(
        0
      )
      .forEach(
        cleanup => {

          cleanup?.();

        }
      );

  }

}
