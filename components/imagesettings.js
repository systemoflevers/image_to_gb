const kTemplate = document.createElement('template');
kTemplate.innerHTML = `
<style>
  #modify-controls {
    display: flex;
    flex-direction: column;
    /*align-items: center;*/
    gap: 0.3em;
  }
  #modify-controls[hidden] {
    display: none;
  }
  #tile-control-container {
    display: flex;
    flex-direction: column;
  }
  span:has(#limit-tiles) {
    align-self: center;
    display: flex;
    align-items: center;
  }
  span:has(#limit-tiles:not(:checked)) + span {
    opacity: 0.5;
  }
  #limit-tiles {
    width: 2em;
    height: 2em;
  }
</style>
<input id="file" type="file" accept="image/*">
<div id="modify-controls" hidden>
  <span>contrast:<input id="contrast" type="range" min="0" max="300" value="100"><span>1</span></span>
  <span>brightness:<input id="brightness" type="range" min="0" max="300" value="100"><span>1</span></span>
  <div id="tile-control-container">
    <span><label for="limit-tiles">limit tiles:</label><input type="checkbox" name="limit-tiles" id="limit-tiles"></span>
    <span>max tile count:<input id="tile-count" disabled type="range" min="1" max="256" value="256"><span>256</span></span>
  <div>
</div>
`;

export class ImageSettings extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(kTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    /** @type{HTMLInputElement} */
    this.fileInput = this.shadowRoot.getElementById('file');
    /** @type{HTMLDivElement} */
    this.modifyContainer = this.shadowRoot.getElementById('modify-controls');
    /** @type{HTMLInputElement} */
    this.contrastInput = this.shadowRoot.getElementById('contrast');
    /** @type{HTMLInputElement} */
    this.brightnessInput = this.shadowRoot.getElementById('brightness');
    /** @type{HTMLInputElement} */
    this.tileCountEnable = this.shadowRoot.getElementById('limit-tiles');
    /** @type{HTMLInputElement} */
    this.tileCountInput = this.shadowRoot.getElementById('tile-count');

    this.fileInput.addEventListener('change', () => {
      this.fileChange?.(this.fileInput.files[0]);
      this.modifyContainer.hidden = false;
    });
    this.contrastInput.addEventListener('input', () => {
      const value = Number(this.contrastInput.value) / 100;
      this.contrastChange?.(value);
      this.contrastInput.nextSibling.innerHTML = value;
    });
    this.brightnessInput.addEventListener('input', () => {
      const value = Number(this.brightnessInput.value) / 100;
      this.brightnessChange?.(value);
      this.brightnessInput.nextSibling.innerHTML = value;
    });
    this.tileCountEnable.addEventListener('change', () => {
      if (this.tileCountEnable.checked) {
        this.tileCountInput.parentElement.hidden = false;
        this.tileCountInput.disabled = false;
        const value = Number(this.tileCountInput.value);
        this.tileCountChange?.(value);

      } else {
        this.tileCountInput.disabled = true;
        this.tileCountChange?.(360);
      }
    })
    this.tileCountInput.addEventListener('input', () => {
      if (!this.tileCountEnable.checked) return;

      const value = Number(this.tileCountInput.value);
      this.tileCountChange?.(value);
      this.tileCountInput.nextSibling.innerHTML = value;
    });
  }
}
customElements.define('image-settings', ImageSettings);