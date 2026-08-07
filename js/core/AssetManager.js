export class AssetManager {

  constructor(){

    this.images =
      new Map();

  }

  async loadImage(
    key,
    url
  ){

    if(
      this.images.has(
        key
      )
    ){

      return this.images.get(
        key
      );

    }

    const image =
      new Image();

    image.decoding =
      "async";

    const promise =
      new Promise(
        (
          resolve,
          reject
        ) => {

          image.addEventListener(
            "load",
            () => resolve(
              image
            ),
            {
              once:true
            }
          );

          image.addEventListener(
            "error",
            () => reject(
              new Error(
                `Failed to load image: ${url}`
              )
            ),
            {
              once:true
            }
          );

        }
      );

    image.src =
      url;

    const loadedImage =
      await promise;

    this.images.set(
      key,
      loadedImage
    );

    return loadedImage;

  }

  async preload(
    manifest,
    onProgress = () => {}
  ){

    if(
      !Array.isArray(
        manifest
      ) ||
      manifest.length === 0
    ){

      onProgress(
        1
      );

      return;

    }

    let completed =
      0;

    const tasks =
      manifest.map(
        async asset => {

          if(
            asset.type ===
            "image"
          ){

            await this.loadImage(
              asset.key,
              asset.url
            );

          }
          else{

            throw new Error(
              `Unsupported asset type: ${asset.type}`
            );

          }

          completed +=
            1;

          onProgress(
            completed /
            manifest.length
          );

        }
      );

    await Promise.all(
      tasks
    );

  }

  getImage(
    key
  ){

    return (
      this.images.get(
        key
      ) ||
      null
    );

  }

}
