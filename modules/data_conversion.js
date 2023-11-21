import {TileSet} from "./tile_collections.js";

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let stringEncodedBinary = ''
    for (const b of bytes) {
        stringEncodedBinary += String.fromCharCode(b);
    }
    return window.btoa(stringEncodedBinary);
}

function base64ToUint8Array(b64String) {
    const stringEncodedBinary = window.atob(b64String);
    const bytes = new Uint8Array(stringEncodedBinary.length);
    for (let i = 0; i < bytes.length; ++i) {
        bytes[i] = stringEncodedBinary.charCodeAt(i);
    }
    return bytes;
}

function arrayBufferToString(buffer, base, delimiter = '', prefix = '') {
    const bytes = new Uint8Array(buffer);
    const encodedByteLength = (255).toString(base).length;
    let digitArray = [];
    for (const byte of bytes) {
        let stringByte = byte.toString(base);
        const padding = ('0').repeat(encodedByteLength - stringByte.length);
        stringByte = `${prefix}${padding}${stringByte}`;
        digitArray.push(stringByte);
    }
    return digitArray.join(delimiter);
}

function arrayBufferToHexString(buffer, delimiter = '', prefix = '') {
    return arrayBufferToString(buffer, 16, delimiter, prefix);
}

/**
 * Converts an array of pixels into tiles. Tiles are 8x8 pixels big and the
 * pixel data should divide cleanly into tiles.
 * 
 * @param {!ArrayBuffer} pixels The pixel data array to convert. Each byte is
 *     a pixel. The length should be width*height.
 * @param {number} width Should be divisible by 8.
 * @param {number} height Should be divisible by 8.
 */
function pixelArrayToTiles(pixels, width, height) {
    if (pixels.byteLength !== width * height) {
        return null;
    }
    if (width % 8 !== 0 && height % 8 !== 0) {
        return null;
    }
    const widthInTiles = width / 8;
    const heightInTiles = height / 8;
    const pixelBytes = new Uint8Array(pixels);

    const tiles = new TileSet((width * height) / 64);
    for (let x = 0; x < width; x++) {
        const tileX = Math.floor(x / 8);
        for (let y = 0; y < height; y++) {
            const tileY = Math.floor(y / 8);
            const tileNumber = tileY * widthInTiles + tileX;
            const pixelIndex = x + y * width;
            tiles.setPixel(tileNumber, x % 8, y % 8, pixelBytes[pixelIndex]);
        }
    }
    const gbTile = byteTileToGBTile(tiles.tiles[0]);
    let hex = [];
    for (const i of gbTile) {
        let byte = i.toString(16);
        if (byte.length < 2) {
            byte = '0' + byte;
        }
        hex.push(byte);
    }
    console.log(gbTile);
    console.log(hex.join(' '));
    return tiles;
}

const HIGH_BITS = [0, 0, 1, 1];
const LOW_BITS = [0, 1, 0, 1];

function byteTileRowToGBTileRow(byteRow, outGBRow) {
    for (const pixel of byteRow) {
        outGBRow[0] <<= 1;
        outGBRow[1] <<= 1;
        outGBRow[0] |= LOW_BITS[pixel];
        outGBRow[1] |= HIGH_BITS[pixel];
    }
}

function pixelByteFromGBTileRow(rowHighByte, rowLowByte, pixelIndex) {
    return (((rowHighByte >> (7-pixelIndex)) & 1) << 1) |
           (((rowLowByte >> (7-pixelIndex)) & 1));
}

function gbTileRowToByteTileRow(gbRow, outByteRow) {
    const gbRowHigh = gbRow[1];
    const gbRowLow = gbRow[0];
    for (let i = 0; i < 8; ++i) {
        outByteRow[i] = pixelByteFromGBTileRow(gbRowHigh, gbRowLow, i);
    }
    return outByteRow;
}

/**
 * Turns a 1-byte-per-pixel 8x8 tile into the GameBoy 2-bit-per-pixel format.
 * Each row is two bytes. The two bits of a pixel are split into that pixel's
 * row's two bytes.
 * Note: Each byte in the 1-byte-per-pixel tile is still expected to 0, 1, 2, or
 * 3. Not arbitrary values.
 */
function byteTileToGBTile(tile, opt_gbTile) {
    if (tile.byteLength !== 64) return null;

    const gbTile = opt_gbTile || new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
        const byteTileRow = tile.subarray(i * 8, (i + 1) * 8);
        const gbTileRow = gbTile.subarray(i * 2, (i + 1) * 2);
        byteTileRowToGBTileRow(byteTileRow, gbTileRow);
    }
    return gbTile;
}

function gbTileToByteTile(gbTile, opt_byteTile) {
    if (gbTile.byteLength != 16) return null;

    const byteTile = opt_byteTile || new Uint8Array(64);
    for (let row = 0; row < 8; ++row) {
        const gbTileRow = gbTile.subarray(row * 2, (row + 1) * 2);
        const byteTileRow = byteTile.subarray(row * 8, (row + 1) * 8);
        gbTileRowToByteTileRow(gbTileRow, byteTileRow);
    }
    return byteTile;
}

export {
    arrayBufferToBase64,
    base64ToUint8Array,
    arrayBufferToString,
    arrayBufferToHexString,
    byteTileToGBTile,
    gbTileToByteTile,
    pixelArrayToTiles,
}