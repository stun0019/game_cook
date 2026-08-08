import * as THREE
from "three";

import {
  TransformControls
} from "three/addons/controls/TransformControls.js";


import {
  GameConfig
} from "../core/GameConfig.js";


import {

  KitchenLayout,

  cloneKitchenLayout,

  getRuntimeKitchenLayout,

  saveRuntimeKitchenLayout,

  clearRuntimeKitchenLayout,

  KITCHEN_LAYOUT_STORAGE_KEY

} from "../data/KitchenLayout.js";


class KitchenEditor {

  constructor(){

    this.layout =
      getRuntimeKitchenLayout();


    this.root =
      document.getElementById(
        "editor-canvas-root"
      );


    this.status =
      document.getElementById(
        "editor-status"
      );


    this.scene =
      null;


    this.camera =
      null;


    this.renderer =
      null;


    this.transformControls =
      null;


    this.transformHelper =
      null;


    this.layoutRoot =
      null;


    this.floorRoot =
      null;


    this.selectionHelper =
      null;


    this.objects =
      new Map();


    this.pickables =
      [];


    this.interactionMarkers =
      new Map();


    this.collisionVisuals =
      [];


    this.selectedKey =
      null;


    this.selectedObject =
      null;


    this.selectedBaseY =
      0;


    this.raycaster =
      new THREE.Raycaster();


    this.pointer =
      new THREE.Vector2();


    this.animationFrame =
      0;


    this.showInteraction =
      true;


    this.showCollision =
      true;


    this.snapEnabled =
      true;


    this.snapSize =
      .1;


    this.dom =
      {};

  }


  /* =======================================================
     INIT
  ======================================================= */

  init(){

    this.cacheDom();

    this.createScene();

    this.createFloor();

    this.createTransformControls();

    this.rebuildLayout();

    this.bindUI();

    this.renderEntityLists();

    this.handleResize();

    this.loop();


    window.addEventListener(
      "resize",
      () =>
        this.handleResize(),
      {
        passive:true
      }
    );


    this.setStatus(

      window.localStorage.getItem(
        KITCHEN_LAYOUT_STORAGE_KEY
      )

        ? "已載入本機預覽配置"

        : "已載入原始 KitchenLayout"

    );

  }


  /* =======================================================
     DOM
  ======================================================= */

  cacheDom(){

    this.dom.counterList =
      document.getElementById(
        "counter-list"
      );


    this.dom.stationList =
      document.getElementById(
        "station-list"
      );


    this.dom.playerList =
      document.getElementById(
        "player-list"
      );


    this.dom.safeTop =
      document.getElementById(
        "safe-top"
      );


    this.dom.safeBottom =
      document.getElementById(
        "safe-bottom"
      );


    this.dom.showSafeArea =
      document.getElementById(
        "show-safe-area"
      );


    this.dom.showInteraction =
      document.getElementById(
        "show-interaction"
      );


    this.dom.showCollision =
      document.getElementById(
        "show-collision"
      );


    this.dom.snapEnabled =
      document.getElementById(
        "snap-enabled"
      );


    this.dom.snapSize =
      document.getElementById(
        "snap-size"
      );


    this.dom.inspectorEmpty =
      document.getElementById(
        "inspector-empty"
      );


    this.dom.inspectorFields =
      document.getElementById(
        "inspector-fields"
      );


    this.dom.labelField =
      document.getElementById(
        "label-field"
      );


    this.dom.counterFields =
      document.getElementById(
        "counter-fields"
      );


    this.dom.stationFields =
      document.getElementById(
        "station-fields"
      );


    this.dom.entityKind =
      document.getElementById(
        "entity-kind"
      );


    this.dom.entityId =
      document.getElementById(
        "entity-id"
      );


    this.dom.entityLabel =
      document.getElementById(
        "entity-label"
      );


    this.dom.entityX =
      document.getElementById(
        "entity-x"
      );


    this.dom.entityZ =
      document.getElementById(
        "entity-z"
      );


    this.dom.counterWidth =
      document.getElementById(
        "counter-width"
      );


    this.dom.counterDepth =
      document.getElementById(
        "counter-depth"
      );


    this.dom.interactionX =
      document.getElementById(
        "interaction-x"
      );


    this.dom.interactionZ =
      document.getElementById(
        "interaction-z"
      );


    this.dom.savePreview =
      document.getElementById(
        "save-preview"
      );


    this.dom.openGame =
      document.getElementById(
        "open-game"
      );


    this.dom.exportLayout =
      document.getElementById(
        "export-layout"
      );


    this.dom.resetLayout =
      document.getElementById(
        "reset-layout"
      );


    this.dom.clearPreview =
      document.getElementById(
        "clear-preview"
      );


    this.dom.exportModal =
      document.getElementById(
        "export-modal"
      );


    this.dom.exportText =
      document.getElementById(
        "export-text"
      );


    this.dom.copyExport =
      document.getElementById(
        "copy-export"
      );


    this.dom.downloadExport =
      document.getElementById(
        "download-export"
      );


    this.dom.closeExport =
      document.getElementById(
        "close-export"
      );

  }


  /* =======================================================
     THREE
  ======================================================= */

  createScene(){

    this.scene =
      new THREE.Scene();


    this.scene.background =
      new THREE.Color(
        0xc6d7cf
      );


    const aspect =
      GameConfig.logicalWidth /
      GameConfig.logicalHeight;


    const viewHeight =
      GameConfig.camera.viewHeight;


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

      GameConfig.camera.position.x,

      GameConfig.camera.position.y,

      GameConfig.camera.position.z

    );


    this.camera.lookAt(

      GameConfig.camera.target.x,

      GameConfig.camera.target.y,

      GameConfig.camera.target.z

    );


    this.renderer =
      new THREE.WebGLRenderer({

        antialias:true,

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


    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;


    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;


    this.renderer.toneMappingExposure =
      1.05;


    this.root.appendChild(
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
     FLOOR
  ======================================================= */

  createFloor(){

    this.floorRoot =
      new THREE.Group();


    const floor =
      new THREE.Mesh(

        new THREE.PlaneGeometry(

          GameConfig.world.floorWidth,

          GameConfig.world.floorDepth

        ),

        new THREE.MeshStandardMaterial({

          color:
            0xd8b877,

          roughness:
            .92

        })

      );


    floor.rotation.x =
      -Math.PI / 2;


    floor.position.set(
      0,
      -.02,
      .2
    );


    this.floorRoot.add(
      floor
    );


    const grid =
      new THREE.GridHelper(

        17,

        17,

        0xb38d55,

        0xc9a96e

      );


    grid.position.set(
      0,
      .005,
      .2
    );


    grid.scale.z =
      GameConfig.world.floorDepth /
      17;


    this.floorRoot.add(
      grid
    );


    this.scene.add(
      this.floorRoot
    );

  }


  /* =======================================================
     TRANSFORM CONTROL
  ======================================================= */

  createTransformControls(){

    this.transformControls =
      new TransformControls(

        this.camera,

        this.renderer.domElement

      );


    this.transformControls.setMode(
      "translate"
    );


    this.transformControls.showX =
      true;


    this.transformControls.showY =
      false;


    this.transformControls.showZ =
      true;


    this.transformControls.setSize(
      .8
    );


    this.transformControls.setTranslationSnap(
      this.snapSize
    );


    this.transformHelper =
      this.transformControls.getHelper();


    this.scene.add(
      this.transformHelper
    );


    this.transformControls.addEventListener(

      "objectChange",

      () => {

        this.handleTransformChange();

      }

    );

  }


  /* =======================================================
     REBUILD
  ======================================================= */

  rebuildLayout(
    reselectKey =
      this.selectedKey
  ){

    this.transformControls
      ?.detach();


    if(
      this.selectionHelper
    ){

      this.scene.remove(
        this.selectionHelper
      );


      this.disposeObject(
        this.selectionHelper
      );


      this.selectionHelper =
        null;

    }


    if(
      this.layoutRoot
    ){

      this.scene.remove(
        this.layoutRoot
      );


      this.disposeObject(
        this.layoutRoot
      );

    }


    this.layoutRoot =
      new THREE.Group();


    this.objects.clear();


    this.pickables =
      [];


    this.interactionMarkers.clear();


    this.collisionVisuals =
      [];


    this.layout.counters.forEach(
      counter => {

        this.createCounter(
          counter
        );

      }
    );


    this.layout.stations.forEach(
      station => {

        this.createStation(
          station
        );

      }
    );


    this.createPlayerSpawn(
      this.layout.player
    );


    this.scene.add(
      this.layoutRoot
    );


    this.applyOverlayVisibility();


    if(
      reselectKey &&
      this.objects.has(
        reselectKey
      )
    ){

      this.selectEntity(
        reselectKey,
        false
      );

    }
    else{

      this.clearSelection();

    }

  }


  /* =======================================================
     COUNTER
  ======================================================= */

  createCounter(
    counter
  ){

    const group =
      new THREE.Group();


    const key =
      `counter:${counter.id}`;


    group.position.set(

      counter.x,

      0,

      counter.z

    );


    group.userData.editorKey =
      key;


    group.userData.baseY =
      0;


    const body =
      new THREE.Mesh(

        new THREE.BoxGeometry(

          counter.width,

          .82,

          counter.depth

        ),

        new THREE.MeshStandardMaterial({

          color:
            0xaa5d37,

          roughness:
            .82

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

          counter.width *
          .76,

          .48,

          counter.depth +
          .03

        ),

        new THREE.MeshStandardMaterial({

          color:
            0x7e432f,

          roughness:
            .9

        })

      );


    inset.position.y =
      .38;


    group.add(
      inset
    );


    const top =
      new THREE.Mesh(

        new THREE.BoxGeometry(

          counter.width +
          .08,

          .16,

          counter.depth +
          .08

        ),

        new THREE.MeshStandardMaterial({

          color:
            0xef9b4a,

          roughness:
            .65

        })

      );


    top.position.y =
      .9;


    group.add(
      top
    );


    /* Collision Outline */

    const collisionBox =
      new THREE.LineSegments(

        new THREE.EdgesGeometry(

          new THREE.BoxGeometry(

            counter.width,

            .9,

            counter.depth

          )

        ),

        new THREE.LineBasicMaterial({

          color:
            0xd64e45,

          transparent:
            true,

          opacity:
            .9

        })

      );


    collisionBox.position.y =
      .45;


    collisionBox.renderOrder =
      8;


    group.add(
      collisionBox
    );


    this.collisionVisuals.push(
      collisionBox
    );


    this.registerPickables(
      group,
      key
    );


    this.objects.set(
      key,
      group
    );


    this.layoutRoot.add(
      group
    );

  }


  /* =======================================================
     STATION
  ======================================================= */

  createStation(
    station
  ){

    const group =
      new THREE.Group();


    const key =
      `station:${station.id}`;


    group.position.set(

      station.x,

      .99,

      station.z

    );


    group.userData.editorKey =
      key;


    group.userData.baseY =
      .99;


    const prop =
      this.createStationProp(
        station.type
      );


    group.add(
      prop
    );


    const label =
      this.createTextSprite(
        station.label
      );


    label.position.set(
      0,
      .92,
      0
    );


    group.add(
      label
    );


    this.registerPickables(
      group,
      key
    );


    this.objects.set(
      key,
      group
    );


    this.layoutRoot.add(
      group
    );


    const marker =
      this.createInteractionMarker(
        station
      );


    this.interactionMarkers.set(
      station.id,
      marker
    );


    this.layoutRoot.add(
      marker
    );

  }


  /* =======================================================
     PLAYER SPAWN
  ======================================================= */

  createPlayerSpawn(
    player
  ){

    const group =
      new THREE.Group();


    const key =
      `player:${player.id}`;


    group.position.set(

      player.x,

      0,

      player.z

    );


    group.userData.editorKey =
      key;


    group.userData.baseY =
      0;


    const body =
      new THREE.Mesh(

        new THREE.CylinderGeometry(

          .34,

          .42,

          .82,

          20

        ),

        new THREE.MeshStandardMaterial({

          color:
            0xfff8e9,

          roughness:
            .7

        })

      );


    body.position.y =
      .52;


    group.add(
      body
    );


    const head =
      new THREE.Mesh(

        new THREE.SphereGeometry(

          .31,

          24,

          18

        ),

        new THREE.MeshStandardMaterial({

          color:
            0xc97844,

          roughness:
            .75

        })

      );


    head.position.y =
      1.16;


    group.add(
      head
    );


    const marker =
      new THREE.Mesh(

        new THREE.RingGeometry(

          .42,

          .5,

          32

        ),

        new THREE.MeshBasicMaterial({

          color:
            0x62b7ff,

          side:
            THREE.DoubleSide,

          transparent:
            true,

          opacity:
            .95

        })

      );


    marker.rotation.x =
      -Math.PI / 2;


    marker.position.y =
      .015;


    group.add(
      marker
    );


    this.registerPickables(
      group,
      key
    );


    this.objects.set(
      key,
      group
    );


    this.layoutRoot.add(
      group
    );

  }


  /* =======================================================
     STATION PROP
  ======================================================= */

  createStationProp(
    type
  ){

    const group =
      new THREE.Group();


    const palette = {

      bun:
        0xe9ad56,

      lettuce:
        0x6fac63,

      rawMeat:
        0xd7554e,

      board:
        0xd99b56,

      pan:
        0x2b3b40,

      drinkStation:
        0xd95645,

      plate:
        0xf7f1e7,

      assembly:
        0xe8ddc8,

      serve:
        0xf3bd40,

      trash:
        0x748789

    };


    if(
      [
        "bun",
        "lettuce",
        "rawMeat"
      ]
      .includes(
        type
      )
    ){

      const tray =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            .82,
            .16,
            .62
          ),

          new THREE.MeshStandardMaterial({

            color:
              0xf3dfb2,

            roughness:
              .75

          })

        );


      tray.position.y =
        .08;


      group.add(
        tray
      );


      const food =
        new THREE.Mesh(

          new THREE.CylinderGeometry(

            .27,

            .3,

            .14,

            18

          ),

          new THREE.MeshStandardMaterial({

            color:
              palette[type],

            roughness:
              .7

          })

        );


      food.position.y =
        .27;


      group.add(
        food
      );


      return group;

    }


    if(
      type ===
      "board"
    ){

      const mesh =
        new THREE.Mesh(

          new THREE.BoxGeometry(

            .86,

            .12,

            .56

          ),

          new THREE.MeshStandardMaterial({

            color:
              palette[type],

            roughness:
              .82

          })

        );


      mesh.position.y =
        .08;


      group.add(
        mesh
      );


      return group;

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

            color:
              palette[type],

            roughness:
              .5,

            metalness:
              .18

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

            color:
              palette[type],

            roughness:
              .55

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


      return group;

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

            color:
              palette[type],

            roughness:
              .6

          })

        );


      machine.position.y =
        .39;


      group.add(
        machine
      );


      return group;

    }


    if(
      type ===
        "plate" ||

      type ===
        "assembly"
    ){

      const plate =
        new THREE.Mesh(

          new THREE.CylinderGeometry(

            .38,

            .44,

            .08,

            28

          ),

          new THREE.MeshStandardMaterial({

            color:
              palette[type],

            roughness:
              .48

          })

        );


      plate.position.y =
        .05;


      group.add(
        plate
      );


      return group;

    }


    if(
      type ===
      "serve"
    ){

      const bell =
        new THREE.Mesh(

          new THREE.SphereGeometry(

            .3,

            24,

            16

          ),

          new THREE.MeshStandardMaterial({

            color:
              palette[type],

            roughness:
              .3,

            metalness:
              .3

          })

        );


      bell.scale.y =
        .65;


      bell.position.y =
        .19;


      group.add(
        bell
      );


      return group;

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

            color:
              palette[type],

            roughness:
              .72

          })

        );


      can.position.y =
        .34;


      group.add(
        can
      );


      return group;

    }


    const fallback =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          .55,
          .55,
          .55
        ),

        new THREE.MeshStandardMaterial({

          color:
            0xb7c1c7,

          roughness:
            .8

        })

      );


    fallback.position.y =
      .28;


    group.add(
      fallback
    );


    return group;

  }


  /* =======================================================
     LABEL
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


    context.fillStyle =
      "rgba(255,250,240,.94)";


    context.strokeStyle =
      "#33251f";


    context.lineWidth =
      8;


    context.beginPath();


    context.roundRect(
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


    const sprite =
      new THREE.Sprite(

        new THREE.SpriteMaterial({

          map:
            texture,

          transparent:
            true,

          depthTest:
            false

        })

      );


    sprite.scale.set(
      1.55,
      .48,
      1
    );


    sprite.renderOrder =
      20;


    return sprite;

  }


  /* =======================================================
     INTERACTION
  ======================================================= */

  createInteractionMarker(
    station
  ){

    const group =
      new THREE.Group();


    const ring =
      new THREE.Mesh(

        new THREE.RingGeometry(

          GameConfig.gameplay.interactionDistance -
          .04,

          GameConfig.gameplay.interactionDistance,

          48

        ),

        new THREE.MeshBasicMaterial({

          color:
            0x52c9f3,

          transparent:
            true,

          opacity:
            .62,

          side:
            THREE.DoubleSide,

          depthWrite:
            false

        })

      );


    ring.rotation.x =
      -Math.PI / 2;


    ring.position.y =
      .02;


    group.add(
      ring
    );


    const center =
      new THREE.Mesh(

        new THREE.CircleGeometry(
          .09,
          24
        ),

        new THREE.MeshBasicMaterial({

          color:
            0xffffff,

          transparent:
            true,

          opacity:
            .9,

          side:
            THREE.DoubleSide,

          depthWrite:
            false

        })

      );


    center.rotation.x =
      -Math.PI / 2;


    center.position.y =
      .023;


    group.add(
      center
    );


    this.updateInteractionMarker(
      station,
      group
    );


    return group;

  }


  updateInteractionMarker(

    station,

    marker =
      this.interactionMarkers.get(
        station.id
      )

  ){

    if(
      !marker
    ){

      return;

    }


    marker.position.set(

      station.x +
      Number(
        station.interactionOffset
          ?.x ||
        0
      ),

      0,

      station.z +
      Number(
        station.interactionOffset
          ?.z ||
        0
      )

    );

  }


  /* =======================================================
     PICKABLE
  ======================================================= */

  registerPickables(
    group,
    key
  ){

    group.traverse(
      child => {

        if(
          child.isMesh
        ){

          child.userData.editorKey =
            key;


          this.pickables.push(
            child
          );

        }

      }
    );

  }


  /* =======================================================
     LIST
  ======================================================= */

  renderEntityLists(){

    this.dom.counterList.innerHTML =

      this.layout.counters

        .map(
          counter => {

            return `

              <button
                class="entity-button"
                type="button"
                data-editor-key="counter:${counter.id}"
              >

                ${counter.id}

                <small>
                  Counter
                </small>

              </button>

            `;

          }
        )

        .join(
          ""
        );


    this.dom.stationList.innerHTML =

      this.layout.stations

        .map(
          station => {

            return `

              <button
                class="entity-button"
                type="button"
                data-editor-key="station:${station.id}"
              >

                ${station.label}

                <small>
                  ${station.id}
                </small>

              </button>

            `;

          }
        )

        .join(
          ""
        );


    this.dom.playerList.innerHTML = `

      <button
        class="entity-button"
        type="button"
        data-editor-key="player:${this.layout.player.id}"
      >

        玩家出生點

        <small>
          Player
        </small>

      </button>

    `;


    document
      .querySelectorAll(
        "[data-editor-key]"
      )
      .forEach(
        button => {

          button.addEventListener(

            "click",

            () => {

              this.selectEntity(
                button.dataset.editorKey
              );

            }

          );

        }
      );


    this.refreshListSelection();

  }


  /* =======================================================
     UI BIND
  ======================================================= */

  bindUI(){

    this.renderer.domElement
      .addEventListener(

        "pointerdown",

        event => {

          this.handleCanvasPick(
            event
          );

        }

      );


    this.dom.entityX
      .addEventListener(

        "change",

        () =>
          this.applyInspectorPosition()

      );


    this.dom.entityZ
      .addEventListener(

        "change",

        () =>
          this.applyInspectorPosition()

      );


    this.dom.counterWidth
      .addEventListener(

        "change",

        () =>
          this.applyCounterSize()

      );


    this.dom.counterDepth
      .addEventListener(

        "change",

        () =>
          this.applyCounterSize()

      );


    this.dom.interactionX
      .addEventListener(

        "change",

        () =>
          this.applyInteractionOffset()

      );


    this.dom.interactionZ
      .addEventListener(

        "change",

        () =>
          this.applyInteractionOffset()

      );


    /* Safe Area */

    this.dom.showSafeArea
      .addEventListener(

        "change",

        () => {

          const visible =
            this.dom.showSafeArea.checked;


          this.dom.safeTop.style.display =
            visible
              ? "flex"
              : "none";


          this.dom.safeBottom.style.display =
            visible
              ? "flex"
              : "none";

        }

      );


    /* Interaction */

    this.dom.showInteraction
      .addEventListener(

        "change",

        () => {

          this.showInteraction =
            this.dom.showInteraction.checked;


          this.applyOverlayVisibility();

        }

      );


    /* Collision */

    this.dom.showCollision
      .addEventListener(

        "change",

        () => {

          this.showCollision =
            this.dom.showCollision.checked;


          this.applyOverlayVisibility();

        }

      );


    /* Snap */

    this.dom.snapEnabled
      .addEventListener(

        "change",

        () => {

          this.snapEnabled =
            this.dom.snapEnabled.checked;


          this.applySnapSetting();

        }

      );


    this.dom.snapSize
      .addEventListener(

        "change",

        () => {

          this.snapSize =
            Math.max(

              .05,

              Number(
                this.dom.snapSize.value
              ) ||
              .1

            );


          this.dom.snapSize.value =
            String(
              this.snapSize
            );


          this.applySnapSetting();

        }

      );


    /* Save Preview */

    this.dom.savePreview
      .addEventListener(

        "click",

        () => {

          saveRuntimeKitchenLayout(
            this.layout
          );


          this.setStatus(
            "已套用到本機遊戲預覽"
          );

        }

      );


    /* Open Game */

    this.dom.openGame
      .addEventListener(

        "click",

        () => {

          window.open(
            "./index.html",
            "_blank",
            "noopener"
          );

        }

      );


    /* Clear Preview */

    this.dom.clearPreview
      .addEventListener(

        "click",

        () => {

          clearRuntimeKitchenLayout();


          this.setStatus(
            "已清除本機預覽配置"
          );

        }

      );


    /* Reset */

    this.dom.resetLayout
      .addEventListener(

        "click",

        () => {

          const confirmed =
            window.confirm(
              "確定要回復原始 KitchenLayout 配置嗎？目前尚未匯出的修改會消失。"
            );


          if(
            !confirmed
          ){

            return;

          }


          this.layout =
            cloneKitchenLayout(
              KitchenLayout
            );


          this.rebuildLayout(
            null
          );


          this.renderEntityLists();


          this.setStatus(
            "已回復原始 KitchenLayout"
          );

        }

      );


    /* Export */

    this.dom.exportLayout
      .addEventListener(

        "click",

        () => {

          this.openExportModal();

        }

      );


    this.dom.closeExport
      .addEventListener(

        "click",

        () => {

          this.dom.exportModal
            .classList
            .remove(
              "open"
            );

        }

      );


    this.dom.exportModal
      .addEventListener(

        "pointerdown",

        event => {

          if(
            event.target ===
            this.dom.exportModal
          ){

            this.dom.exportModal
              .classList
              .remove(
                "open"
              );

          }

        }

      );


    /* Copy */

    this.dom.copyExport
      .addEventListener(

        "click",

        async () => {

          const code =
            this.dom.exportText.value;


          try{

            await navigator.clipboard
              .writeText(
                code
              );


            this.setStatus(
              "KitchenLayout.js 已複製"
            );

          }
          catch{

            this.dom.exportText.focus();

            this.dom.exportText.select();

            document.execCommand(
              "copy"
            );


            this.setStatus(
              "KitchenLayout.js 已複製"
            );

          }

        }

      );


    /* Download */

    this.dom.downloadExport
      .addEventListener(

        "click",

        () => {

          const code =
            this.dom.exportText.value;


          const blob =
            new Blob(

              [
                code
              ],

              {
                type:
                  "text/javascript;charset=utf-8"
              }

            );


          const url =
            URL.createObjectURL(
              blob
            );


          const link =
            document.createElement(
              "a"
            );


          link.href =
            url;


          link.download =
            "KitchenLayout.js";


          link.click();


          URL.revokeObjectURL(
            url
          );


          this.setStatus(
            "已產生 KitchenLayout.js"
          );

        }

      );

  }


  /* =======================================================
     PICK
  ======================================================= */

  handleCanvasPick(
    event
  ){

    const rect =
      this.renderer
        .domElement
        .getBoundingClientRect();


    this.pointer.x =

      (
        (
          event.clientX -
          rect.left
        ) /
        rect.width
      ) *
      2 -
      1;


    this.pointer.y =

      -(
        (
          event.clientY -
          rect.top
        ) /
        rect.height
      ) *
      2 +
      1;


    this.raycaster.setFromCamera(

      this.pointer,

      this.camera

    );


    const hits =
      this.raycaster.intersectObjects(

        this.pickables,

        false

      );


    if(
      !hits.length
    ){

      return;

    }


    const key =
      hits[0]
        .object
        .userData
        .editorKey;


    if(
      key
    ){

      this.selectEntity(
        key
      );

    }

  }


  /* =======================================================
     SELECT
  ======================================================= */

  selectEntity(

    key,

    announce =
      true

  ){

    const object =
      this.objects.get(
        key
      );


    if(
      !object
    ){

      return;

    }


    this.selectedKey =
      key;


    this.selectedObject =
      object;


    this.selectedBaseY =
      Number(
        object.userData.baseY ||
        0
      );


    this.transformControls.attach(
      object
    );


    if(
      this.selectionHelper
    ){

      this.scene.remove(
        this.selectionHelper
      );


      this.disposeObject(
        this.selectionHelper
      );

    }


    this.selectionHelper =
      new THREE.BoxHelper(

        object,

        0xffd05a

      );


    this.scene.add(
      this.selectionHelper
    );


    this.refreshInspector();

    this.refreshListSelection();


    if(
      announce
    ){

      const entity =
        this.getSelectedEntity();


      this.setStatus(

        `已選取：${
          entity?.data.label ||
          entity?.data.id ||
          key
        }`

      );

    }

  }


  clearSelection(){

    this.selectedKey =
      null;


    this.selectedObject =
      null;


    this.transformControls
      ?.detach();


    if(
      this.selectionHelper
    ){

      this.scene.remove(
        this.selectionHelper
      );


      this.disposeObject(
        this.selectionHelper
      );


      this.selectionHelper =
        null;

    }


    this.dom.inspectorEmpty.hidden =
      false;


    this.dom.inspectorFields.hidden =
      true;


    this.refreshListSelection();

  }


  refreshListSelection(){

    document
      .querySelectorAll(
        "[data-editor-key]"
      )
      .forEach(
        button => {

          button.classList.toggle(

            "active",

            button.dataset.editorKey ===
            this.selectedKey

          );

        }
      );

  }


  getSelectedEntity(){

    if(
      !this.selectedKey
    ){

      return null;

    }


    const [
      kind,
      id
    ] =
      this.selectedKey.split(
        ":"
      );


    if(
      kind ===
      "counter"
    ){

      return {

        kind,

        data:
          this.layout.counters.find(
            counter =>
              counter.id ===
              id
          )

      };

    }


    if(
      kind ===
      "station"
    ){

      return {

        kind,

        data:
          this.layout.stations.find(
            station =>
              station.id ===
              id
          )

      };

    }


    if(
      kind ===
      "player"
    ){

      return {

        kind,

        data:
          this.layout.player

      };

    }


    return null;

  }


  /* =======================================================
     INSPECTOR
  ======================================================= */

  refreshInspector(){

    const entity =
      this.getSelectedEntity();


    if(
      !entity?.data
    ){

      this.clearSelection();

      return;

    }


    this.dom.inspectorEmpty.hidden =
      true;


    this.dom.inspectorFields.hidden =
      false;


    this.dom.entityKind.value =
      entity.kind;


    this.dom.entityId.value =
      entity.data.id;


    this.dom.entityX.value =
      this.formatNumber(
        entity.data.x
      );


    this.dom.entityZ.value =
      this.formatNumber(
        entity.data.z
      );


    const isCounter =
      entity.kind ===
      "counter";


    const isStation =
      entity.kind ===
      "station";


    this.dom.counterFields.hidden =
      !isCounter;


    this.dom.stationFields.hidden =
      !isStation;


    this.dom.labelField.hidden =
      !isStation;


    if(
      isCounter
    ){

      this.dom.counterWidth.value =
        this.formatNumber(
          entity.data.width
        );


      this.dom.counterDepth.value =
        this.formatNumber(
          entity.data.depth
        );

    }


    if(
      isStation
    ){

      this.dom.entityLabel.value =
        entity.data.label;


      this.dom.interactionX.value =
        this.formatNumber(

          entity.data
            .interactionOffset
            ?.x ||
          0

        );


      this.dom.interactionZ.value =
        this.formatNumber(

          entity.data
            .interactionOffset
            ?.z ||
          0

        );

    }

  }


  applyInspectorPosition(){

    const entity =
      this.getSelectedEntity();


    if(
      !entity?.data ||
      !this.selectedObject
    ){

      return;

    }


    const x =
      Number(
        this.dom.entityX.value
      );


    const z =
      Number(
        this.dom.entityZ.value
      );


    if(
      !Number.isFinite(
        x
      ) ||

      !Number.isFinite(
        z
      )
    ){

      this.refreshInspector();

      return;

    }


    entity.data.x =
      x;


    entity.data.z =
      z;


    this.selectedObject.position.x =
      x;


    this.selectedObject.position.z =
      z;


    this.selectedObject.position.y =
      this.selectedBaseY;


    if(
      entity.kind ===
      "station"
    ){

      this.updateInteractionMarker(
        entity.data
      );

    }


    this.selectionHelper
      ?.update();


    this.setStatus(

      `位置：X ${
        this.formatNumber(
          x
        )
      } / Z ${
        this.formatNumber(
          z
        )
      }`

    );

  }


  applyCounterSize(){

    const entity =
      this.getSelectedEntity();


    if(
      entity?.kind !==
      "counter" ||

      !entity.data
    ){

      return;

    }


    const width =
      Math.max(

        .1,

        Number(
          this.dom.counterWidth.value
        ) ||
        entity.data.width

      );


    const depth =
      Math.max(

        .1,

        Number(
          this.dom.counterDepth.value
        ) ||
        entity.data.depth

      );


    entity.data.width =
      width;


    entity.data.depth =
      depth;


    const key =
      this.selectedKey;


    this.rebuildLayout(
      key
    );


    this.setStatus(

      `Counter 尺寸：${
        this.formatNumber(
          width
        )
      } × ${
        this.formatNumber(
          depth
        )
      }`

    );

  }


  applyInteractionOffset(){

    const entity =
      this.getSelectedEntity();


    if(
      entity?.kind !==
      "station" ||

      !entity.data
    ){

      return;

    }


    const offsetX =
      Number(
        this.dom.interactionX.value
      );


    const offsetZ =
      Number(
        this.dom.interactionZ.value
      );


    if(
      !Number.isFinite(
        offsetX
      ) ||

      !Number.isFinite(
        offsetZ
      )
    ){

      this.refreshInspector();

      return;

    }


    entity.data.interactionOffset = {

      x:
        offsetX,

      z:
        offsetZ

    };


    this.updateInteractionMarker(
      entity.data
    );


    this.setStatus(
      "Interaction Offset 已更新"
    );

  }


  /* =======================================================
     TRANSFORM EVENT
  ======================================================= */

  handleTransformChange(){

    const entity =
      this.getSelectedEntity();


    if(
      !entity?.data ||
      !this.selectedObject
    ){

      return;

    }


    this.selectedObject.position.y =
      this.selectedBaseY;


    entity.data.x =
      this.roundNumber(
        this.selectedObject.position.x
      );


    entity.data.z =
      this.roundNumber(
        this.selectedObject.position.z
      );


    this.selectedObject.position.x =
      entity.data.x;


    this.selectedObject.position.z =
      entity.data.z;


    if(
      entity.kind ===
      "station"
    ){

      this.updateInteractionMarker(
        entity.data
      );

    }


    this.selectionHelper
      ?.update();


    this.refreshInspector();


    this.setStatus(

      `X ${
        this.formatNumber(
          entity.data.x
        )
      } / Z ${
        this.formatNumber(
          entity.data.z
        )
      }`

    );

  }


  /* =======================================================
     DISPLAY
  ======================================================= */

  applySnapSetting(){

    this.transformControls
      .setTranslationSnap(

        this.snapEnabled
          ? this.snapSize
          : null

      );


    this.setStatus(

      this.snapEnabled

        ? `Grid Snap：${this.snapSize}`

        : "Grid Snap：OFF"

    );

  }


  applyOverlayVisibility(){

    this.interactionMarkers
      .forEach(
        marker => {

          marker.visible =
            this.showInteraction;

        }
      );


    this.collisionVisuals
      .forEach(
        line => {

          line.visible =
            this.showCollision;

        }
      );

  }


  /* =======================================================
     EXPORT
  ======================================================= */

  openExportModal(){

    this.dom.exportText.value =
      this.generateKitchenLayoutCode();


    this.dom.exportModal
      .classList
      .add(
        "open"
      );


    this.dom.exportText.scrollTop =
      0;

  }


  generateKitchenLayoutCode(){

    const layoutJson =
      JSON.stringify(

        this.layout,

        null,

        2

      );


    return `export const KITCHEN_LAYOUT_STORAGE_KEY = "gameCookKitchenLayout";

export const KitchenLayout = ${layoutJson};

export function cloneKitchenLayout(source = KitchenLayout) {
  return JSON.parse(JSON.stringify(source));
}

export function isValidKitchenLayout(layout) {
  return Boolean(
    layout &&
    Array.isArray(layout.counters) &&
    Array.isArray(layout.stations) &&
    layout.player &&
    Number.isFinite(Number(layout.player.x)) &&
    Number.isFinite(Number(layout.player.z))
  );
}

export function getRuntimeKitchenLayout() {
  try {
    const saved = window.localStorage.getItem(KITCHEN_LAYOUT_STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (isValidKitchenLayout(parsed)) {
        return cloneKitchenLayout(parsed);
      }
    }
  } catch (error) {
    console.warn("Kitchen layout override could not be loaded.", error);
  }

  return cloneKitchenLayout(KitchenLayout);
}

export function saveRuntimeKitchenLayout(layout) {
  if (!isValidKitchenLayout(layout)) {
    throw new Error("Invalid kitchen layout.");
  }

  window.localStorage.setItem(
    KITCHEN_LAYOUT_STORAGE_KEY,
    JSON.stringify(layout)
  );
}

export function clearRuntimeKitchenLayout() {
  window.localStorage.removeItem(KITCHEN_LAYOUT_STORAGE_KEY);
}
`;

  }


  /* =======================================================
     RESIZE
  ======================================================= */

  handleResize(){

    const width =
      Math.max(
        1,
        this.root.clientWidth
      );


    const height =
      Math.max(
        1,
        this.root.clientHeight
      );


    const baseAspect =
      GameConfig.logicalWidth /
      GameConfig.logicalHeight;


    const actualAspect =
      width /
      height;


    const viewHeight =
      GameConfig.camera.viewHeight;


    let visibleHeight =
      viewHeight;


    let visibleWidth =
      viewHeight *
      baseAspect;


    if(
      actualAspect >
      baseAspect
    ){

      visibleWidth =
        visibleHeight *
        actualAspect;

    }
    else{

      visibleHeight =
        visibleWidth /
        actualAspect;

    }


    this.camera.left =
      -visibleWidth /
      2;


    this.camera.right =
      visibleWidth /
      2;


    this.camera.top =
      visibleHeight /
      2;


    this.camera.bottom =
      -visibleHeight /
      2;


    this.camera.updateProjectionMatrix();


    this.renderer.setSize(

      width,

      height,

      false

    );

  }


  /* =======================================================
     LOOP
  ======================================================= */

  loop(){

    this.animationFrame =
      requestAnimationFrame(
        () =>
          this.loop()
      );


    this.selectionHelper
      ?.update();


    this.renderer.render(

      this.scene,

      this.camera

    );

  }


  /* =======================================================
     UTILS
  ======================================================= */

  setStatus(
    message
  ){

    this.status.textContent =
      message;

  }


  roundNumber(
    value
  ){

    return Math.round(
      Number(
        value
      ) *
      1000
    ) /
    1000;

  }


  formatNumber(
    value
  ){

    return String(
      this.roundNumber(
        value
      )
    );

  }


  disposeObject(
    object
  ){

    object.traverse?.(
      child => {

        child.geometry
          ?.dispose?.();


        if(
          !child.material
        ){

          return;

        }


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
    );

  }

}


/* =========================================================
   START
========================================================= */

const editor =
  new KitchenEditor();


editor.init();
