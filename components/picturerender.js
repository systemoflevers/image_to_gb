import { SimpleTwoBitCanvas } from "./simpletwobitcanvas.js";
import { TileMap, TileSet } from "../modules/tile_collections.js";
import { imageToCanvas, imageDataToColourIndexedTiles } from "../modules/image_conversion.js";
import { ditherToColourIndex } from "../modules/dither.js";
import { pixelArrayToTiles } from "../modules/data_conversion.js";
import { kMeans } from "../modules/kmeans.js";
import { kGreenColours } from "../modules/colours.js";

const kTemplate = document.createElement('template');
kTemplate.innerHTML = `
<div id="container">
  <simple-two-bit-canvas id="drawing"></simple-two-bit-canvas>
`;

export class PictureRender extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(kTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    /** @type{SimpleTwoBitCanvas} */
    this.drawing = this.shadowRoot.getElementById('drawing');
    this.width = 160;
    this.height = 144;
  }
  draw({image, contrast, brightness, tileCount}) {
    image ??= this.image;
    contrast ??= this.contrast ?? 1;
    brightness ??= this.brightness ?? 1;
    tileCount ??= this.tileCount ?? 360;
    const needConvertToRawTiles =
      image !== this.image ||
      contrast !== this.contrast ||
      brightness !== this.brightness;
    const needTileReduction = needConvertToRawTiles || tileCount !== this.tileCount;
    this.image = image;
    this.contrast = contrast;
    this.brightness = brightness;
    this.tileCount = tileCount

    if (!this.image) {
      return;
    }
    if (needConvertToRawTiles) {
      this.image = image ?? this.image;
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');
      ctx.filter = `contrast(${this.contrast}) brightness(${this.brightness})`;
      imageToCanvas(this.image, canvas, 'crop');
      ctx.filter = '';

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      this.rawTiles = imageDataToColourIndexedTiles(
        imageData,
        ditherToColourIndex,
        (pixels) => pixelArrayToTiles(pixels, 160, 144).tiles
      );
    }
    if (!needTileReduction) {
      return;
    }

    const [_, reducedTiles, assignments] = kMeans(this.rawTiles, tileCount, {round: true});

    const tileSet = new TileSet(tileCount);
    for (let i = 0; i < tileCount; ++i) {
      tileSet.setTile(i, reducedTiles[i]);
    }
    const tileMap = new TileMap(20, 18, tileSet);
    for (let i = 0; i < 360; ++i) {
      tileMap.setTile(i, assignments[i]);
    }
  
    this.drawing.draw(tileMap, tileSet, kGreenColours, 0, 0);

  }
}
customElements.define('picture-render', PictureRender);