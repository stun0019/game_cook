export const GameConfig = {

  /* =======================================================
     Logical Resolution
  ======================================================= */

  logicalWidth:
    1280,

  logicalHeight:
    720,


  /* =======================================================
     Assets
  ======================================================= */

  assets:{

    loadingBackground:
      "./asset/art/Loading_page_BG.png"

  },


  assetManifest:[

    {

      type:
        "image",

      key:
        "loadingBackground",

      url:
        "./asset/art/Loading_page_BG.png"

    }

  ],


  /* =======================================================
     Gameplay
  ======================================================= */

  gameplay:{

    duration:
      75,

    playerSpeed:
      4.4,

    playerRadius:
      .38,

    interactionDistance:
      1.15,

    maxOrders:
      5,

    orderSpawnInterval:
      9,

    panCookTime:
      3

  },


  /* =======================================================
     World
  ======================================================= */

  world:{

    /*
     * 玩家實際可移動範圍。
     *
     * 注意：
     * Bounds 不再等於 Floor 大小。
     *
     * Floor 可以比玩家移動範圍更大，
     * 用來確保 1280 × 720 畫面完全被地板填滿。
     */

    minX:
      -8.3,

    maxX:
      8.3,


    minZ:
      -4.6,

    maxZ:
      4.6,


    /*
     * 視覺地板尺寸。
     *
     * 原本：
     * 17 × 8.8
     *
     * 會造成畫面下半部露出大量 Scene Background。
     *
     * 現在擴大成：
     * 20 × 14
     *
     * 讓地板延伸到 Camera 視野之外。
     */

    floorWidth:
      20,

    floorDepth:
      14

  },


  /* =======================================================
     Camera
  ======================================================= */

  camera:{

    /*
     * Orthographic Camera：
     *
     * 數值越大
     * → 看得越遠
     * → 所有物件越小
     *
     * 數值越小
     * → 畫面越近
     * → 遊戲物件越大
     *
     * 原本 11.7 太遠，
     * 改為 9.4。
     */

    viewHeight:
      9.4,


    /*
     * Camera Position
     *
     * 稍微拉近廚房，
     * 但仍維持目前斜俯視視角。
     */

    position:{

      x:
        0,

      y:
        12.5,

      z:
        11.5

    },


    /*
     * Camera Target
     *
     * 讓畫面中心落在主要 Gameplay Area。
     */

    target:{

      x:
        0,

      y:
        0,

      z:
        .2

    }

  }

};
