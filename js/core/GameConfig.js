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
    minX:-8.2,
    maxX:8.2,

    minZ:-4.25,
    maxZ:4.25,

    floorWidth:18,
    floorDepth:10
  },

  camera:{
    viewHeight:10.2,

    position:{
      x:0,
      y:12.5,
      z:11.5
    },

    target:{
      x:0,
      y:0,
      z:0
    }
  }

};
