
/**
 * @param {ImageData} imageData 
 * @param {(imageData: ImageData) => Uint8Array} imageQuantizer 
 * @param {(pixels: ArrayBuffer) => Uint8Array[]} tiler 
 */
function imageDataToColourIndexedTiles(imageData, imageQuantizer, tiler) {
  const colourIndexedPixels = imageQuantizer(imageData);
  return tiler(colourIndexedPixels);
}


/**
 * @param {HTMLImageElement} image
 * @param {HTMLCanvasElement} canvas
 * @param {"fit" | "crop"} fitType
 */
function imageToCanvas(image, canvas, fitType='fit') {
  let dx, dy, dw, dh, sx, sy, sw, sh;
  switch (fitType) {
    case 'fit':
      const sAspectRatio = image.width / image.height;
      dw = canvas.width;
      dh = dw / sAspectRatio;
      if (dh > canvas.height) {
        dh = canvas.height;
        dw = dh * sAspectRatio;
      }
      dx = (canvas.width - dw) / 2;
      dy = (canvas.height - dh) / 2;
      sx = 0;
      sy = 0;
      sw = image.width;
      sh = image.height;
      break;
    case 'crop':
      const dAspectRatio = canvas.width / canvas.height;
      sw = image.width;
      sh = sw / dAspectRatio;
      if (sh > image.height) {
        sh = image.height;
        sw = sh * dAspectRatio;
      }
      sx = (image.width - sw) / 2;
      sy = (image.height - sh) / 2;
      dx = 0;
      dy = 0;
      dw = canvas.width;
      dh = canvas.height;
      break;
  }
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

export {
  imageDataToColourIndexedTiles,
  imageToCanvas
}