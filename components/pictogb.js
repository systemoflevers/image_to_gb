import { PictureRender } from "./picturerender.js";
import { ImageSettings } from "./imagesettings.js";
import { DownloadRom } from "./downloadrom.js";
import { kSmallFull, kSmall256Max } from "../modules/rom_data.js";
import { drawCanvas } from "../modules/rendering.js";
import { TileMap } from "../modules/tile_collections.js";
import { kGreenColours } from "../modules/colours.js";

const kTemplate = document.createElement('template');
kTemplate.innerHTML = `
<style>
  /*@media (max-aspect-ratio: 1) {
    picture-render {
      width: 90%;
    }
  }
  @media (min-aspect-ratio: 7/4) {
    picture-render {
      height: 70%;
    }
  }
  @media (min-aspect-ratio: 1) and (max-aspect-ratio: 7/4) {
    picture-render {
      width: 50%;
    }
  }*/
  picture-render {
    position: relative;
    /*aspect-ratio: 160/144;*/
    display: block;


  --height-ratio: calc(56.65 / 100);
  --width-ratio: calc(74.6 / 100);
  padding: calc(6.525% / var(--width-ratio)) calc(13.625% / var(--width-ratio));
  width: calc(47.35% / var(--width-ratio));
  background-color: grey;
  --small-radius-base: 2.54%;
  --big-radius-base: 10.56%;
  border-top-left-radius: calc(var(--small-radius-base) / var(--width-ratio)) calc(var(--small-radius-base) / var(--height-ratio));
  border-bottom-left-radius: calc(var(--small-radius-base) / var(--width-ratio)) calc(var(--small-radius-base) / var(--height-ratio));
  border-top-right-radius: calc(var(--small-radius-base) / var(--width-ratio)) calc(var(--small-radius-base) / var(--height-ratio));
  border-bottom-right-radius: calc(var(--big-radius-base) / var(--width-ratio)) calc(var(--big-radius-base) / var(--height-ratio));
  }
  picture-render::before {
    display: block;
    content: " ";
    aspect-ratio: 1;
    width: 4%;
    border-radius: 50%;
    position: absolute;
    left: 6%;
    top: 34%;
    background-color: lightgray;
  }
  picture-render.on::before {
    background-color: red;
    box-shadow: 0 0 10px 0px red;
  }
  picture-render[hidden] {
    display: none;
  }
  image-settings {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  #container {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    height: 100%;
    position: relative;
  }
  #file-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #control-container {
    margin-top: 3%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  button {
    height: 3em;
    background: gray;/*#9a2257;*/
    color: navy;
    font-weight: bold;
    border-radius: 1.5em;
    rotate: -26deg;
    margin-top: 2em;
    width: 10em;
  }
  #button-container {
    display: flex;
    flex-direction: row;
    gap: 1em;
  }
  .button-overlay {
    position: absolute;
    background: #e7e7e7;
    translate: 0 -300%;
    transition: translate 0.5s;
    box-shadow: 5px 5px 15px 5px #000000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-bottom: 2em;
  }
  .button-overlay.show {
    translate: 0 0;
  }
  .overlay-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
  .overlay-close {
    padding: 8px;
    font-family: monospace;
    font-size: 1.5em;
    font-weight: bold;
    cursor: default;
  }
  #scaled-download-header {
    align-self: center;
  }
</style>
<div id="container">
  <picture-render></picture-render>
  <div id="control-container">
    <div id="file-container">
      <div id="initial-instructions" hidden>
        select an image
      </div>
      <image-settings></image-settings>
    </div>
    <div id="tile-count-container" hidden>unique tile count <span id="unique-tile-count">??</span></div>
    <div id="button-container">
      <button id="img-download" alt="download image">download image</button>
      <button id="other-download" alt="other downloads">other downloads</button>
    </div>
  </div>
  <div id="download-overlay" class="button-overlay">
    <div class="overlay-close">X</div>
    <div class="overlay-buttons">
      <button id="tiles-download" alt="download tile sheet">download tile sheet</button>
      <download-rom></download-rom>
    </div>
  </div>
  <div id="scale-image-download-overlay" class="button-overlay">  
    <div class="overlay-close">X</div>
    <div id="scaled-download-header">Scaled Images</div>
    <div class="overlay-buttons">
      <button id="image-download-1" alt="download image at 1x scale">1x</button>
      <button id="image-download-2" alt="download image at 2x scale">2x</button>
      <button id="image-download-4" alt="download image at 4x scale">4x</button>
      <button id="image-download-8" alt="download image at 4x scale">8x</button>
    </div>
  </div>
</div>
`;

export class PicToGB extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(kTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    /** @type{PictureRender} */
    this.pictureRender = this.shadowRoot.querySelector('picture-render');
    /** @type{ImageSettings} */
    this.imageSettings = this.shadowRoot.querySelector('image-settings');
    /** @type{DownloadRom} */
    this.downloadRom = this.shadowRoot.querySelector('download-rom');
    
    //customElements.whenDefined('download-rom').then(() => this.downloadRom.disable());
    this.imageSettings.fileChange = async (file) => {
      this.pictureRender.classList.add('on');
      const bitmap = await createImageBitmap(file);
      this.pictureRender.draw({image: bitmap});
      this.downloadRom.hidden = false;
      this.shadowRoot.getElementById('img-download').hidden = false;
      this.pictureRender.hidden = false;
      this.shadowRoot.getElementById('initial-instructions').hidden = true;
      this.updateUniqueTileCount();
      this.updateDownload();
    };
    this.imageSettings.brightnessChange = (brightness) => {
      this.pictureRender.draw({brightness});
      this.updateUniqueTileCount();
      this.updateDownload();
    };
    this.imageSettings.contrastChange = (contrast) => {
      this.pictureRender.draw({contrast});
      this.updateUniqueTileCount();
      this.updateDownload();
    };
    this.imageSettings.tileCountChange = (tileCount) => {
      this.pictureRender.draw({tileCount});
      this.updateDownload();
    };

    this.shadowRoot.getElementById('img-download').addEventListener('click', () => this.toggleImageDownload());
    this.shadowRoot.getElementById('tiles-download').addEventListener('click', () => this.downloadTileSheet());
    this.shadowRoot.getElementById('other-download').addEventListener('click', () => this.toggleOtherDownload());
    this.shadowRoot.querySelector('#download-overlay > .overlay-close').addEventListener('click', () => this.toggleOtherDownload());
    this.shadowRoot.querySelector('#scale-image-download-overlay > .overlay-close').addEventListener('click', () => this.toggleImageDownload());
    this.shadowRoot.getElementById('image-download-1').addEventListener('click', () => this.downloadScaledImage(1));
    this.shadowRoot.getElementById('image-download-2').addEventListener('click', () => this.downloadScaledImage(2));
    this.shadowRoot.getElementById('image-download-4').addEventListener('click', () => this.downloadScaledImage(4));
    this.shadowRoot.getElementById('image-download-8').addEventListener('click', () => this.downloadScaledImage(8));
  }

  pickRomSource() {
    if (this.pictureRender.tileCount === 360) {
      return kSmallFull;
    } else {
      return kSmall256Max;
    }
  }

  updateUniqueTileCount() {
    const countContainer = this.shadowRoot.getElementById('unique-tile-count');
    countContainer.innerText = this.pictureRender.uniqueTileCount;
  }
  updateDownload() {
    const romSrc = this.pickRomSource();
    this.downloadRom.tileMap = this.pictureRender.tileMap;
    this.downloadRom.romSrc = romSrc;
  }

  downloadImage() {
    const dataUrl = this.pictureRender.drawing.canvas.toDataURL();
    const a = document.createElement('a');
    a.download = 'image.png';
    a.href = dataUrl;
    a.click();
  }

  /**
   * 
   * @param {number} scale Should be 2, 3, or 4.
   */
  downloadScaledImage(scale) {
    //assert(scale >= 2 && scale <= 4);
    //assert(scale === Math.trunc(scale));
    const width = 160 * scale;
    const height = 144 * scale;

    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = width;
    scaledCanvas.height = height;

    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(
      this.pictureRender.drawing.canvas,
      0, 0, 160, 144, 0, 0, width, height);

    const dataUrl = scaledCanvas.toDataURL();
    const a = document.createElement('a');
    a.download = 'scaled_image.png';
    a.href = dataUrl;
    a.click();
  }

  downloadTileSheet() {
    const tileCount = this.pictureRender.tileCount;
    const heightInTiles = Math.ceil(tileCount / 16);
    const tileMap = new TileMap(16, heightInTiles, this.pictureRender.tileMap.tileSet);
    for (let i = 0; i < tileCount; ++i) {
      tileMap.tileMap[i] = i;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 16 * 8;
    canvas.height = heightInTiles * 8;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawCanvas(ctx, imageData, tileMap, tileMap.tileSet, kGreenColours, 0, 0);
    const dataUrl = canvas.toDataURL();
    const a = document.createElement('a');
    a.download = 'tiles.png';
    a.href = dataUrl;
    a.click();
  }
  
  toggleOtherDownload() {
    this.shadowRoot.getElementById('scale-image-download-overlay').classList.remove('show');
    this.shadowRoot.getElementById('download-overlay').classList.toggle('show');
  }
  toggleImageDownload() {
    this.shadowRoot.getElementById('download-overlay').classList.remove('show');
    this.shadowRoot.getElementById('scale-image-download-overlay').classList.toggle('show');
  }
}
customElements.define('pic-to-gb', PicToGB);