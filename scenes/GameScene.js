import * as THREE
from "three";

import {
  GameConfig
} from "../js/core/GameConfig.js";


export class GameScene {

  constructor({
    sceneManager,
    threeRoot,
    uiRoot,
    input
  }){

    this.sceneManager =
      sceneManager;

    this.threeRoot =
      threeRoot;

    this.uiRoot =
      uiRoot;

    this.input =
      input;

    this.scene =
      null;

    this.camera =
      null;

    this.renderer =
      null;

    this.animationFrame =
      0;

    this.running =
      false;

    this.lastTime =
      0;

    this.player =
      null;

    this.heldAnchor =
      null;

    this.heldVisual =
      null;

    this.panContent =
      null;

    this.assemblyContent =
      null;

    this.obstacles =
      [];

    this.stationById =
      new Map();

    this.cleanups =
      [];

    this.hudRefreshTimer =
      0;

    this.recipes = [

      {
        name:
          "經典漢堡",

        result:
          "burger",

        ingredients:[
          "bun",
          "cookedMeat"
        ]
      },

      {
        name:
          "生菜漢堡",

        result:
          "lettuceBurger",

        ingredients:[
          "bun",
          "lettuce",
          "cookedMeat"
        ]
      },

      {
        name:
          "冰飲",

        result:
          "drink",

        ingredients:[
          "drink"
        ]
      }

    ];

    this.state =
      null;

  }

  async enter(){

    this.createState();

    this.createUI();

    this.createThreeScene();

    this.buildKitchen();

    this.createPlayer();

    this.bindControls();

    this.addOrder();
    this.addOrder();
    this.addOrder();

    this.renderOrders();

    this.updateHud();

    this.setMessage(
      "依照訂單開始準備餐點"
    );

    this.running =
      true;

    this.lastTime =
      performance.now();

    this.animationFrame =
      requestAnimationFrame(
        time =>
          this.loop(
            time
          )
      );

  }

  /* =======================================================
     State
  ======================================================= */

  createState(){

    this.state = {

      paused:false,

      ended:false,

      time:
        GameConfig
          .gameplay
          .duration,

      score:0,

      served:0,

      combo:0,

      maxCombo:0,

      held:null,

      nearestStation:
        null,

      panState:
        "empty",

      panTimer:0,

      assembly:[],

      orders:[],

      orderSpawnTimer:0,

      messageTimer:0,

      playerPosition:
        new THREE.Vector3(
          0,
          0,
          0
        )

    };

  }

  /* =======================================================
     UI
  ======================================================= */

  createUI(){

    this.uiRoot.innerHTML = `

      <div
        class="game-ui"
        data-game-ui
      >

        <div
          class="game-hud"
        >

          <div
            class="hud-stat hud-score"
          >

            <span
              class="hud-stat-label"
            >
              分數
            </span>

            <strong
              class="hud-stat-value"
              data-score
            >
              0
            </strong>

          </div>

          <div
            class="order-strip"
            data-order-strip
          ></div>

          <div
            class="hud-stat hud-time"
          >

            <span
              class="hud-stat-label"
            >
              時間
            </span>

            <strong
              class="hud-stat-value"
              data-time
            >
              75
            </strong>

          </div>

          <button
            class="pause-trigger"
            data-pause-trigger
            type="button"
            aria-label="暫停"
          >
            II
          </button>

          <div
            class="station-hint"
            data-station-hint
          ></div>

          <div
            class="game-message"
            data-game-message
          >
            依照訂單開始準備餐點
          </div>

        </div>

        <div
          class="touch-controls"
          data-touch-controls
        >

          <div
            class="touch-joystick"
            data-joystick
          >

            <div
              class="touch-stick"
              data-stick
            ></div>

          </div>

          <div
            class="touch-actions"
          >

            <button
              class="touch-button touch-discard"
              data-discard
              type="button"
            >
              丟棄
            </button>

            <button
              class="touch-button touch-interact"
              data-interact
              type="button"
            >
              互動
            </button>

          </div>

        </div>

        <div
          class="game-overlay is-hidden"
          data-pause-overlay
        >

          <div
            class="game-panel"
          >

            <h2>
              暫停營業
            </h2>

            <p>
              遊戲時間與訂單耐心已暫停。
            </p>

            <div
              class="panel-actions"
            >

              <button
                class="panel-button primary"
                data-resume
                type="button"
              >
                繼續營業
              </button>

              <button
                class="panel-button secondary"
                data-pause-menu
                type="button"
              >
                模式選單
              </button>

            </div>

          </div>

        </div>

        <div
          class="game-overlay is-hidden"
          data-result-overlay
        >

          <div
            class="game-panel"
          >

            <h2
              data-result-title
            >
              營業結束
            </h2>

            <p
              data-result-text
            ></p>

            <div
              class="panel-actions"
            >

              <button
                class="panel-button primary"
                data-retry
                type="button"
              >
                再玩一次
              </button>

              <button
                class="panel-button secondary"
                data-result-menu
                type="button"
              >
                模式選單
              </button>

            </div>

          </div>

        </div>

      </div>

    `;

    this.ui = {

      score:
        this.uiRoot.querySelector(
          "[data-score]"
        ),

      time:
        this.uiRoot.querySelector(
          "[data-time]"
        ),

      orderStrip:
        this.uiRoot.querySelector(
          "[data-order-strip]"
        ),

      message:
        this.uiRoot.querySelector(
          "[data-game-message]"
        ),

      stationHint:
        this.uiRoot.querySelector(
          "[data-station-hint]"
        ),

      pauseTrigger:
        this.uiRoot.querySelector(
          "[data-pause-trigger]"
        ),

      pauseOverlay:
        this.uiRoot.querySelector(
          "[data-pause-overlay]"
        ),

      resultOverlay:
        this.uiRoot.querySelector(
          "[data-result-overlay]"
        ),

      resultTitle:
        this.uiRoot.querySelector(
          "[data-result-title]"
        ),

      resultText:
        this.uiRoot.querySelector(
          "[data-result-text]"
        ),

      resume:
        this.uiRoot.querySelector(
          "[data-resume]"
        ),

      pauseMenu:
        this.uiRoot.querySelector(
          "[data-pause-menu]"
        ),

      retry:
        this.uiRoot.querySelector(
          "[data-retry]"
        ),

      resultMenu:
        this.uiRoot.querySelector(
          "[data-result-menu]"
        ),

      touchControls:
        this.uiRoot.querySelector(
          "[data-touch-controls]"
        ),

      joystick:
        this.uiRoot.querySelector(
          "[data-joystick]"
        ),

      stick:
        this.uiRoot.querySelector(
          "[data-stick]"
        ),

      discard:
        this.uiRoot.querySelector(
          "[data-discard]"
        ),

      interact:
        this.uiRoot.querySelector(
          "[data-interact]"
        )

    };

    if(
      window
        .matchMedia(
          "(pointer:coarse)"
        )
        .matches
    ){

      this.ui
        .touchControls
        .classList
        .add(
          "active"
        );

    }

  }

  /* =======================================================
     Three.js 基礎
  ======================================================= */

  createThreeScene(){

    this.scene =
      new THREE.Scene();

    this.scene.background =
      new THREE.Color(
        0xc6d7cf
      );

    this.scene.fog =
      new THREE.Fog(
        0xc6d7cf,
        15,
        24
      );

    const aspect =
      GameConfig.logicalWidth /
      GameConfig.logicalHeight;

    const viewHeight =
      GameConfig
        .camera
        .viewHeight;

    const viewWidth =
      viewHeight *
      aspect;

    this.camera =
      new THREE.OrthographicCamera(

        -viewWidth / 2,

        viewWidth / 2,

        viewHeight / 2,

        -viewHeight / 2,

        .1,

        50

      );

    this.camera.position.set(

      GameConfig
        .camera
        .position
        .x,

      GameConfig
        .camera
        .position
        .y,

      GameConfig
        .camera
        .position
        .z

    );

    this.camera.lookAt(

      GameConfig
        .camera
        .target
        .x,

      GameConfig
        .camera
        .target
        .y,

      GameConfig
        .camera
        .target
        .z

    );

    this.renderer =
      new THREE.WebGLRenderer({

        antialias:true,

        alpha:false,

        powerPreference:
          "high-performance"

      });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio ||
        1,

        1.5
      )
    );

    this.renderer.setSize(
      GameConfig.logicalWidth,
      GameConfig.logicalHeight,
      false
    );

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure =
      1.05;

    this.threeRoot.appendChild(
      this.renderer.domElement
    );

    const hemisphere =
      new THREE.HemisphereLight(
        0xfff6df,
        0x6b765e,
        2.35
      );

    this.scene.add(
      hemisphere
    );

    const keyLight =
      new THREE.DirectionalLight(
        0xffe4b8,
        2.4
      );

    keyLight.position.set(
      -5,
      10,
      7
    );

    this.scene.add(
      keyLight
    );

    const fillLight =
      new THREE.DirectionalLight(
        0xaad9ff,
        1.15
      );

    fillLight.position.set(
      8,
      6,
      -5
    );

    this.scene.add(
      fillLight
    );

  }

  /* =======================================================
     Kitchen
  ======================================================= */

  buildKitchen(){

    const floor =
      new THREE.Mesh(

        new THREE.PlaneGeometry(
          GameConfig
            .world
            .floorWidth,

          GameConfig
            .world
            .floorDepth
        ),

        new THREE.MeshStandardMaterial({
          color:0xd8b877,
          roughness:.92
        })

      );

    floor.rotation.x =
      -Math.PI / 2;

    floor.position.y =
      -.02;

    this.scene.add(
      floor
    );

    const grid =
      new THREE.GridHelper(
        18,
        18,
        0xb38d55,
        0xc9a96e
      );

    grid.position.y =
      .005;

    grid.scale.z =
      10 / 18;

    this.scene.add(
      grid
    );

    const topXs = [
      -6,
      -4.5,
      -3,
      -1.5,
      0,
      1.5,
      3,
      4.5,
      6
    ];

    topXs.forEach(
      x =>

        this.createCounter(
          x,
          -3.35,
          1.35,
          1.1
        )

    );

    [
      -1.7,
      0,
      1.7
    ]
    .forEach(
      z => {

        this.createCounter(
          -7.45,
          z,
          1.1,
          1.35
        );

        this.createCounter(
          7.45,
          z,
          1.1,
          1.35
        );

      }
    );

    [
      -1.5,
      0,
      1.5
    ]
    .forEach(
      x =>

        this.createCounter(
          x,
          3.35,
          1.35,
          1.1
        )

    );

    const stationDefinitions = [

      {
        id:"bun",
        label:"麵包",
        type:"bun",

        x:-6,
        z:-3.35,

        ix:-6,
        iz:-2.38
      },

      {
        id:"lettuce",
        label:"生菜",
        type:"lettuce",

        x:-4.5,
        z:-3.35,

        ix:-4.5,
        iz:-2.38
      },

      {
        id:"meat",
        label:"肉排",
        type:"rawMeat",

        x:-3,
        z:-3.35,

        ix:-3,
        iz:-2.38
      },

      {
        id:"board",
        label:"砧板",
        type:"board",

        x:-1.5,
        z:-3.35,

        ix:-1.5,
        iz:-2.38
      },

      {
        id:"pan",
        label:"煎台",
        type:"pan",

        x:1.5,
        z:-3.35,

        ix:1.5,
        iz:-2.38
      },

      {
        id:"drink",
        label:"飲料",
        type:"drinkStation",

        x:3,
        z:-3.35,

        ix:3,
        iz:-2.38
      },

      {
        id:"plate",
        label:"盤子",
        type:"plate",

        x:4.5,
        z:-3.35,

        ix:4.5,
        iz:-2.38
      },

      {
        id:"assembly",
        label:"組裝",
        type:"assembly",

        x:-7.45,
        z:0,

        ix:-6.42,
        iz:0
      },

      {
        id:"serve",
        label:"出餐",
        type:"serve",

        x:7.45,
        z:0,

        ix:6.42,
        iz:0
      },

      {
        id:"trash",
        label:"丟棄",
        type:"trash",

        x:0,
        z:3.35,

        ix:0,
        iz:2.38
      }

    ];

    stationDefinitions.forEach(
      definition =>

        this.createStation(
          definition
        )

    );

  }

  createCounter(
    x,
    z,
    width,
    depth
  ){

    const group =
      new THREE.Group();

    group.position.set(
      x,
      0,
      z
    );

    const body =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          width,
          .82,
          depth
        ),

        new THREE.MeshStandardMaterial({
          color:0xaa5d37,
          roughness:.82
        })

      );

    body.position.y =
      .41;

    group.add(
      body
    );

    const inset =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          width * .76,
          .48,
          depth + .03
        ),

        new THREE.MeshStandardMaterial({
          color:0x7e432f,
          roughness:.9
        })

      );

    inset.position.set(
      0,
      .38,
      depth > width
        ? 0
        : depth * .04
    );

    group.add(
      inset
    );

    const top =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          width + .08,
          .16,
          depth + .08
        ),

        new THREE.MeshStandardMaterial({
          color:0xef9b4a,
          roughness:.65
        })

      );

    top.position.y =
      .9;

    group.add(
      top
    );

    this.scene.add(
      group
    );

    this.obstacles.push({

      x,
      z,
      width,
      depth

    });

  }

  createStation(
    definition
  ){

    const group =
      new THREE.Group();

    group.position.set(
      definition.x,
      .99,
      definition.z
    );

    const prop =
      this.createStationProp(
        definition.type
      );

    group.add(
      prop
    );

    const label =
      this.createTextSprite(
        definition.label
      );

    label.position.set(
      0,
      1.05,
      0
    );

    group.add(
      label
    );

    this.scene.add(
      group
    );

    const station = {

      ...definition,

      group,

      content:
        new THREE.Group()

    };

    station.content.position.set(
      0,
      .32,
      0
    );

    group.add(
      station.content
    );

    if(
      definition.id ===
      "pan"
    ){

      this.panContent =
        station.content;

    }

    if(
      definition.id ===
      "assembly"
    ){

      this.assemblyContent =
        station.content;

    }

    this.stationById.set(
      definition.id,
      station
    );

  }

  createStationProp(
    type
  ){

    const group =
      new THREE.Group();

    if(
      type === "bun" ||
      type === "lettuce" ||
      type === "rawMeat"
    ){

      const tray =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            .82,
            .16,
            .62
          ),

          new THREE.MeshStandardMaterial({
            color:0xf3dfb2,
            roughness:.75
          })

        );

      tray.position.y =
        .08;

      group.add(
        tray
      );

      const food =
        this.createFoodMesh(
          type,
          .78
        );

      food.position.y =
        .28;

      group.add(
        food
      );

    }

    if(
      type ===
      "board"
    ){

      const board =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            .86,
            .12,
            .56
          ),

          new THREE.MeshStandardMaterial({
            color:0xd99b56,
            roughness:.82
          })

        );

      board.position.y =
        .08;

      group.add(
        board
      );

    }

    if(
      type ===
      "pan"
    ){

      const pan =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .38,
            .42,
            .12,
            24
          ),

          new THREE.MeshStandardMaterial({
            color:0x2b3b40,
            roughness:.5,
            metalness:.18
          })

        );

      pan.position.y =
        .09;

      group.add(
        pan
      );

      const handle =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            .58,
            .09,
            .12
          ),

          new THREE.MeshStandardMaterial({
            color:0x2b3b40,
            roughness:.55
          })

        );

      handle.position.set(
        .48,
        .09,
        0
      );

      group.add(
        handle
      );

    }

    if(
      type ===
      "drinkStation"
    ){

      const machine =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            .66,
            .78,
            .52
          ),

          new THREE.MeshStandardMaterial({
            color:0xd95645,
            roughness:.6
          })

        );

      machine.position.y =
        .39;

      group.add(
        machine
      );

      const front =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            .42,
            .26,
            .03
          ),

          new THREE.MeshStandardMaterial({
            color:0xf4e7d0,
            roughness:.5
          })

        );

      front.position.set(
        0,
        .47,
        .275
      );

      group.add(
        front
      );

    }

    if(
      type ===
      "plate"
    ){

      for(
        let index = 0;
        index < 3;
        index += 1
      ){

        const plate =
          new THREE.Mesh(

            new THREE.CylinderGeometry(
              .38,
              .43,
              .06,
              28
            ),

            new THREE.MeshStandardMaterial({
              color:0xf7f1e7,
              roughness:.48
            })

          );

        plate.position.y =
          .05 +
          index *
          .07;

        group.add(
          plate
        );

      }

    }

    if(
      type ===
      "assembly"
    ){

      const plate =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .44,
            .5,
            .08,
            28
          ),

          new THREE.MeshStandardMaterial({
            color:0xf7f1e7,
            roughness:.48
          })

        );

      plate.position.y =
        .05;

      group.add(
        plate
      );

    }

    if(
      type ===
      "serve"
    ){

      const bellBase =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .38,
            .43,
            .08,
            28
          ),

          new THREE.MeshStandardMaterial({
            color:0xe0aa35,
            roughness:.38,
            metalness:.35
          })

        );

      bellBase.position.y =
        .05;

      group.add(
        bellBase
      );

      const bell =
        new THREE.Mesh(

          new THREE.SphereGeometry(
            .3,
            24,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
          ),

          new THREE.MeshStandardMaterial({
            color:0xf3bd40,
            roughness:.3,
            metalness:.3
          })

        );

      bell.scale.y =
        .75;

      bell.position.y =
        .18;

      group.add(
        bell
      );

    }

    if(
      type ===
      "trash"
    ){

      const can =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .34,
            .4,
            .68,
            20
          ),

          new THREE.MeshStandardMaterial({
            color:0x748789,
            roughness:.72,
            metalness:.12
          })

        );

      can.position.y =
        .34;

      group.add(
        can
      );

      const rim =
        new THREE.Mesh(

          new THREE.TorusGeometry(
            .35,
            .045,
            10,
            24
          ),

          new THREE.MeshStandardMaterial({
            color:0x49595c,
            roughness:.6
          })

        );

      rim.rotation.x =
        Math.PI / 2;

      rim.position.y =
        .7;

      group.add(
        rim
      );

    }

    return group;

  }

  /* =======================================================
     Three.js 站點文字
  ======================================================= */

  createTextSprite(
    text
  ){

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      256;

    canvas.height =
      80;

    const context =
      canvas.getContext(
        "2d"
      );

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      "rgba(255,250,240,.94)";

    context.strokeStyle =
      "#33251f";

    context.lineWidth =
      8;

    this.roundCanvasRect(
      context,
      6,
      6,
      244,
      68,
      18
    );

    context.fill();
    context.stroke();

    context.fillStyle =
      "#26363b";

    context.font =
      "900 30px Microsoft JhengHei, sans-serif";

    context.textAlign =
      "center";

    context.textBaseline =
      "middle";

    context.fillText(
      text,
      128,
      41
    );

    const texture =
      new THREE.CanvasTexture(
        canvas
      );

    texture.colorSpace =
      THREE.SRGBColorSpace;

    const material =
      new THREE.SpriteMaterial({

        map:texture,

        transparent:true,

        depthTest:false

      });

    const sprite =
      new THREE.Sprite(
        material
      );

    sprite.scale.set(
      1.65,
      .52,
      1
    );

    sprite.renderOrder =
      20;

    return sprite;

  }

  roundCanvasRect(
    context,
    x,
    y,
    width,
    height,
    radius
  ){

    context.beginPath();

    context.roundRect(
      x,
      y,
      width,
      height,
      radius
    );

  }

  /* =======================================================
     Player
  ======================================================= */

  createPlayer(){

    const group =
      new THREE.Group();

    const body =
      new THREE.Mesh(

        new THREE.CylinderGeometry(
          .34,
          .42,
          .82,
          20
        ),

        new THREE.MeshStandardMaterial({
          color:0xfff8e9,
          roughness:.7
        })

      );

    body.position.y =
      .52;

    group.add(
      body
    );

    const apron =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          .38,
          .5,
          .05
        ),

        new THREE.MeshStandardMaterial({
          color:0xe45b45,
          roughness:.7
        })

      );

    apron.position.set(
      0,
      .52,
      .36
    );

    group.add(
      apron
    );

    const head =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          .31,
          24,
          18
        ),

        new THREE.MeshStandardMaterial({
          color:0xc97844,
          roughness:.75
        })

      );

    head.position.y =
      1.16;

    group.add(
      head
    );

    const hatBase =
      new THREE.Mesh(

        new THREE.CylinderGeometry(
          .38,
          .38,
          .18,
          24
        ),

        new THREE.MeshStandardMaterial({
          color:0xfffbef,
          roughness:.65
        })

      );

    hatBase.position.y =
      1.44;

    group.add(
      hatBase
    );

    const hatTop =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          .37,
          24,
          14,
          0,
          Math.PI * 2,
          0,
          Math.PI / 2
        ),

        new THREE.MeshStandardMaterial({
          color:0xfffbef,
          roughness:.65
        })

      );

    hatTop.scale.y =
      .72;

    hatTop.position.y =
      1.5;

    group.add(
      hatTop
    );

    this.heldAnchor =
      new THREE.Group();

    this.heldAnchor.position.set(
      .56,
      1.12,
      .08
    );

    group.add(
      this.heldAnchor
    );

    group.position.copy(
      this.state.playerPosition
    );

    this.scene.add(
      group
    );

    this.player =
      group;

  }

  /* =======================================================
     Food
  ======================================================= */

  createFoodMesh(
    type,
    scale = 1
  ){

    const group =
      new THREE.Group();

    group.scale.setScalar(
      scale
    );

    const material =
      color =>
        new THREE.MeshStandardMaterial({
          color,
          roughness:.68
        });

    if(
      type ===
      "bun"
    ){

      const bun =
        new THREE.Mesh(

          new THREE.SphereGeometry(
            .28,
            24,
            16
          ),

          material(
            0xe9ad56
          )

        );

      bun.scale.set(
        1.25,
        .62,
        1
      );

      bun.position.y =
        .08;

      group.add(
        bun
      );

    }

    if(
      type ===
      "lettuce"
    ){

      const lettuce =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .3,
            .32,
            .08,
            14
          ),

          material(
            0x6fac63
          )

        );

      lettuce.position.y =
        .04;

      group.add(
        lettuce
      );

    }

    if(
      type === "rawMeat" ||
      type === "cookedMeat"
    ){

      const meat =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .28,
            .3,
            .1,
            20
          ),

          material(
            type === "rawMeat"
              ? 0xd7554e
              : 0x80503b
          )

        );

      meat.position.y =
        .05;

      group.add(
        meat
      );

    }

    if(
      type ===
      "drink"
    ){

      const cup =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .17,
            .14,
            .42,
            16
          ),

          material(
            0xe45745
          )

        );

      cup.position.y =
        .21;

      group.add(
        cup
      );

      const lid =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .18,
            .18,
            .05,
            16
          ),

          material(
            0xfff1dc
          )

        );

      lid.position.y =
        .44;

      group.add(
        lid
      );

    }

    if(
      type === "burger" ||
      type === "lettuceBurger"
    ){

      const bottom =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .28,
            .3,
            .09,
            20
          ),

          material(
            0xd89140
          )

        );

      bottom.position.y =
        .045;

      group.add(
        bottom
      );

      const meat =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            .27,
            .29,
            .09,
            20
          ),

          material(
            0x80503b
          )

        );

      meat.position.y =
        .14;

      group.add(
        meat
      );

      let nextY =
        .23;

      if(
        type ===
        "lettuceBurger"
      ){

        const lettuce =
          new THREE.Mesh(

            new THREE.CylinderGeometry(
              .29,
              .3,
              .07,
              14
            ),

            material(
              0x6fac63
            )

          );

        lettuce.position.y =
          .23;

        group.add(
          lettuce
        );

        nextY =
          .31;

      }

      const top =
        new THREE.Mesh(

          new THREE.SphereGeometry(
            .29,
            24,
            16
          ),

          material(
            0xe9ad56
          )

        );

      top.scale.set(
        1.05,
        .52,
        1
      );

      top.position.y =
        nextY +
        .07;

      group.add(
        top
      );

    }

    return group;

  }

  /* =======================================================
     Input
  ======================================================= */

  bindControls(){

    this.cleanups.push(

      this.input.on(
        "interact",
        () =>
          this.interact()
      )

    );

    this.cleanups.push(

      this.input.on(
        "discard",
        () =>
          this.discard()
      )

    );

    this.cleanups.push(

      this.input.on(
        "pause",
        () =>
          this.togglePause()
      )

    );

    this.input.attachJoystick(
      this.ui.joystick,
      this.ui.stick
    );

    this.input.bindActionButton(
      this.ui.interact,
      "interact"
    );

    this.input.bindActionButton(
      this.ui.discard,
      "discard"
    );

    const pauseClick =
      () =>
        this.togglePause();

    const resumeClick =
      () =>
        this.resumeGame();

    const pauseMenuClick =
      () =>
        this.sceneManager
          .changeScene(
            "menu"
          );

    const retryClick =
      () =>
        this.sceneManager
          .changeScene(
            "game"
          );

    const resultMenuClick =
      () =>
        this.sceneManager
          .changeScene(
            "menu"
          );

    this.ui
      .pauseTrigger
      .addEventListener(
        "click",
        pauseClick
      );

    this.ui
      .resume
      .addEventListener(
        "click",
        resumeClick
      );

    this.ui
      .pauseMenu
      .addEventListener(
        "click",
        pauseMenuClick
      );

    this.ui
      .retry
      .addEventListener(
        "click",
        retryClick
      );

    this.ui
      .resultMenu
      .addEventListener(
        "click",
        resultMenuClick
      );

    this.cleanups.push(
      () =>
        this.ui
          .pauseTrigger
          .removeEventListener(
            "click",
            pauseClick
          )
    );

    this.cleanups.push(
      () =>
        this.ui
          .resume
          .removeEventListener(
            "click",
            resumeClick
          )
    );

    this.cleanups.push(
      () =>
        this.ui
          .pauseMenu
          .removeEventListener(
            "click",
            pauseMenuClick
          )
    );

    this.cleanups.push(
      () =>
        this.ui
          .retry
          .removeEventListener(
            "click",
            retryClick
          )
    );

    this.cleanups.push(
      () =>
        this.ui
          .resultMenu
          .removeEventListener(
            "click",
            resultMenuClick
          )
    );

  }

  /* =======================================================
     Main Loop
  ======================================================= */

  loop(
    time
  ){

    if(
      !this.running
    ){

      return;

    }

    const delta =
      Math.min(

        .05,

        (
          time -
          this.lastTime
        ) /
        1000 ||
        0

      );

    this.lastTime =
      time;

    if(
      !this.state.paused &&
      !this.state.ended
    ){

      this.update(
        delta,
        time
      );

    }

    this.renderer.render(
      this.scene,
      this.camera
    );

    this.animationFrame =
      requestAnimationFrame(
        nextTime =>
          this.loop(
            nextTime
          )
      );

  }

  update(
    delta,
    time
  ){

    this.updatePlayer(
      delta,
      time
    );

    this.updateOrders(
      delta
    );

    this.updateCooking(
      delta
    );

    this.state.orderSpawnTimer +=
      delta;

    if(
      this.state.orderSpawnTimer >=
        GameConfig
          .gameplay
          .orderSpawnInterval
      &&
      this.state.orders.length <
        GameConfig
          .gameplay
          .maxOrders
    ){

      this.state.orderSpawnTimer =
        0;

      this.addOrder();

      this.renderOrders();

    }

    if(
      this.state.messageTimer >
      0
    ){

      this.state.messageTimer -=
        delta;

      if(
        this.state.messageTimer <=
        0
      ){

        this.setMessage(

          this.state.held
            ? "前往下一個工作台繼續處理"
            : "依照訂單拿取需要的食材",

          0

        );

      }

    }

    this.state.time -=
      delta;

    if(
      this.state.time <=
      0
    ){

      this.state.time =
        0;

      this.endGame();

    }

    this.hudRefreshTimer +=
      delta;

    if(
      this.hudRefreshTimer >=
      .08
    ){

      this.hudRefreshTimer =
        0;

      this.updateHud();

      this.renderOrders();

    }

  }

  /* =======================================================
     Player Movement
  ======================================================= */

  updatePlayer(
    delta,
    time
  ){

    const movement =
      this.input.getMovement();

    const length =
      Math.hypot(
        movement.x,
        movement.y
      );

    if(
      length >
      .001
    ){

      const speed =
        GameConfig
          .gameplay
          .playerSpeed;

      const current =
        this.state
          .playerPosition;

      const nextX =
        current.x +
        movement.x *
        speed *
        delta;

      const nextZ =
        current.z +
        movement.y *
        speed *
        delta;

      if(
        !this.collides(
          nextX,
          current.z
        )
      ){

        current.x =
          THREE.MathUtils.clamp(

            nextX,

            GameConfig
              .world
              .minX,

            GameConfig
              .world
              .maxX

          );

      }

      if(
        !this.collides(
          current.x,
          nextZ
        )
      ){

        current.z =
          THREE.MathUtils.clamp(

            nextZ,

            GameConfig
              .world
              .minZ,

            GameConfig
              .world
              .maxZ

          );

      }

      this.player.rotation.y =
        Math.atan2(
          movement.x,
          movement.y
        );

      this.player.position.y =
        Math.sin(
          time *
          .016
        ) *
        .035;

    }
    else{

      this.player.position.y =
        THREE.MathUtils.lerp(
          this.player.position.y,
          0,
          .18
        );

    }

    this.player.position.x =
      this.state
        .playerPosition
        .x;

    this.player.position.z =
      this.state
        .playerPosition
        .z;

    this.updateNearestStation();

  }

  collides(
    x,
    z
  ){

    const radius =
      GameConfig
        .gameplay
        .playerRadius;

    return this.obstacles.some(
      obstacle => {

        return (

          Math.abs(
            x -
            obstacle.x
          ) <
          obstacle.width /
          2 +
          radius

          &&

          Math.abs(
            z -
            obstacle.z
          ) <
          obstacle.depth /
          2 +
          radius

        );

      }
    );

  }

  updateNearestStation(){

    let nearest =
      null;

    let nearestDistance =
      Infinity;

    this.stationById.forEach(
      station => {

        const distance =
          Math.hypot(

            this.state
              .playerPosition
              .x -
            station.ix,

            this.state
              .playerPosition
              .z -
            station.iz

          );

        if(
          distance <
          nearestDistance
        ){

          nearestDistance =
            distance;

          nearest =
            station;

        }

      }
    );

    if(
      nearest &&
      nearestDistance <=
        GameConfig
          .gameplay
          .interactionDistance
    ){

      this.state.nearestStation =
        nearest.id;

      this.ui
        .stationHint
        .textContent =
          `互動：${nearest.label}`;

      this.ui
        .stationHint
        .classList
        .add(
          "visible"
        );

    }
    else{

      this.state.nearestStation =
        null;

      this.ui
        .stationHint
        .classList
        .remove(
          "visible"
        );

    }

  }

  /* =======================================================
     Orders
  ======================================================= */

  updateOrders(
    delta
  ){

    this.state.orders.forEach(
      (
        order,
        index
      ) => {

        order.patience -=
          delta *
          (
            index === 0
              ? 4.1
              : 2
          );

      }
    );

    if(
      this.state.orders[0]
        ?.patience <= 0
    ){

      this.state.orders.shift();

      this.state.combo =
        0;

      this.state.score =
        Math.max(
          0,
          this.state.score -
          60
        );

      this.addOrder();

      this.setMessage(
        "客人等不及離開了"
      );

      this.renderOrders();

    }

  }

  /* =======================================================
     Cooking
  ======================================================= */

  updateCooking(
    delta
  ){

    if(
      this.state.panState !==
      "cooking"
    ){

      return;

    }

    this.state.panTimer -=
      delta;

    if(
      this.state.panTimer <=
      0
    ){

      this.state.panTimer =
        0;

      this.state.panState =
        "done";

      this.refreshPanVisual();

      this.setMessage(
        "肉排烹調完成"
      );

    }

  }

  /* =======================================================
     Interaction
  ======================================================= */

  interact(){

    if(
      this.state.paused ||
      this.state.ended
    ){

      return;

    }

    const stationId =
      this.state
        .nearestStation;

    if(
      !stationId
    ){

      this.setMessage(
        "請再靠近工作台"
      );

      return;

    }

    const station =
      this.stationById.get(
        stationId
      );

    if(
      [
        "bun",
        "lettuce",
        "meat",
        "drink"
      ]
      .includes(
        station.id
      )
    ){

      if(
        this.state.held
      ){

        this.setMessage(
          "手上已經有物品"
        );

        return;

      }

      const item =
        station.id ===
        "meat"
          ? "rawMeat"
          : station.id;

      this.setHeld(
        item
      );

      this.setMessage(
        `已拿取${station.label}`
      );

      return;

    }

    if(
      station.id ===
      "pan"
    ){

      if(
        this.state.held ===
          "rawMeat"
        &&
        this.state.panState ===
          "empty"
      ){

        this.setHeld(
          null
        );

        this.state.panState =
          "cooking";

        this.state.panTimer =
          GameConfig
            .gameplay
            .panCookTime;

        this.refreshPanVisual();

        this.setMessage(
          "肉排開始烹調"
        );

        return;

      }

      if(
        this.state.panState ===
          "done"
        &&
        !this.state.held
      ){

        this.state.panState =
          "empty";

        this.state.panTimer =
          0;

        this.refreshPanVisual();

        this.setHeld(
          "cookedMeat"
        );

        this.setMessage(
          "已拿起熟肉排"
        );

        return;

      }

      this.setMessage(

        this.state.panState ===
        "cooking"

          ? "肉排仍在烹調"

          : "需要先放入生肉排"

      );

      return;

    }

    if(
      station.id ===
      "assembly"
    ){

      if(
        ![
          "bun",
          "lettuce",
          "cookedMeat"
        ]
        .includes(
          this.state.held
        )
      ){

        this.setMessage(
          "請放入可組裝食材"
        );

        return;

      }

      this.state.assembly.push(
        this.state.held
      );

      this.setHeld(
        null
      );

      this.refreshAssemblyVisual();

      const ingredients =
        new Set(
          this.state.assembly
        );

      if(
        ingredients.has(
          "bun"
        )
        &&
        ingredients.has(
          "cookedMeat"
        )
      ){

        const result =
          ingredients.has(
            "lettuce"
          )

            ? "lettuceBurger"

            : "burger";

        this.state.assembly =
          [];

        this.refreshAssemblyVisual();

        this.setHeld(
          result
        );

        this.setMessage(
          "漢堡組裝完成"
        );

      }
      else{

        this.setMessage(
          "食材已放上組裝台"
        );

      }

      return;

    }

    if(
      station.id ===
      "serve"
    ){

      const order =
        this.state.orders[0];

      if(
        order &&
        this.state.held ===
        order.result
      ){

        const earned =
          Math.round(

            140 +

            order.patience +

            this.state.combo *
            25

          );

        this.state.score +=
          earned;

        this.state.served +=
          1;

        this.state.combo +=
          1;

        this.state.maxCombo =
          Math.max(

            this.state.maxCombo,

            this.state.combo

          );

        this.setHeld(
          null
        );

        this.state.orders.shift();

        this.addOrder();

        this.renderOrders();

        this.updateHud();

        this.setMessage(
          `出餐成功 +${earned}`
        );

      }
      else{

        this.state.combo =
          0;

        this.state.score =
          Math.max(
            0,
            this.state.score -
            40
          );

        this.updateHud();

        this.setMessage(
          "餐點與目前訂單不符"
        );

      }

      return;

    }

    if(
      station.id ===
      "trash"
    ){

      this.discard();

      return;

    }

    if(
      station.id ===
      "board"
    ){

      this.setMessage(
        "目前版本砧板先保留為工作站"
      );

      return;

    }

    if(
      station.id ===
      "plate"
    ){

      this.setMessage(
        "目前版本盤子已備妥"
      );

    }

  }

  discard(){

    if(
      this.state.paused ||
      this.state.ended
    ){

      return;

    }

    if(
      this.state.held ||
      this.state.assembly.length >
      0
    ){

      this.setHeld(
        null
      );

      this.state.assembly =
        [];

      this.refreshAssemblyVisual();

      this.setMessage(
        "已丟棄目前內容"
      );

    }
    else{

      this.setMessage(
        "目前沒有可丟棄的內容"
      );

    }

  }

  /* =======================================================
     Held item
  ======================================================= */

  setHeld(
    type
  ){

    this.state.held =
      type;

    if(
      this.heldVisual
    ){

      this.disposeObject(
        this.heldVisual
      );

      this.heldAnchor.remove(
        this.heldVisual
      );

      this.heldVisual =
        null;

    }

    if(
      type
    ){

      this.heldVisual =
        this.createFoodMesh(
          type,
          .9
        );

      this.heldVisual.rotation.y =
        -.25;

      this.heldAnchor.add(
        this.heldVisual
      );

    }

  }

  refreshPanVisual(){

    this.clearGroup(
      this.panContent
    );

    if(
      this.state.panState ===
      "cooking"
    ){

      const meat =
        this.createFoodMesh(
          "rawMeat",
          .72
        );

      meat.position.y =
        .05;

      this.panContent.add(
        meat
      );

    }

    if(
      this.state.panState ===
      "done"
    ){

      const meat =
        this.createFoodMesh(
          "cookedMeat",
          .72
        );

      meat.position.y =
        .05;

      this.panContent.add(
        meat
      );

    }

  }

  refreshAssemblyVisual(){

    this.clearGroup(
      this.assemblyContent
    );

    this.state.assembly.forEach(
      (
        type,
        index
      ) => {

        const food =
          this.createFoodMesh(
            type,
            .56
          );

        food.position.set(

          (
            index -
            1
          ) *
          .18,

          .02 +
          index *
          .05,

          0

        );

        this.assemblyContent.add(
          food
        );

      }
    );

  }

  /* =======================================================
     Order
  ======================================================= */

  addOrder(){

    if(
      this.state.orders.length >=
      GameConfig
        .gameplay
        .maxOrders
    ){

      return;

    }

    const recipe =
      this.recipes[
        Math.floor(
          Math.random() *
          this.recipes.length
        )
      ];

    this.state.orders.push({

      id:
        crypto.randomUUID?.() ||
        `${Date.now()}-${Math.random()}`,

      name:
        recipe.name,

      result:
        recipe.result,

      ingredients:[
        ...recipe.ingredients
      ],

      patience:100

    });

  }

  renderOrders(){

    this.ui
      .orderStrip
      .innerHTML =

      this.state.orders

        .slice(
          0,
          GameConfig
            .gameplay
            .maxOrders
        )

        .map(
          order => {

            const ingredients =

              order.ingredients

                .map(
                  type => {

                    return `

                      <span
                        class="ingredient-chip"
                      >

                        <i
                          class="ingredient-dot"
                          style="--dot-color:${this.foodColor(type)}"
                        ></i>

                        ${this.foodLabel(type)}

                      </span>

                    `;

                  }
                )

                .join(
                  ""
                );

            const patience =
              Math.max(
                0,
                order.patience
              );

            const patienceColor =

              patience <= 34

                ? "#e45a45"

                : patience <= 69

                  ? "#e9b94f"

                  : "#68a96d";

            return `

              <article
                class="order-ticket"
              >

                <div
                  class="order-name"
                >
                  ${order.name}
                </div>

                <div
                  class="order-ingredients"
                >
                  ${ingredients}
                </div>

                <div
                  class="patience-track"
                >

                  <div
                    class="patience-bar"
                    style="
                      width:${patience}%;
                      background:${patienceColor}
                    "
                  ></div>

                </div>

              </article>

            `;

          }
        )

        .join(
          ""
        );

  }

  updateHud(){

    this.ui.score.textContent =
      String(
        this.state.score
      );

    this.ui.time.textContent =
      String(
        Math.ceil(
          this.state.time
        )
      );

  }

  setMessage(
    text,
    duration = 1.5
  ){

    this.ui.message.textContent =
      text;

    this.state.messageTimer =
      duration;

  }

  /* =======================================================
     Pause
  ======================================================= */

  togglePause(){

    if(
      this.state.ended
    ){

      return;

    }

    if(
      this.state.paused
    ){

      this.resumeGame();

      return;

    }

    this.state.paused =
      true;

    this.ui
      .pauseOverlay
      .classList
      .remove(
        "is-hidden"
      );

  }

  resumeGame(){

    if(
      this.state.ended
    ){

      return;

    }

    this.state.paused =
      false;

    this.ui
      .pauseOverlay
      .classList
      .add(
        "is-hidden"
      );

    this.lastTime =
      performance.now();

  }

  /* =======================================================
     Result
  ======================================================= */

  endGame(){

    if(
      this.state.ended
    ){

      return;

    }

    this.state.ended =
      true;

    this.state.paused =
      false;

    this.ui
      .touchControls
      .classList
      .remove(
        "active"
      );

    this.ui
      .pauseOverlay
      .classList
      .add(
        "is-hidden"
      );

    this.ui
      .resultTitle
      .textContent =

        this.state.score >=
        1000

          ? "今日營業成功"

          : "營業結束";

    this.ui
      .resultText
      .textContent =

        `總分 ${this.state.score}｜完成訂單 ${this.state.served}｜最高連擊 ${this.state.maxCombo}`;

    this.ui
      .resultOverlay
      .classList
      .remove(
        "is-hidden"
      );

  }

  /* =======================================================
     Food UI
  ======================================================= */

  foodLabel(
    type
  ){

    return {

      bun:
        "麵包",

      lettuce:
        "生菜",

      rawMeat:
        "生肉",

      cookedMeat:
        "熟肉",

      drink:
        "飲料",

      burger:
        "漢堡",

      lettuceBurger:
        "生菜漢堡"

    }[type] ||
    type;

  }

  foodColor(
    type
  ){

    return {

      bun:
        "#e9ad56",

      lettuce:
        "#6fac63",

      rawMeat:
        "#d7554e",

      cookedMeat:
        "#80503b",

      drink:
        "#e45745",

      burger:
        "#d89140",

      lettuceBurger:
        "#6fac63"

    }[type] ||
    "#999999";

  }

  /* =======================================================
     Dispose
  ======================================================= */

  clearGroup(
    group
  ){

    if(
      !group
    ){

      return;

    }

    while(
      group.children.length
    ){

      const child =
        group.children[0];

      group.remove(
        child
      );

      this.disposeObject(
        child
      );

    }

  }

  disposeObject(
    object
  ){

    object.traverse?.(
      child => {

        child.geometry
          ?.dispose?.();

        if(
          child.material
        ){

          const materials =
            Array.isArray(
              child.material
            )

              ? child.material

              : [
                  child.material
                ];

          materials.forEach(
            material => {

              material.map
                ?.dispose?.();

              material.dispose
                ?.();

            }
          );

        }

      }
    );

  }

  async exit(){

    this.running =
      false;

    cancelAnimationFrame(
      this.animationFrame
    );

  }

  destroy(){

    this.running =
      false;

    cancelAnimationFrame(
      this.animationFrame
    );

    this.cleanups
      .splice(
        0
      )
      .forEach(
        cleanup =>
          cleanup?.()
      );

    if(
      this.scene
    ){

      this.disposeObject(
        this.scene
      );

    }

    if(
      this.renderer
    ){

      this.renderer.dispose();

      this.renderer
        .renderLists
        ?.dispose?.();

      this.renderer
        .domElement
        .remove();

    }

    this.scene =
      null;

    this.camera =
      null;

    this.renderer =
      null;

    this.player =
      null;

    this.heldAnchor =
      null;

    this.heldVisual =
      null;

    this.panContent =
      null;

    this.assemblyContent =
      null;

    this.obstacles =
      [];

    this.stationById.clear();

  }

}
