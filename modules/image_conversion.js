
/**
 * @param {ImageData} imageData 
 * @param {(imageData: ImageData) => Uint8Array} imageQuantizer 
 * @param {(pixels: ArrayBuffer) => Uint8Array[]} tiler 
 */
function imageDataToColourIndexedTiles(imageData, imageQuantizer, tiler) {
  const colourIndexedPixels = imageQuantizer(imageData);
  return tiler(colourIndexedPixels);
}