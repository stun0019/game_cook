export class InputManager {

  constructor(){

    this.keys =
      new Set();

    this.actions =
      new Map();

    this.touchVector = {
      x:0,
      y:0
    };

    this.domCleanups =
      [];

    this.handleKeyDown =
      this.handleKeyDown.bind(
        this
      );

    this.handleKeyUp =
      this.handleKeyUp.bind(
        this
      );

    window.addEventListener(
      "keydown",
      this.handleKeyDown,
      {
        passive:false
      }
    );

    window.addEventListener(
      "keyup",
      this.handleKeyUp,
      {
        passive:true
      }
    );

  }

  handleKeyDown(
    event
  ){

    const blockedCodes = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "KeyE",
      "KeyQ",
      "Escape"
    ];

    if(
      blockedCodes.includes(
        event.code
      )
    ){

      event.preventDefault();

    }

    this.keys.add(
      event.code
    );

    if(
      event.repeat
    ){

      return;

    }

    if(
      event.code === "KeyE" ||
      event.code === "Space"
    ){

      this.emit(
        "interact"
      );

    }

    if(
      event.code ===
      "KeyQ"
    ){

      this.emit(
        "discard"
      );

    }

    if(
      event.code ===
      "Escape"
    ){

      this.emit(
        "pause"
      );

    }

  }

  handleKeyUp(
    event
  ){

    this.keys.delete(
      event.code
    );

  }

  on(
    action,
    handler
  ){

    if(
      !this.actions.has(
        action
      )
    ){

      this.actions.set(
        action,
        new Set()
      );

    }

    this.actions
      .get(
        action
      )
      .add(
        handler
      );

    return () => {

      this.actions
        .get(
          action
        )
        ?.delete(
          handler
        );

    };

  }

  emit(
    action,
    payload
  ){

    this.actions
      .get(
        action
      )
      ?.forEach(
        handler => handler(
          payload
        )
      );

  }

  getMovement(){

    let x =
      this.touchVector.x;

    let y =
      this.touchVector.y;

    if(
      this.keys.has(
        "ArrowLeft"
      ) ||
      this.keys.has(
        "KeyA"
      )
    ){

      x -= 1;

    }

    if(
      this.keys.has(
        "ArrowRight"
      ) ||
      this.keys.has(
        "KeyD"
      )
    ){

      x += 1;

    }

    if(
      this.keys.has(
        "ArrowUp"
      ) ||
      this.keys.has(
        "KeyW"
      )
    ){

      y -= 1;

    }

    if(
      this.keys.has(
        "ArrowDown"
      ) ||
      this.keys.has(
        "KeyS"
      )
    ){

      y += 1;

    }

    const length =
      Math.hypot(
        x,
        y
      );

    if(
      length > 1
    ){

      x /=
        length;

      y /=
        length;

    }

    return {
      x,
      y
    };

  }

  attachJoystick(
    base,
    stick
  ){

    let pointerId =
      null;

    const logicalTravel =
      34;

    const update =
      event => {

        const rect =
          base.getBoundingClientRect();

        const centerX =
          rect.left +
          rect.width / 2;

        const centerY =
          rect.top +
          rect.height / 2;

        const maxDistance =
          rect.width *
          .3;

        let dx =
          event.clientX -
          centerX;

        let dy =
          event.clientY -
          centerY;

        const distance =
          Math.hypot(
            dx,
            dy
          );

        if(
          distance >
          maxDistance
        ){

          dx =
            dx /
            distance *
            maxDistance;

          dy =
            dy /
            distance *
            maxDistance;

        }

        const nx =
          dx /
          maxDistance;

        const ny =
          dy /
          maxDistance;

        this.touchVector.x =
          nx;

        this.touchVector.y =
          ny;

        stick.style.transform =
          `translate(
            calc(-50% + ${nx * logicalTravel}px),
            calc(-50% + ${ny * logicalTravel}px)
          )`;

      };

    const reset =
      () => {

        pointerId =
          null;

        this.touchVector.x =
          0;

        this.touchVector.y =
          0;

        stick.style.transform =
          "translate(-50%,-50%)";

      };

    const onDown =
      event => {

        pointerId =
          event.pointerId;

        base.setPointerCapture(
          pointerId
        );

        update(
          event
        );

      };

    const onMove =
      event => {

        if(
          event.pointerId ===
          pointerId
        ){

          update(
            event
          );

        }

      };

    const onUp =
      event => {

        if(
          pointerId === null ||
          event.pointerId ===
          pointerId
        ){

          reset();

        }

      };

    base.addEventListener(
      "pointerdown",
      onDown
    );

    base.addEventListener(
      "pointermove",
      onMove
    );

    base.addEventListener(
      "pointerup",
      onUp
    );

    base.addEventListener(
      "pointercancel",
      onUp
    );

    const cleanup =
      () => {

        base.removeEventListener(
          "pointerdown",
          onDown
        );

        base.removeEventListener(
          "pointermove",
          onMove
        );

        base.removeEventListener(
          "pointerup",
          onUp
        );

        base.removeEventListener(
          "pointercancel",
          onUp
        );

        reset();

      };

    this.domCleanups.push(
      cleanup
    );

    return cleanup;

  }

  bindActionButton(
    button,
    action
  ){

    const handler =
      event => {

        event.preventDefault();

        this.emit(
          action
        );

      };

    button.addEventListener(
      "pointerdown",
      handler
    );

    const cleanup =
      () => {

        button.removeEventListener(
          "pointerdown",
          handler
        );

      };

    this.domCleanups.push(
      cleanup
    );

    return cleanup;

  }

  reset(){

    this.keys.clear();

    this.touchVector.x =
      0;

    this.touchVector.y =
      0;

    this.domCleanups
      .splice(
        0
      )
      .forEach(
        cleanup => cleanup()
      );

    this.actions.clear();

  }

  destroy(){

    this.reset();

    window.removeEventListener(
      "keydown",
      this.handleKeyDown
    );

    window.removeEventListener(
      "keyup",
      this.handleKeyUp
    );

  }

}
