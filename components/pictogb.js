import { PictureRender } from "./picturerender.js";
import { ImageSettings } from "./imagesettings.js";
import { DownloadRom } from "./downloadrom.js";
import { kSmallFull, kSmall256Max } from "../modules/rom_data.js";

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
      <download-rom></download-rom>
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
      if (tileCount === 360) {
        this.updateDownload();
      } else {
        this.updateDownload(kSmall256Max);
      }
    };

    this.shadowRoot.getElementById('img-download').addEventListener('click', () => this.downloadImage());
  }

  updateUniqueTileCount() {
    const countContainer = this.shadowRoot.getElementById('unique-tile-count');
    countContainer.innerText = this.pictureRender.uniqueTileCount;
  }
  updateDownload(romSrc = kSmallFull) {
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
}
customElements.define('pic-to-gb', PicToGB);