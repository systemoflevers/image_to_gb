
function horizontalBarsOut(tileMap, tileIndex, mapWidth = 32, mapHeight = 32, scX = 0, scY = 0) {
  const steps = [];
  for (let step = 0; step < 20; ++step) {
    steps.push(() => {
      for (let j = 0; j < 18; j += 2) {
        for (let i = 0; i <= step; ++i) {
          const vpX = (i + scX) % mapWidth;
          const vpY = (j + scY) % mapHeight;
          let index = mapWidth * vpY + vpX;
          tileMap[index] = tileIndex;
          index = mapWidth * (vpY + 1) + 19 - vpX;
          tileMap[index] = tileIndex; 
        }
      }
    });
  }
  return steps;
}

function horizontalBarsIn(tileMap, referenceMap, mapWidth = 32, mapHeight = 32, scX = 0, scY = 0) {
  const steps = [];
  for (let step = 0; step < 20; ++step) {
    steps.push(() => {
      for (let j = 0; j <= 18; j += 2) {
        for (let i = 0; i <= step; ++i) {
          const vpX = (i + scX) % mapWidth;
          const vpY = (j + scY) % mapHeight;
          let index = mapWidth * vpY + vpX;
          tileMap[index] = referenceMap[index];
          index = mapWidth * (vpY + 1) + 19 - vpX;
          tileMap[index] = referenceMap[index];
        }
      }
    });
  }
  return steps;
}

function spiralPattern() {
  const coords = [];
  
  for (let i = 0; i < 9; ++i) {
    for (let j = 0 + i; j < 20 - i; ++j) {
      coords.push([j, i]);
    }
    for(let j = 1 + i; j < 18 - i; ++j) {
      coords.push([19 - i, j]);
    }
    for(let j = 18 - i; j >= i; --j) {
      coords.push([j, 17 - i]);
    }
    for(let j = 16 - i; j >= i + 1; --j) {
      coords.push([i, j]);
    }
  }
  return coords;
}

function spiralPatterFrom(x, y) {
  let coords = [];
  //for( let i = y; i < 18; ++i) {
  for (let i = 0; i < 18 - y; ++i) {
    for (let j = x - i; j < x + 4 + i; ++j) {
      coords.push([j, y - i]);
    }
    for (let j = -i; j < i + 2; ++j) {
      coords.push([x + 3 + i, y + j]);
    }
    for (let j = i + 2; j >= -i - 1; --j) {
      coords.push([x + j, y + i + 1]);
    }
    for (let j = i + 1; j >= -i; --j) {
      coords.push([x - i - 1, x + j]);
    }
  }
  coords = coords.filter(([c, r]) => !(c < 0 || c >= 20 || r < 0 || r >= 18));
  return coords;
}
  /*const xOffset = x - 10;
  const yOffset = y - 9;
  let coords = [];
  for (let i = 0; i < 36; ++i) {
    for (let j = i; j < 40 - i; ++j) {
      coords.push([j, i]);
    }
    for (let j = 1 + i; j < 40 - i; ++j) {
      coords.push([39 - i, j]);
    }
    for (let j = 38 - i; j >= i; --j) {
      coords.push([j, 35 - i]);
    }
    for (let j = 34 - i; j >= i + 1; --j) {
      coords.push([i, j]);
    }
  }
  coords = coords.map(([x,y]) => [x + xOffset, y + yOffset]);
  while (true) {
    const [x, y] = coords[0];
    if (x >= 0 && x < 20 && y >= 0 && y < 18) break;
    coords.shift();
  }
  while (true) {
    const [x, y] = coords[coords.length - 1];
    if (x >= 0 && x < 20 && y >= 0 && y < 18) break;
    coords.pop();
  }
  coords = coords.map(([x, y]) => {
    if (x < 0 || x >= 20 || y < 0 || y >= 18) {
      return coords[0];
    }
    console.log(x, y);
    return [x, y];
  });
  console.log(coords.length);
  return coords.reverse();
}*/

const horizontalBarsPattern = (() => {
  const steps = [];
  for (let i = 0; i < 20; ++i) {
    const changes = [];
    // The loop processes two lines at once
    // to give alternating directions.
    for (let y = 0; y < 18; y += 2) {
      changes.push([i, y]);
      changes.push([19 - i, y + 1]);
    }
    steps.push(changes);
  }
  return steps;
})();

export {
  horizontalBarsOut,
  horizontalBarsIn,
  spiralPattern,
  spiralPatterFrom,
  horizontalBarsPattern,
}