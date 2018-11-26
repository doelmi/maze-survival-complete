module.exports = {
  populateDiamond: function(roomCount, binaryTreeMaze) {
    function Diamond(i, j, color, point) {
      this.i = i;
      this.j = j;
      this.color = color;
      this.point = point;
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var diamond = [];
    var newDiamond = true;

    while (diamond.length < roomCount / 5) {
      var randomI = getRandomInt(1, binaryTreeMaze.length - 1);
      var randomJ = getRandomInt(1, binaryTreeMaze.length - 1);

      if (binaryTreeMaze[randomI][randomJ] === 0) {
        for (var i = 0; i < diamond.length; i++) {
          if (diamond[i].i == randomI && diamond[i].j == randomJ) {
            newDiamond = false;
            break;
          }
        }
      } else {
        newDiamond = false;
      }

      if (newDiamond) {
        var randomPoint = getRandomInt(2, 5);
        var randomColor = {
          'r': getRandomInt(0, 255),
          'g': getRandomInt(0, 255),
          'b': getRandomInt(0, 255)
        };
        diamond.push(new Diamond(randomI, randomJ, randomColor, randomPoint));
      }

      newDiamond = true;
    }
    return diamond;
  },
  addDiamond: function(diamond, maze) {
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

    let randomI = randomOdd(0, maze.length - 1);
    let randomJ = randomOdd(0, maze.length - 1);

    while (diamond.findIndex((x) => x.i == randomI && x.j == randomJ) != -1) {
      randomI = randomOdd(0, maze.length - 1);
      randomJ = randomOdd(0, maze.length - 1);
    }

    var randomPoint = randomInt(2, 5);
    var randomColor = {
      'r': randomInt(0, 255),
      'g': randomInt(0, 255),
      'b': randomInt(0, 255)
    };

    diamond.push(new Diamond(randomI, randomJ, randomColor, randomPoint));

    return diamond;
  },
  deleteDiamond: function(i, j, diamond) {
    var indexDiamond = diamond.findIndex(x => x.i === i && x.j == j);
    if (indexDiamond == -1) {
      return null;
    }else{
      let diamondPoint = diamond[indexDiamond].point;
      diamond.splice(indexDiamond, 1);
      return {point : diamondPoint, diamond : diamond};
    }
  }
}
