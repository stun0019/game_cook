export const GameConfig = {

  logicalWidth:1280,
  logicalHeight:720,

  assets:{
    loadingBackground:
      "./asset/art/Loading_page_BG.png"
  },

  assetManifest:[
    {
      type:"image",

      key:
        "loadingBackground",

      url:
        "./asset/art/Loading_page_BG.png"
    }
  ],

  gameplay:{
    duration:75,

    playerSpeed:4.4,

    playerRadius:.38,

    interactionDistance:1.15,

    maxOrders:5,

    orderSpawnInterval:9,

    panCookTime:3
  },

  world:{
    minX:-7.7,
    maxX:7.7,

    minZ:-3.65,
    maxZ:3.65,

    floorWidth:17,
    floorDepth:8.8
  },

  camera:{
    viewHeight:11.7,

    position:{
      x:0,
      y:14,
      z:13.2
    },

    target:{
      x:0,
      y:.15,
      z:.25
    }
  }

};
