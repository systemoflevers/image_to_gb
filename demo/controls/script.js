import { PictureRender } from "../../components/picturerender.js"
import { ImageSettings } from "../../components/imagesettings.js"
import { genROM, updateGlobalChecksum } from "../../modules/gen_rom.js";
import { DownloadRom } from "../../components/downloadrom.js";
import { kSmallFull } from "../../modules/rom_data.js";

/** @type{PictureRender} */
const pictureRender = document.querySelector('picture-render');
/** @type{ImageSettings} */
const imageSettings = document.querySelector('image-settings');
/** @type{DownloadRom} */
const downloadRom = document.querySelector('download-rom');

imageSettings.fileChange = async (file) => {
  const bitmap = await createImageBitmap(file);
  pictureRender.draw({image: bitmap});
  downloadRom.hidden = false;
  document.getElementById('img-download').hidden = false;
  pictureRender.hidden = false;
  document.getElementById('initial-instructions').hidden = true;
  updateUniqueTileCount();
  updateDownload();
};
imageSettings.brightnessChange = (brightness) => {
  pictureRender.draw({brightness});
  updateUniqueTileCount();
  updateDownload();
};
imageSettings.contrastChange = (contrast) => {
  pictureRender.draw({contrast});
  updateUniqueTileCount();
  updateDownload();
};
imageSettings.tileCountChange = (tileCount) => {
  pictureRender.draw({tileCount});
  updateDownload();
};

function updateUniqueTileCount() {
  const countContainer = document.getElementById('unique-tile-count');
  countContainer.innerText = 'hi';
  countContainer.innerText = pictureRender.uniqueTileCount;
}
function updateDownload() {
  downloadRom.tileMap = pictureRender.tileMap;
  downloadRom.romSrc = kSmallFull;
}

function downloadImage() {
  const dataUrl = pictureRender.drawing.canvas.toDataURL();
  const a = document.createElement('a');
  a.download = 'image.png';
  a.href = dataUrl;
  a.click();
}
document.getElementById('img-download').addEventListener('click', downloadImage);