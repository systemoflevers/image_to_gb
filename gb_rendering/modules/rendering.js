import {TileMap, TileSet} from "./tile_collections.js";

class Viewport {
  /**
   * @param {number} width 
   * @param {number} height 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {!TileMap} tileMap 
 * @param {!TileSet} tileSet 
 * @param {Set<number>=} blankTileValues
 * @returns {number}
 */
function getTilemapPixel(x, y, tileMap, tileSet, blankTileValues=new Set()) {
  const tileX = Math.floor(x / 8);
  const tileY = Math.floor(y / 8);
  const mapIndex = tileY * tileMap.widthInTiles + tileX;
  const tileIndex = tileMap.tileMap[mapIndex];
  if (blankTileValues.has(tileIndex)) {
    return 4;
  }

  return tileSet.getPixel(tileIndex, x % 8, y % 8);
}

/**
 * 
 * @param {number} x In viewport coordinates
 * @param {number} y In Viewport coordinates
 * @param {!TileMap} tileMap 
 * @param {!TileSet} tileSet
 * @param {Viewport} viewport 
 * @param {Set<number>=} blankTileValues
 * @returns {number}
 */
function getViewportPixel(x, y, tileMap, tileSet, viewport, blankTileValues=new Set()) {
  const tilemapX = (x + viewport.x) % (tileMap.widthInTiles * 8);
  const tilemapY = (y + viewport.y) % (tileMap.heightInTiles * 8);
  return getTilemapPixel(tilemapX, tilemapY, tileMap, tileSet, blankTileValues);
}

/**
 * @param {number} row Zero based.
 * @param {number} width In pixels.
 * @param {function(number, number): number} pixelGetter 
 * @param {function(number, number)} pixelSetter 
 */
function drawRow(row, width, pixelGetter, pixelSetter) {
  for (let x = 0; x < width; ++x) {
    const i = x + row * width;
    const pixel = pixelGetter(x, row);
    pixelSetter(i, pixel);
  }
}

/**
 * 
 * @param {!CanvasRenderingContext2D} context 
 * @param {!ImageData} imageData
 * @param {!TileMap} tileMap 
 * @param {!TileSet} tileSet 
 * @param {[[number]]} colours Array of 4 sets of RGB values.
 * @param {number} vx
 * @param {number} vy 
 * @param {Set<number>=} blankTileValues
 */
function drawCanvas(context, imageData, tileMap, tileSet, colours, vx, vy, blankTileValues=new Set(), {xOffset = 0, yOffset = 0} = {}) {
  vx -= xOffset;
  vy -= yOffset;
  vx %= tileMap.widthInTiles * 8;
  if (vx < 0) {
    vx = tileMap.widthInTiles * 8 + vx;
  }
  vy %= tileMap.heightInTiles * 8;
  if (vy < 0) {
    vy = tileMap.heightInTiles * 8 + vy;
  }
  const viewport = new Viewport(imageData.width, imageData.height, vx, vy)
  const pixelGetter = (x, y) => getViewportPixel(x, y, tileMap, tileSet, viewport, blankTileValues);
  const pixelSetter = (i, pixel) => {
    if (pixel === 4) {
      imageData.data[i * 4] = 0;
      imageData.data[i * 4 + 1] = 0;
      imageData.data[i * 4 + 2] = 0;
      imageData.data[i * 4 + 3] = 0;
      return;
    }
    const colour = colours[pixel];
    imageData.data[i * 4] = colour[0];
    imageData.data[i * 4 + 1] = colour[1];
    imageData.data[i * 4 + 2] = colour[2];
    imageData.data[i * 4 + 3] = 255;
  };
  for (let row = 0; row < viewport.height; ++row) {
    drawRow(row, viewport.width, pixelGetter, pixelSetter);
  }
  context.putImageData(imageData, 0, 0);
}

/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} scx 
 * @param {*} scy
 * @param {*} wx 
 * @param {*} wy 
 * @param {*} xOffset 
 * @param {*} yOffset 
 * @param {*} winTileMap 
 * @param {*} tileSet 
 * @param {*} winBug
 * @returns 
 */
function winPixelGetter(x, y, scx, scy, wx, wy, xOffset, yOffset, winTileMap, tileSet, winBug = true) {
  if (winBug && wx === 166) {
    wx = scx % 8;
    if (y === wy) {
      return null;
    }
    if (y === 0) {
      wy = -255;
    }
  }
  wx += xOffset;
  wy += yOffset;
  wx -= 7;
  wx %= winTileMap.widthInTiles * 8;
  wy %= winTileMap.heightInTiles * 8;
  if (x >= wx && y >= wy ) {
    return getTilemapPixel(x - wx, y - wy, winTileMap, tileSet);
  }
  return null;
}

/**
 * 
 * @param {!CanvasRenderingContext2D} context 
 * @param {!ImageData} imageData 
 * @param {!TileMap} bgTileMap 
 * @param {!TileMap} winTileMap 
 * @param {!TileSet} tileSet 
 * @param {[[number]]} colours 
 * @param {number} vx 
 * @param {number} vy 
 * @param {number} wx 
 * @param {number} wy 
 */
function drawCanvasWithWindow(context, imageData, bgTileMap, winTileMap, tileSet, colours, vx, vy, wx, wy, {xOffset = 0, yOffset = 0} = {}, winBug = true) {
  if (winBug && wx === 0) {
    wx = vx % 8;
  }
  const viewport = new Viewport(imageData.width, imageData.height, vx - xOffset, vy - yOffset);
  const pixelGetter = (x, y) => {
    return winPixelGetter(x, y, vx, vy, wx, wy, xOffset, yOffset, winTileMap, tileSet, winBug) ??
      getViewportPixel(x, y, bgTileMap, tileSet, viewport);
  };
  const pixelSetter = (i, pixel) => {
    const colour = colours[pixel];
    imageData.data[i * 4] = colour[0];
    imageData.data[i * 4 + 1] = colour[1];
    imageData.data[i * 4 + 2] = colour[2];
    imageData.data[i * 4 + 3] = 255;
  };
  for (let row = 0; row < viewport.height; ++row) {
    drawRow(row, viewport.width, pixelGetter, pixelSetter);
  }
  context.putImageData(imageData, 0, 0);
}

/**
 * 
 * @param {!CanvasRenderingContext2D} context 
 * @param {!ImageData} imageData 
 * @param {!TileMap} winTileMap 
 * @param {!TileSet} tileSet 
 * @param {[[number]]} colours 
 * @param {number} vx 
 * @param {number} vy 
 * @param {number} wx 
 * @param {number} wy 
 */
function drawCanvasWithOnlyWindow(context, imageData, winTileMap, tileSet, colours, vx, vy, wx, wy, {xOffset = 0, yOffset = 0} = {}, winBug = true) {
  if (winBug && wx === 0) {
    wx = vx % 8;
  }
  const viewport = new Viewport(imageData.width, imageData.height, vx - xOffset, vy - yOffset);
  const pixelGetter = (x, y) => {
    return winPixelGetter(x, y, vx, vy, wx, wy, xOffset, yOffset, winTileMap, tileSet, winBug);
  };
  const pixelSetter = (i, pixel) => {
    if (pixel === null) {
      imageData.data[i * 4 + 3] = 0;
      return;
    }
    const colour = colours[pixel];
    imageData.data[i * 4] = colour[0];
    imageData.data[i * 4 + 1] = colour[1];
    imageData.data[i * 4 + 2] = colour[2];
    imageData.data[i * 4 + 3] = 255;
  };
  for (let row = 0; row < viewport.height; ++row) {
    drawRow(row, viewport.width, pixelGetter, pixelSetter);
  }
  context.putImageData(imageData, 0, 0);
}

/**
 * 
 * @param {!CanvasRenderingContext2D} context 
 * @param {number} vx 
 * @param {number} vy 
 * @param {number} gridSize
 */
function drawGrid(context, vx, vy, gridSize) {
  const xOffset = (vx % 8) * gridSize / 8;
  const yOffset = (vy % 8) * gridSize / 8;
  const width = context.canvas.width;
  const height = context.canvas.height;
  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  for (let x = xOffset; x < width; x += gridSize) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  for (let y = yOffset; y < height; y += gridSize) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();
}

export {
  Viewport,
  getTilemapPixel,
  getViewportPixel,
  drawRow,
  drawCanvas,
  drawCanvasWithWindow,
  drawCanvasWithOnlyWindow,
  drawGrid,
}