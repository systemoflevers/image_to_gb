import { PictureRender } from "../../components/picturerender.js"
import { ImageSettings } from "../../components/imagesettings.js"
import { genROM, updateGlobalChecksum } from "../../modules/gen_rom.js";

/** @type{PictureRender} */
const pictureRender = document.querySelector('picture-render');
/** @type{ImageSettings} */
const imageSettings = document.querySelector('image-settings');

imageSettings.fileChange = async (file) => {
  const bitmap = await createImageBitmap(file);
  pictureRender.draw({image: bitmap});
  updateUniqueTileCount();
};
imageSettings.brightnessChange = (brightness) => {
  pictureRender.draw({brightness});
  updateUniqueTileCount();
};
imageSettings.contrastChange = (contrast) => {
  pictureRender.draw({contrast});
  updateUniqueTileCount();
};
imageSettings.tileCountChange = (tileCount) => {
  pictureRender.draw({tileCount});
};

function updateUniqueTileCount() {
  const countContainer = document.getElementById('unique-tile-count');
  countContainer.innerText = 'hi';
  countContainer.innerText = pictureRender.uniqueTileCount;
}

function downloadROM() {
  const a = document.createElement('a');
  a.download = 'picture.gb';
  const romData = genROM(pictureRender.tileMap);
  //updateGlobalChecksum(romData)
  const dataUrl = URL.createObjectURL(new Blob([romData], {type: "octet/stream"}));
  a.href = dataUrl;
  a.click();
}
document.getElementById('download-button').onclick = downloadROM;