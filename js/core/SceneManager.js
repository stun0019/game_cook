export class SceneManager {

  constructor(
    context
  ){

    this.context =
      context;

    this.registry =
      new Map();

    this.currentScene =
      null;

    this.currentName =
      null;

    this.changing =
      false;

  }

  register(
    name,
    SceneClass
  ){

    this.registry.set(
      name,
      SceneClass
    );

    return this;

  }

  async changeScene(
    name,
    payload = {}
  ){

    if(
      this.changing
    ){

      return;

    }

    const SceneClass =
      this.registry.get(
        name
      );

    if(
      !SceneClass
    ){

      throw new Error(
        `Scene not registered: ${name}`
      );

    }

    this.changing =
      true;

    try{

      if(
        this.currentScene
      ){

        await this.currentScene
          .exit?.();

        this.currentScene
          .destroy?.();

      }

      this.context
        .input
        .reset();

      this.context
        .sceneRoot
        .innerHTML = "";

      this.context
        .uiRoot
        .innerHTML = "";

      this.context
        .threeRoot
        .innerHTML = "";

      const scene =
        new SceneClass({

          ...this.context,

          sceneManager:
            this

        });

      this.currentScene =
        scene;

      this.currentName =
        name;

      await scene
        .enter?.(
          payload
        );

    }
    finally{

      this.changing =
        false;

    }

  }

  async destroy(){

    if(
      this.currentScene
    ){

      await this.currentScene
        .exit?.();

      this.currentScene
        .destroy?.();

    }

    this.context
      .input
      .destroy();

  }

}
