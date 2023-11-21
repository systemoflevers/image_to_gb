
const kColourChangeEventType = 'colour-change';
function colourChangeEvent(colourID) {
  return new CustomEvent(kColourChangeEventType,
    {
      bubbles: true,
      composed: true,
      detail: colourID,
    });
}

const kPaletteChangeEventType = 'palette-change';
function paletteChangeEvent(colours) {
  return new CustomEvent(kPaletteChangeEventType,
    {
      bubbles: true,
      composed: true,
      detail: colours,
    }
  );
}

function expandPalette(palette, colourPalette) {
  const colours = []
  for (let i = 0; i < 4; ++i) {
    colours.push(colourPalette[palette[i]]);
  }
  return colours;
}

const kGreenColours = [
  [224, 248, 208],
  [136, 192, 112],
  [52, 104, 86],
  [8, 24, 32],
];

const kCyclePalettes = [
  [0, 1, 2, 3],
  [1, 2, 3, 0],
  [2, 3, 0, 1],
  [3, 0, 1, 2],
  [0, 1, 2, 3],
]

const kFadePalettes = {
  toBlack: [
    [0, 1, 2, 3],
    [1, 2, 3, 3],
    [2, 3, 3, 3],
    [3, 3, 3, 3],
  ],
  fromBlack: [
    [3, 3, 3, 3],
    [2, 3, 3, 3],
    [1, 2, 3, 3],
    [0, 1, 2, 3],
  ],
  toWhite: [
    [0, 1, 2, 3],
    [0, 0, 1, 2],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
  ],
  fromWhite: [
    [0, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 2],
    [0, 1, 2, 3],
  ],
}

export {
  kColourChangeEventType,
  colourChangeEvent,
  kPaletteChangeEventType,
  paletteChangeEvent,
  expandPalette,
  kGreenColours,
  kFadePalettes,
  kCyclePalettes
}