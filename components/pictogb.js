import { PictureRender } from "./picturerender.js";
import { ImageSettings } from "./imagesettings.js";
import { DownloadRom } from "./downloadrom.js";
import { kSmallFull, kSmall256Max } from "../modules/rom_data.js";

const kTemplate = document.createElement('template');
kTemplate.innerHTML = `
<style>
  @media (max-aspect-ratio: 1) {
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
  }
  picture-render {
    aspect-ratio: 160/144;
    display: block;
  }
  picture-render[hidden] {
    display: none;
  }
  image-settings {
    display: flex;
    flex-direction: column;
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
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  button {
    height: 3em;
  }
</style>
<div id="container">
  <picture-render hidden></picture-render>
  <div id="control-container">
    <div id="file-container">
      <div id="initial-instructions">
        select an image
      </div>
      <image-settings></image-settings>
    </div>
    <div id="tile-count-container" hidden>unique tile count <span id="unique-tile-count">??</span></div>
    <button id="img-download" alt="download image" hidden>download image</button>
    <download-rom hidden></download-rom>
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
    
    this.imageSettings.fileChange = async (file) => {
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