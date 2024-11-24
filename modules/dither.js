/**
 * @fileoverview An implementation of Floyd–Steinberg dithering based on
 * luminance to convert images to the 4 GameBoy green colours.
 */

/**
 * Compute the luminance of an RGB value.
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns {number}
 */
function computeLuminance(r, g, b) {
  // based on https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const kGreenColours = [
  [224, 248, 208],
  [136, 192, 112],
  [52, 104, 86],
  [8, 24, 32],
];

/**
 * Based just on luminance.
 */
function findNearestColour([sR, sG, sB], targetLuminances) {
  const sLuminance = computeLuminance(sR, sG, sB);
  // this should maybe use the midpoint between colours as the threshold instead of the colours themselves
  if (sLuminance >= targetLuminances[0]) return 0;
  if (sLuminance >= targetLuminances[1]) return 1;
  if (sLuminance >= targetLuminances[2]) return 2;
  return 3;
}

function computeError(newPixel, oldPixel, scale = 1) {
  const errors = Array();
  for (let c = 0; c < 3; ++c) {
    errors[c] = (oldPixel[c] - newPixel[c]) * scale;
  }
  return errors;
}

function propagateError(errors, x, y, imageData) {
  const i = y * imageData.width + x
  for (let c = 0; c < 3; ++c) {
    imageData.data[i * 4 + c] -= errors[c];
    if (x !== imageData.width - 1)
      imageData.data[(i + 1) * 4 + c] += (errors[c] * 7) / 16;
    if (y === imageData.height - 1) continue;
    if (x !== 0)
      imageData.data[(i + imageData.width - 1) * 4 + c] += (errors[c] * 3) / 16;
    imageData.data[(i + imageData.width) * 4 + c] += (errors[c] * 5) / 16;
    imageData.data[(i + imageData.width + 1) * 4 + c] += (errors[c] * 1) / 16;
  }
  return imageData;
}

/**
 * Modifies `imageData` by applying Floyd–Steinberg dithering based on luminance.
 * @param {ImageData} imageData 
 * @param {=number} howMuch A value between 0 and 100 to indicate how much the
 *  dither should be applied. 0 is not at all, 100 is normal full dither.
 *  Intended to be used to fade between non-dithered and dithered.
 * @param {=number[][]} targetColours
 * @returns {ImageData} The modified `imageData`.
 */
function ditherToColour(imageData, howMuch = 100, targetColours = kGreenColours) {
  const targetLuminances = targetColours.map(([r, g, b]) => computeLuminance(r, g, b));
  howMuch /= 100;
  //for (let y = 0; y < imageData.height * howMuch; ++y) {
  //  for (let x = 0; x < imageData.width * howMuch; ++x) {
  for (let y = 0; y < imageData.height; ++y) {
    for (let x = 0; x < imageData.width; ++x) {
      const i = y * imageData.width + x;
      const pixel = imageData.data.subarray(i * 4, i * 4 + 3);
      const nearestColourIndex = findNearestColour(
        pixel, targetLuminances
      );
      const nearestColour = targetColours[nearestColourIndex];
      const errors = computeError(nearestColour, pixel);
      propagateError(errors, x, y, imageData);
    }
  }
  return imageData;
}

/**
 * Modifies `imageData` by appling Floyd–Steinberg dithering based on luminance.
 * @param {ImageData} imageData 
 * @param {=number[][]} targetColours
 * @returns An array of pixels where each pixel is an index into `targetColours`.
 */
function ditherToColourIndex(imageData, targetColours = kGreenColours) {
  const targetLuminances = targetColours.map(([r, g, b]) => computeLuminance(r, g, b));
  const colourIndexes = new Uint8Array(imageData.width * imageData.height);
  for (let y = 0; y < imageData.height; ++y) {
    for (let x = 0; x < imageData.width; ++x) {
      const i = y * imageData.width + x;
      const pixel = imageData.data.subarray(i * 4, i * 4 + 3);
      const nearestColourIndex = findNearestColour(
        pixel, targetLuminances
      );
      colourIndexes[i] = nearestColourIndex;
      const nearestColour = targetColours[nearestColourIndex];
      const errors = computeError(nearestColour, pixel);
      propagateError(errors, x, y, imageData);
    }
  }
  return colourIndexes;
}

/**
 * Generates an array of nearest colour indexes from `imageData` based on
 * luminance.
 * @param {ImageData} imageData 
 * @param {=number[][]} targetColours
 * @returns An array of pixels where each pixel is an index into `targetColours`.
 */
function toNearestColourIndex(imageData, targetColours = kGreenColours) {
  const targetLuminances = targetColours.map(([r, g, b]) => computeLuminance(r, g, b));
  const colourIndexes = new Uint8Array(imageData.width * imageData.height);
  for (let y = 0; y < imageData.height; ++y) {
    for (let x = 0; x < imageData.width; ++x) {
      const i = y * imageData.width + x;
      const pixel = imageData.data.subarray(i * 4, i * 4 + 3);
      colourIndexes[i] = findNearestColour(
        pixel, targetLuminances
      );
    }
  }
  return colourIndexes;
}

export {
  ditherToColour,
  ditherToColourIndex,
  toNearestColourIndex,
}