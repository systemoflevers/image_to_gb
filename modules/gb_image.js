import { base64ToUint8Array } from "./data_conversion.js";
import { TileSet } from "./tile_collections.js";

function toGBTiles(b64Tiles) {
  const gbTiles = base64ToUint8Array(b64Tiles);
  const tileCount = gbTiles.length / 16;
  const tileSet = new TileSet(tileCount);
  tileSet.fromGBTileData(gbTiles);
  return tileSet;
}

// Process b64 data
// do mapping from the images tile indexes to some other indexes
// make it easy to get tiles...
class GBImage {
  constructor(b64Tiles, b64Map, widthInTiles = 20, heightInTiles = 18) {
    this.tileSet = toGBTiles(b64Tiles);
    this.rawMap = base64ToUint8Array(b64Map);
    this.widthInTiles = widthInTiles;
    this.heightInTiles = heightInTiles;
    this.indexMapping = new Map();
    this.ignoredTiles = new Set();
    this.mapOverrides = new Map();
  }

  /**
   * Create a mapping for the sprite tiles from `endIndex` - (N-1) to `endIndex`
   * inclusive.
   * @param {number} endIndex The index to be given to the last tile.
   */
  makeMapping(endIndex) {
    for (let i = 0; i < this.tileSet.tileCount; ++i) {
      this.setIndexMapping(i, endIndex - i);
    }
  }

  makeMappingFromUsageMap(usageMap, start = 0) {
    for (let i = 0, next = start; i < this.tileSet.tileCount; ++i) {
      for (; usageMap[next] !== -1 && next < 256; ++next) {}
      if (next === 256) {
        console.log('weird');
      }
      this.setIndexMapping(i, next);
      ++next;
      //console.log(this.indexMapping)
    }
  }

  /**
   * @param {number} original tile index
   * @param {number} mapped tile index
   */
  setIndexMapping(original, mapped) {
    this.indexMapping.set(original, mapped);
  }

  setMapOverride(mapIndex, overrideValue) {
    this.mapOverrides.set(mapIndex, overrideValue);
  }

  mapFromOriginalTileIndex(tileIndex) {
    if (!this.indexMapping) return tileIndex;
    return this.indexMapping.get(tileIndex) ?? tileIndex;
  }

  /**
   * @param {number} mapIndex Index of the map entry based on a 20x18 map.
   * @returns {number}
   */
  getTileIndexByMapIndex(mapIndex) {
    const override = this.mapOverrides.get(mapIndex);
    return override ?? this.mapFromOriginalTileIndex(this.rawMap[mapIndex]);
  }

  getTileIndexByMapCoordinate(x, y) {
    const index = y * this.widthInTiles + x;
    return this.getTileIndexByMapIndex(index);
  }

  *getTiles() {
    for (let i = 0; i < this.tileSet.tileCount; ++i) {
      if (this.ignoredTiles.has(i)) continue;
      const mappedIndex = this.mapFromOriginalTileIndex(i);
      yield [this.tileSet.tiles[i], mappedIndex];
    }
  }

  *getMapValues() {
    for (let mapIndex = 0; mapIndex < this.rawMap.length; ++mapIndex) {
      const tileIndex = this.getTileIndexByMapIndex(mapIndex);
      const x = mapIndex % this.widthInTiles;
      const y = Math.floor(mapIndex / this.widthInTiles);
      yield [tileIndex, mapIndex, {x, y}];
    }
  }
}

export {
  GBImage,
}