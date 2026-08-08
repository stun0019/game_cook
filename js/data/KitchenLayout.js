export const KITCHEN_LAYOUT_STORAGE_KEY = "gameCookKitchenLayout";

export const KitchenLayout = {
  version: 1,

  counters: [
    { id: "counter_top_01", x: -5.8, z: -2.72, width: 1.3, depth: 1.0 },
    { id: "counter_top_02", x: -4.35, z: -2.72, width: 1.3, depth: 1.0 },
    { id: "counter_top_03", x: -2.9, z: -2.72, width: 1.3, depth: 1.0 },
    { id: "counter_top_04", x: -1.45, z: -2.72, width: 1.3, depth: 1.0 },
    { id: "counter_top_05", x: 0, z: -2.72, width: 1.3, depth: 1.0 },
    { id: "counter_top_06", x: 1.45, z: -2.72, width: 1.3, depth: 1.0 },
    { id: "counter_top_07", x: 2.9, z: -2.72, width: 1.3, depth: 1.0 },
    { id: "counter_top_08", x: 4.35, z: -2.72, width: 1.3, depth: 1.0 },
    { id: "counter_top_09", x: 5.8, z: -2.72, width: 1.3, depth: 1.0 },

    { id: "counter_left_01", x: -6.9, z: -1.45, width: 1.0, depth: 1.28 },
    { id: "counter_left_02", x: -6.9, z: 0.1, width: 1.0, depth: 1.28 },
    { id: "counter_left_03", x: -6.9, z: 1.65, width: 1.0, depth: 1.28 },

    { id: "counter_right_01", x: 6.9, z: -1.45, width: 1.0, depth: 1.28 },
    { id: "counter_right_02", x: 6.9, z: 0.1, width: 1.0, depth: 1.28 },
    { id: "counter_right_03", x: 6.9, z: 1.65, width: 1.0, depth: 1.28 },

    { id: "counter_bottom_01", x: -1.35, z: 2.82, width: 1.25, depth: 1.0 },
    { id: "counter_bottom_02", x: 0, z: 2.82, width: 1.25, depth: 1.0 },
    { id: "counter_bottom_03", x: 1.35, z: 2.82, width: 1.25, depth: 1.0 }
  ],

  stations: [
    {
      id: "bun",
      label: "麵包",
      type: "bun",
      x: -5.8,
      z: -2.72,
      interactionOffset: {
        x: 0,
        z: 0.9
      }
    },

    {
      id: "lettuce",
      label: "生菜",
      type: "lettuce",
      x: -4.35,
      z: -2.72,
      interactionOffset: {
        x: 0,
        z: 0.9
      }
    },

    {
      id: "meat",
      label: "肉排",
      type: "rawMeat",
      x: -2.9,
      z: -2.72,
      interactionOffset: {
        x: 0,
        z: 0.9
      }
    },

    {
      id: "board",
      label: "砧板",
      type: "board",
      x: -1.45,
      z: -2.72,
      interactionOffset: {
        x: 0,
        z: 0.9
      }
    },

    {
      id: "pan",
      label: "煎台",
      type: "pan",
      x: 1.45,
      z: -2.72,
      interactionOffset: {
        x: 0,
        z: 0.9
      }
    },

    {
      id: "drink",
      label: "飲料",
      type: "drinkStation",
      x: 2.9,
      z: -2.72,
      interactionOffset: {
        x: 0,
        z: 0.9
      }
    },

    {
      id: "plate",
      label: "盤子",
      type: "plate",
      x: 4.35,
      z: -2.72,
      interactionOffset: {
        x: 0,
        z: 0.9
      }
    },

    {
      id: "assembly",
      label: "組裝",
      type: "assembly",
      x: -6.9,
      z: 0.1,
      interactionOffset: {
        x: 0.95,
        z: 0
      }
    },

    {
      id: "serve",
      label: "出餐",
      type: "serve",
      x: 6.9,
      z: 0.1,
      interactionOffset: {
        x: -0.95,
        z: 0
      }
    },

    {
      id: "trash",
      label: "丟棄",
      type: "trash",
      x: 0,
      z: 2.82,
      interactionOffset: {
        x: 0,
        z: -0.9
      }
    }
  ],

  player: {
    id: "player_spawn",
    x: 0,
    z: 0.15
  }
};


export function cloneKitchenLayout(
  source = KitchenLayout
){

  return JSON.parse(
    JSON.stringify(
      source
    )
  );

}


export function isValidKitchenLayout(
  layout
){

  return Boolean(

    layout &&

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


export function getRuntimeKitchenLayout(){

  try{

    const saved =
      window.localStorage.getItem(
        KITCHEN_LAYOUT_STORAGE_KEY
      );


    if(saved){

      const parsed =
        JSON.parse(
          saved
        );


      if(
        isValidKitchenLayout(
          parsed
        )
      ){

        return cloneKitchenLayout(
          parsed
        );

      }

    }

  }
  catch(error){

    console.warn(
      "Kitchen layout override could not be loaded.",
      error
    );

  }


  return cloneKitchenLayout(
    KitchenLayout
  );

}


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


  window.localStorage.setItem(

    KITCHEN_LAYOUT_STORAGE_KEY,

    JSON.stringify(
      layout
    )

  );

}


export function clearRuntimeKitchenLayout(){

  window.localStorage.removeItem(
    KITCHEN_LAYOUT_STORAGE_KEY
  );

}
