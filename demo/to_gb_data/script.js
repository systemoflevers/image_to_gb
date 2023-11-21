import { SimpleTwoBitCanvas } from "../../components/simpletwobitcanvas.js";
import { TileSet, TileMap } from "../../modules/tile_collections.js";
import { pixelArrayToTiles } from "../../modules/data_conversion.js";
import { imageDataToColourIndexedTiles, imageToCanvas } from "../../modules/image_conversion.js";
import { ditherToColourIndex } from "../../modules/dither.js";
import { kGreenColours } from "../../modules/colours.js"

async function imageToGb() {
  const img = new Image();
  img.src = 'img.jpg';
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 144;
  const ctx = canvas.getContext('2d');
  imageToCanvas(img, canvas, 'crop');

  const rgbImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const tiles = imageDataToColourIndexedTiles(
    rgbImageData,
    ditherToColourIndex,
    (pixels) => pixelArrayToTiles(pixels, 160, 144).tiles
  );

  const tileSet = new TileSet(360);
  for (let i = 0; i < 360; ++i) {
    tileSet.setTile(i, tiles[i]);
  }
  const tileMap = new TileMap(20, 18, tileSet);
  for (let i = 0; i < 360; ++i) {
    tileMap.setTile(i, i);
  }

  /** @type{SimpleTwoBitCanvas} */
  const drawing = document.getElementById('drawing');
  drawing.draw(tileMap, tileSet, kGreenColours, 0, 0);
}

imageToGb();