import { PictureRender } from "../../components/picturerender.js";

async function doStuff() {
  const image = new Image();
  image.src = './img.jpg';
  await image.decode();

  /** @type{PictureRender} */
  const pictureRender = document.getElementById('picture');

  pictureRender.draw({image, contrast: 1.5, brightness: 2, tileCount: 180});

  /** @type {HTMLInputElement} */
  const tileCountInput = document.getElementById('tile-count');
  tileCountInput.addEventListener('change', () => {
    pictureRender.draw({tileCount: Number(tileCountInput.value)});
  });
}

doStuff();