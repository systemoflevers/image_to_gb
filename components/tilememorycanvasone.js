import { SimpleTwoBitCanvas } from "./simpletwobitcanvas.js";
import { elementReady } from "../../modules/dom.js";
import { TileSet, TileMap } from "../../modules/tile_collections.js";
import { kGreenColours } from "../../modules/colours.js";

const GAP = 2;
export const kCanvasWidth = 16 * 8 + 15 * GAP;
const CANVAS_HEIGHT = 16 * 8 + 15 * GAP;

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
simple-two-bit-canvas {
  visibility: hidden;
  display: none;
}
#mem {
  width: 100%;
  image-rendering: pixelated;
}
</style>
<div id="container">
  <canvas id="mem" width="${kCanvasWidth}" height="${CANVAS_HEIGHT}"></canvas>
  <simple-two-bit-canvas height="${256 * 8}" width="8"></simple-two-bit-canvas>
</div>
`;

export class TileMemoryCanvasOne extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.readyPromise = new Promise((res, rej) => this.readyResolver = res);
    this.readyPromise.then(() => this.dispatchEvent(new Event('ready')));
  }

  async connectedCallback() {
    /** @type{!SimpleTwoBitCanvas} */
    this.sourceDrawing = this.shadowRoot.querySelector('simple-two-bit-canvas');
    await elementReady(this.sourceDrawing);

    this.tileMap = new TileMap(1, 256, new TileSet(256));
    for  (let i = 0; i < 256; ++i) {
      this.tileMap.setTile(i, i);
    }

    /** @type{!HTMLCanvasElement} */
    this.destCanvas = this.shadowRoot.getElementById('mem');
    this.destCtx = this.destCanvas.getContext('2d');

    this.readyResolver();
  }

  drawTile(x, y) {
    const xGap = x * GAP;
    const yGap = y * GAP;
    const tileIndex = y * 16 + x;

    this.destCtx.drawImage(this.sourceDrawing.canvas,
      0, tileIndex * 8, 8, 8,
      x * 8 + xGap, y * 8 + yGap, 8, 8);
  }
  /**
   * @param {!TileSet} tileSet 
   */
  draw(tileSet, palette=kGreenColours) {
    this.sourceDrawing.draw(this.tileMap, tileSet, palette, 0, 0);
    for (let y = 0; y < 16; ++y) {
      for (let x = 0; x < 16; ++x) {
        this.drawTile(x, y);
      }
    }
  }

  getTileRect(tileIndex) {
    const fullRect = this.destCanvas.getBoundingClientRect();
    const tilePixelWidth = fullRect.width / (8 * 16 + GAP * 15);
    const tileWidth = 8 * tilePixelWidth;
    const gap = GAP * tilePixelWidth;
    const column = tileIndex % 16;
    const row = Math.floor(tileIndex / 16);
    return new DOMRect(
      fullRect.x + column * tileWidth + (column) * gap,
      fullRect.y + row * tileWidth + (row) * gap,
      tileWidth, tileWidth);
  }
}
customElements.define('tile-memory-canvas-one', TileMemoryCanvasOne);