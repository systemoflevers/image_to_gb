import { SimpleTwoBitCanvas } from "../../components/simpletwobitcanvas.js";
import { TileSet, TileMap } from "../../modules/tile_collections.js";
import { pixelArrayToTiles } from "../../modules/data_conversion.js";
import { imageDataToColourIndexedTiles, imageToCanvas } from "../../modules/image_conversion.js";
import { ditherToColourIndex } from "../../modules/dither.js";
import { kGreenColours } from "../../modules/colours.js"
import { kMeans } from "../../modules/kmeans.js";

let canvas;
let img = new Image();
img.src = 'img.jpg';
await img.decode();
canvas = document.createElement('canvas');
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


/** @type{HTMLInputElement} */
const tileCountInput = document.getElementById('tile-count');
tileCountInput.addEventListener('input', () => {
  const tileCount = Number(tileCountInput.value);
  imageToGb(tileCount);
});
let nextTileCount = 1;
async function imageToGb(tileCount) {
  const start = performance.now();
  const [_, reducedTiles, assignments] = kMeans(tiles, tileCount, {round: true});
  const end = performance.now();
  const duration = end - start;
  const msg =`total time: ${duration}, fps: ${1000 / (duration)}`;
  //console.log(msg);

  const tileSet = new TileSet(tileCount);
  for (let i = 0; i < tileCount; ++i) {
    tileSet.setTile(i, reducedTiles[i]);
  }
  const tileMap = new TileMap(20, 18, tileSet);
  for (let i = 0; i < 360; ++i) {
    tileMap.setTile(i, assignments[i]);
  }

  /** @type{SimpleTwoBitCanvas} */
  const drawing = document.getElementById('drawing');
  drawing.draw(tileMap, tileSet, kGreenColours, 0, 0);
}

let step = 0
async function animate(t) {
  let nextTileCount;
  if (step < 10) {
    nextTileCount = Math.max(step, 1);
  } else {
    nextTileCount = Math.floor(Math.pow(step, 2));
  }
  ++step;
  console.log(t, nextTileCount)
  imageToGb(Math.min(nextTileCount, 360));
  if (nextTileCount > 360) {
    return
  }
  requestAnimationFrame(animate);
}

//animate();
imageToGb(360);