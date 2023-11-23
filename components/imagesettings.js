const kTemplate = document.createElement('template');
kTemplate.innerHTML = `
<input id="file" type="file" accept="image/*">
<span>contrast:<input id="contrast" type="range" min="0" max="300" value="100"><span>1</span></span>
<span>brightness:<input id="brightness" type="range" min="0" max="300" value="100"><span>1</span></span>
<span>tile count:<input id="tile-count" type="range" min="1" max="360" value="360"><span>360</span></span>
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
    /** @type{HTMLInputElement} */
    this.contrastInput = this.shadowRoot.getElementById('contrast');
    /** @type{HTMLInputElement} */
    this.brightnessInput = this.shadowRoot.getElementById('brightness');
    /** @type{HTMLInputElement} */
    this.tileCountInput = this.shadowRoot.getElementById('tile-count');

    this.fileInput.addEventListener('change', () => {
      this.fileChange?.(this.fileInput.files[0]);
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
    this.tileCountInput.addEventListener('input', () => {
      const value = Number(this.tileCountInput.value);
      this.tileCountChange?.(value);
      this.tileCountInput.nextSibling.innerHTML = value;
    });
  }
}
customElements.define('image-settings', ImageSettings);