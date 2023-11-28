import { genROM } from "../modules/gen_rom.js";
import { RomData } from "../modules/rom_data.js";
import { TileMap } from "../modules/tile_collections.js";

const kTemplate = document.createElement('template');
kTemplate.innerHTML = `
<style>
  button {
    height: 3em;
    background: #9a2257;
    color: white;
    border-radius: 1.5em;
  }
</style>
<button>download ROM</button>
`;

export class DownloadRom extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(kTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    /** @type{HTMLButtonElement} */
    this.button = this.shadowRoot.querySelector('button');

    this.button.addEventListener('click', () => this.download());

    /** @type{RomData} */
    this.romSrc = undefined;

    /** @type{TileMap} */
    this.tileMap = undefined;
  }

  download() {
    if (!this.romSrc || !this.tileMap) {
      return;
    }
    const a = document.createElement('a');
    a.download = 'picture.gb';
    const romData = genROM(this.tileMap, this.romSrc);
    //updateGlobalChecksum(romData)
    const dataUrl = URL.createObjectURL(new Blob([romData], {type: "octet/stream"}));
    a.href = dataUrl;
    a.click();
    setTimeout(() => URL.revokeObjectURL(dataUrl));
  }
}
customElements.define('download-rom', DownloadRom);