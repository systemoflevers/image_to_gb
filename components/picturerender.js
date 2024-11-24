import { SimpleTwoBitCanvas } from "./simpletwobitcanvas.js";
import { TileMap, TileSet } from "../modules/tile_collections.js";
import { imageToCanvas, imageDataToColourIndexedTiles } from "../modules/image_conversion.js";
import { ditherToColourIndex, toNearestColourIndex } from "../modules/dither.js";
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
    const ctx = this.drawing.canvas.getContext('2d');
    ctx.fillStyle = 'rgb(240 248 208)';
    ctx.fillRect(0, 0, 160, 144);
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
      const hasFilter = !!ctx.filter;
      ctx.filter = `contrast(${this.contrast}) brightness(${this.brightness})`;
      imageToCanvas(this.image, canvas, 'crop');
      ctx.filter = 'none';

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (!hasFilter) {
        // polyfill for safari and other browsers that don't implement filter.
        for (let i = 0; i < canvas.width * canvas.height; ++i) {
          for (let j = 0; j < 3; ++j) {
            let value = imageData.data[i * 4 + j];
            value = Math.min(255, value * contrast + (0.5 - contrast * 0.5) * 256);
            value = Math.min(255, value * brightness);
            imageData.data[i * 4 + j] = value;
          }
        }
      }
      this.rawTiles = imageDataToColourIndexedTiles(
        imageData,
        ditherToColourIndex,
        //toNearestColourIndex,
        (pixels) => pixelArrayToTiles(pixels, 160, 144).tiles
      );
    }
    if (!needTileReduction) {
      return;
    }

    // Make an initial centroid set by deduping the tiles and taking the first
    // `tileCount`.
    const uniqueStringTiles = new Set();
    for (const t of this.rawTiles) {
      uniqueStringTiles.add(t.toString());
    }
    const uniqueTiles = [];
    for (const st of uniqueStringTiles) {
      uniqueTiles.push(Uint8Array.from(st.split(',')));
    }
    this.uniqueTileCount = uniqueTiles.length;
    const initialCentroids = uniqueTiles.slice(0, this.tileCount);
    // if there are too few unique tiles just repeat them until there are
    // enough. This is wasteful because I don't actually need to do k-means in
    // this case. I just don't feel like writing code to construct a tile map.
    if (initialCentroids.length < this.tileCount) {
      const diff = this.tileCount - initialCentroids.length
      for (let i = 0; i < diff; ++i) {
        initialCentroids.push(initialCentroids[i]);
      }
    }
    if (this.tileCount === 360) {
      // special case when no kmeans is done
      const tileSet = new TileSet(this.tileCount);
      for (let i = 0; i < tileCount; ++i) {
        tileSet.setTile(i, this.rawTiles[i]);
      }

      this.tileMap = TileMap.makeFullMap(20, 18);
      this.tileMap.tileSet = tileSet;
      this.drawing.draw(this.tileMap, tileSet, kGreenColours, 0, 0);
      return;
    }
    const [_, reducedTiles, assignments] = kMeans(this.rawTiles, this.tileCount, {round: true, initialCentroids});

    const tileSet = new TileSet(tileCount);
    for (let i = 0; i < tileCount; ++i) {
      tileSet.setTile(i, reducedTiles[i]);
    }
    /** @type{TileMap} */
    this.tileMap = new TileMap(20, 18, tileSet);
    for (let i = 0; i < 360; ++i) {
      this.tileMap.setTile(i, assignments[i]);
    }
  
    this.drawing.draw(this.tileMap, tileSet, kGreenColours, 0, 0);
  }
}
customElements.define('picture-render', PictureRender);