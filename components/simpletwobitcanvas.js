import { drawCanvas, drawCanvasWithWindow, drawCanvasWithOnlyWindow, drawGrid } from "../modules/rendering.js";
import { TileMap, TileSet } from "../modules/tile_collections.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
#container {
  display: flex;
  position: relative;
}
canvas {
  width: 100%;
}
#drawing-canvas {
  image-rendering: pixelated;
  width: 100%;
}
#grid-canvas {
  pointer-events: none;
  position: absolute;
  z-index: 2;
  opacity: 0;
}
</style>
<div id="container">
  <canvas id="drawing-canvas"></canvas>
  <canvas id="grid-canvas"></canvas>
</div>
`;

export class SimpleTwoBitCanvas extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.readyPromise = new Promise((res, rej) => this.readyResolver = res);
    this.readyPromise.then(() => this.dispatchEvent(new Event('ready')));
  }

  static get observedAttributes() { return ['width', 'height']; }
  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    await this.readyPromise;
    this.width = parseInt(this.getAttribute('width')) || this.width;
    this.height = parseInt(this.getAttribute('height')) || this.height;
    this.imageData = this.context.getImageData(0, 0, this.width, this.height);
    this.style.aspectRatio = `${this.width}/${this.height}`;
  }

  async connectedCallback() {
    /** @type{!HTMLCanvasElement} */
    this.canvas = this.shadowRoot.getElementById('drawing-canvas');
    /** @type{!HTMLCanvasElement} */
    this.grid = this.shadowRoot.getElementById('grid-canvas');
    this.gridContext = this.grid.getContext('2d');
    this.width = parseInt(this.getAttribute('width') ?? '160');
    this.height = parseInt(this.getAttribute('height') ?? '144');

    /** @type{!CanvasRenderingContext2D} */
    this.context = this.canvas.getContext('2d');

    /** @type{!ImageData} */
    this.imageData = this.context.getImageData(0, 0, this.width, this.height);
    this.readyResolver();
  }

  async init(colour) {
    await this.readyPromise;
    const [r, g, b] = colour;
    this.context.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.context.fillRect(0, 0, this.width, this.height);
  }

  get width() {
    return this.canvas.width;
  }
  set width(value) {
    this.canvas.width = value;
    this.grid.width = value * 4;
  }
  get height() {
    return this.canvas.height;
  }
  set height(value) {
    this.canvas.height = value;
    this.grid.height = value * 4;
  }

  draw(tileMap, tileSet, palette, vx, vy, blankTileValues, offsets=undefined) {
    drawCanvas(this.context, this.imageData, tileMap, tileSet, palette, vx, vy, blankTileValues, offsets);
    drawGrid(this.gridContext, vx, vy, 32);
  }

  drawWithWindow(bgTileMap, winTileMap, tileSet, palette, vx, vy, wx, wy, offsets=undefined, winBug=true) {
    drawCanvasWithWindow(this.context, this.imageData, bgTileMap, winTileMap, tileSet, palette, vx, vy, wx, wy, offsets, winBug);
    drawGrid(this.gridContext, vx, vy, 32);
  }
  drawOnlyWindow(winTileMap, tileSet, palette, vx, vy, wx, wy, offsets=undefined, winBug=true) {
    drawCanvasWithOnlyWindow(this.context, this.imageData, winTileMap, tileSet, palette, vx, vy, wx, wy, offsets, winBug);
    drawGrid(this.gridContext, vx, vy, 32);
  }
}
customElements.define('simple-two-bit-canvas', SimpleTwoBitCanvas);