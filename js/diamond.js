function Diamond(i, j, color, point) {
  this.i = i;
  this.j = j;
  this.color = color;
  this.point = point;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomOdd(min, max) {
  let number = randomInt(min, max - 1);
  if (number % 2 == 0) {
    number = number + 1;
  }
  return number;
}

function populateDiamond(roomCount, maze) {
  let diamond = {};
  while (Object.keys(diamond).length < roomCount / 5) {
    let randomI = randomInt(1, maze.length - 1);
    let randomJ = randomInt(1, maze.length - 1);
    let key = `${randomI}.${randomJ}`;
    if (maze[randomI][randomJ] == 0 && !diamond.hasOwnProperty(key)) {
      var randomPoint = randomInt(2, 5);
      var randomColor = {
        'r': randomInt(0, 255),
        'g': randomInt(0, 255),
        'b': randomInt(0, 255)
      };
      diamond[key] = new Diamond(randomI, randomJ, randomColor, randomPoint);
    }
  }
  return diamond;
}

function addDiamond(diamond, maze) {
  let randomI = randomOdd(0, maze.length - 1);
  let randomJ = randomOdd(0, maze.length - 1);
  let key = `${randomI}.${randomJ}`;
  while (diamond.hasOwnProperty(key)) {
    randomI = randomOdd(0, maze.length - 1);
    randomJ = randomOdd(0, maze.length - 1);
    key = `${randomI}.${randomJ}`;
  }
  let randomPoint = randomInt(2, 5);
  let randomColor = {
    'r': randomInt(0, 255),
    'g': randomInt(0, 255),
    'b': randomInt(0, 255)
  };
  diamond[key] = new Diamond(randomI, randomJ, randomColor, randomPoint);
  return diamond;
}

function deleteDiamond(i, j, diamond) {
  let key = `${i}.${j}`
  if (diamond.hasOwnProperty(key)) {
    let point = diamond[key].point
    delete diamond[key]
    return {
      point: point,
      diamond: diamond
    }
  } else {
    return null
  }
}

module.exports = {
  populateDiamond: populateDiamond,
  addDiamond: addDiamond,
  deleteDiamond: deleteDiamond
}
