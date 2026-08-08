export const KITCHEN_LAYOUT_STORAGE_KEY =
  "gameCookKitchenLayout";


export const KitchenLayout = {

  /*
   * 每次正式 Layout 有重大調整時，
   * 把 version +1。
   *
   * 例如：
   * 1 → 2
   *
   * 舊的 Editor localStorage
   * 就不會繼續覆蓋正式配置。
   */

  version:
    2,


  /* =======================================================
     Counters
  ======================================================= */

  counters:[

    {
      id:"counter_top_01",
      x:-5.8,
      z:-2.72,
      width:1.3,
      depth:1
    },

    {
      id:"counter_top_02",
      x:-4.35,
      z:-2.72,
      width:1.3,
      depth:1
    },

    {
      id:"counter_top_03",
      x:-2.9,
      z:-2.72,
      width:1.3,
      depth:1
    },

    {
      id:"counter_top_04",
      x:-1.45,
      z:-2.72,
      width:1.3,
      depth:1
    },

    {
      id:"counter_top_05",
      x:0,
      z:-2.72,
      width:1.3,
      depth:1
    },

    {
      id:"counter_top_06",
      x:1.45,
      z:-2.72,
      width:1.3,
      depth:1
    },

    {
      id:"counter_top_07",
      x:2.9,
      z:-2.72,
      width:1.3,
      depth:1
    },

    {
      id:"counter_top_08",
      x:4.35,
      z:-2.72,
      width:1.3,
      depth:1
    },

    {
      id:"counter_top_09",
      x:5.8,
      z:-2.72,
      width:1.3,
      depth:1
    },


    {
      id:"counter_left_01",
      x:-6.9,
      z:-1.45,
      width:1,
      depth:1.28
    },

    {
      id:"counter_left_02",
      x:-6.9,
      z:.1,
      width:1,
      depth:1.28
    },

    {
      id:"counter_left_03",
      x:-6.9,
      z:1.65,
      width:1,
      depth:1.28
    },


    {
      id:"counter_right_01",
      x:6.9,
      z:-1.45,
      width:1,
      depth:1.28
    },

    {
      id:"counter_right_02",
      x:6.9,
      z:.1,
      width:1,
      depth:1.28
    },

    {
      id:"counter_right_03",
      x:6.9,
      z:1.65,
      width:1,
      depth:1.28
    },


    {
      id:"counter_bottom_01",
      x:-1.35,
      z:2.82,
      width:1.25,
      depth:1
    },

    {
      id:"counter_bottom_02",
      x:0,
      z:2.82,
      width:1.25,
      depth:1
    },

    {
      id:"counter_bottom_03",
      x:1.35,
      z:2.82,
      width:1.25,
      depth:1
    }

  ],


  /* =======================================================
     Stations
  ======================================================= */

  stations:[

    {
      id:"bun",

      label:"麵包",

      type:"bun",

      x:-5.8,

      z:-2.72,

      interactionOffset:{
        x:0,
        z:.9
      }
    },


    {
      id:"lettuce",

      label:"生菜",

      type:"lettuce",

      x:-4.35,

      z:-2.72,

      interactionOffset:{
        x:0,
        z:.9
      }
    },


    {
      id:"meat",

      label:"肉排",

      type:"rawMeat",

      x:-2.9,

      z:-2.72,

      interactionOffset:{
        x:0,
        z:.9
      }
    },


    {
      id:"board",

      label:"砧板",

      type:"board",

      x:-1.45,

      z:-2.72,

      interactionOffset:{
        x:0,
        z:.9
      }
    },


    {
      id:"pan",

      label:"煎台",

      type:"pan",

      x:1.45,

      z:-2.72,

      interactionOffset:{
        x:0,
        z:.9
      }
    },


    {
      id:"drink",

      label:"飲料",

      type:"drinkStation",

      x:2.9,

      z:-2.72,

      interactionOffset:{
        x:0,
        z:.9
      }
    },


    {
      id:"plate",

      label:"盤子",

      type:"plate",

      x:4.35,

      z:-2.72,

      interactionOffset:{
        x:0,
        z:.9
      }
    },


    {
      id:"assembly",

      label:"組裝",

      type:"assembly",

      x:-6.9,

      z:.1,

      interactionOffset:{
        x:.95,
        z:0
      }
    },


    {
      id:"serve",

      label:"出餐",

      type:"serve",

      x:6.9,

      z:.1,

      interactionOffset:{
        x:-.95,
        z:0
      }
    },


    {
      id:"trash",

      label:"丟棄",

      type:"trash",

      x:0,

      z:2.82,

      interactionOffset:{
        x:0,
        z:-.9
      }
    }

  ],


  /* =======================================================
     Player Spawn
  ======================================================= */

  player:{

    id:
      "player_spawn",

    x:
      0,

    z:
      .15

  }

};


/* =========================================================
   Clone
========================================================= */

export function cloneKitchenLayout(
  source = KitchenLayout
){

  return JSON.parse(
    JSON.stringify(
      source
    )
  );

}


/* =========================================================
   Validation
========================================================= */

export function isValidKitchenLayout(
  layout
){

  return Boolean(

    layout &&

    Number.isFinite(
      Number(
        layout.version
      )
    ) &&

    Array.isArray(
      layout.counters
    ) &&

    Array.isArray(
      layout.stations
    ) &&

    layout.player &&

    Number.isFinite(
      Number(
        layout.player.x
      )
    ) &&

    Number.isFinite(
      Number(
        layout.player.z
      )
    )

  );

}


/* =========================================================
   Runtime Layout
========================================================= */

export function getRuntimeKitchenLayout(){

  try{

    const saved =
      window.localStorage.getItem(
        KITCHEN_LAYOUT_STORAGE_KEY
      );


    if(
      saved
    ){

      const parsed =
        JSON.parse(
          saved
        );


      /*
       * 必須同時符合：
       *
       * 1. Layout 格式有效
       * 2. LocalStorage version
       *    與正式 KitchenLayout version 相同
       *
       * 否則直接忽略舊快取。
       */

      if(

        isValidKitchenLayout(
          parsed
        )

        &&

        Number(
          parsed.version
        ) ===
        Number(
          KitchenLayout.version
        )

      ){

        return cloneKitchenLayout(
          parsed
        );

      }


      /*
       * 找到舊版本快取時，
       * 自動刪除。
       */

      window.localStorage.removeItem(
        KITCHEN_LAYOUT_STORAGE_KEY
      );


      console.info(

        `[KitchenLayout] 舊版 Editor 快取已失效：${
          parsed?.version ??
          "unknown"
        } → ${
          KitchenLayout.version
        }`

      );

    }

  }
  catch(error){

    console.warn(

      "[KitchenLayout] 無法讀取本機配置，將使用正式 Layout。",

      error

    );


    /*
     * JSON 損壞或其他錯誤時，
     * 直接清掉快取。
     */

    try{

      window.localStorage.removeItem(
        KITCHEN_LAYOUT_STORAGE_KEY
      );

    }
    catch{

      // Ignore

    }

  }


  return cloneKitchenLayout(
    KitchenLayout
  );

}


/* =========================================================
   Save Runtime Layout
========================================================= */

export function saveRuntimeKitchenLayout(
  layout
){

  if(
    !isValidKitchenLayout(
      layout
    )
  ){

    throw new Error(
      "Invalid kitchen layout."
    );

  }


  /*
   * Editor 儲存時，
   * 強制同步目前正式版本號。
   */

  const runtimeLayout =
    cloneKitchenLayout(
      layout
    );


  runtimeLayout.version =
    KitchenLayout.version;


  window.localStorage.setItem(

    KITCHEN_LAYOUT_STORAGE_KEY,

    JSON.stringify(
      runtimeLayout
    )

  );

}


/* =========================================================
   Clear Runtime Layout
========================================================= */

export function clearRuntimeKitchenLayout(){

  window.localStorage.removeItem(
    KITCHEN_LAYOUT_STORAGE_KEY
  );

}
