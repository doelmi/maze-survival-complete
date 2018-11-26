const Cell = require('./Cell.js');

class Matrix {
  constructor(n) {
    this.n = n;
    this.length = this.n * 2 + 1;
    this.countRoom = Math.pow(n, 2);
    this.max = n * 2;
    this.min = 0;
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomOdd(min, max) {
    let number = this.randomInt(min, max - 1);
    if (number % 2 == 0) {
      number = number + 1;
    }
    return number;
  }

  positionToIndex(i, j) {
    return (i * this.length + j);
  }

  get Matrix() {
    var arrayMaze = [];
    for (var i = 0; i < this.length; i++) {
      for (var j = 0; j < this.length; j++) {
        if (i % 2 === 0 || j % 2 === 0) {
          arrayMaze.push(new Cell(i, j, 1));
        } else {
          arrayMaze.push(new Cell(i, j, 0));
        }
      }
    }

    for (var i = 0; i < this.length; i++) {
      for (var j = 0; j < this.length; j++) {
        let index = this.positionToIndex(i, j);
        if (arrayMaze[index].status == 0) {
          if (i - 2 > this.min) {
            let neighborIndex = this.positionToIndex(i - 2, j);
            let sideIndex = this.positionToIndex(i - 1, j);
            arrayMaze[index].neighbor.push({
              side: arrayMaze[sideIndex],
              cell: arrayMaze[neighborIndex]
            });
            arrayMaze[index].neighborIndex.push(0);
          } else {
            arrayMaze[index].neighbor.push(null);
          }
          if (j + 2 < this.max) {
            let neighborIndex = this.positionToIndex(i, j + 2);
            let sideIndex = this.positionToIndex(i, j + 1);
            arrayMaze[index].neighbor.push({
              side: arrayMaze[sideIndex],
              cell: arrayMaze[neighborIndex]
            });
            arrayMaze[index].neighborIndex.push(1);
          } else {
            arrayMaze[index].neighbor.push(null);
          }
          if (i + 2 < this.max) {
            let neighborIndex = this.positionToIndex(i + 2, j);
            let sideIndex = this.positionToIndex(i + 1, j);
            arrayMaze[index].neighbor.push({
              side: arrayMaze[sideIndex],
              cell: arrayMaze[neighborIndex]
            });
            arrayMaze[index].neighborIndex.push(2);
          } else {
            arrayMaze[index].neighbor.push(null);
          }
          if (j - 2 > this.min) {
            let neighborIndex = this.positionToIndex(i, j - 2);
            let sideIndex = this.positionToIndex(i, j - 1);
            arrayMaze[index].neighbor.push({
              side: arrayMaze[sideIndex],
              cell: arrayMaze[neighborIndex]
            });
            arrayMaze[index].neighborIndex.push(3);
          } else {
            arrayMaze[index].neighbor.push(null);
          }
        }
      }
    }
    return arrayMaze;
  }

  cellOfRoom(arrayMaze) {
    let arrayPos = [];
    for (var i = 0; i < arrayMaze.length; i++) {
      if (arrayMaze[i].status == 0) {
        arrayPos.push(arrayMaze[i]);
      }
    }

    return arrayPos;
  }

  arrayMazeToMatrix(arrayMaze) {
    let matrik = [];
    for (var i = 0; i < this.length; i++) {
      matrik[i] = [];
      for (var j = 0; j < this.length; j++) {
        let index = this.positionToIndex(i, j);
        if (arrayMaze[index].status == 1) {
          matrik[i][j] = 1;
        } else {
          matrik[i][j] = 0;
        }
      }
    }

    return matrik;
  }

  roomCounter(maze) {
    var roomCount = 0;
    for (var i = 0; i < maze.length; i++) {
      for (var j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 0) {
          roomCount++;
        }
      }
    }
    return roomCount;
  }

  setFinish(maze) {
    let randomI = this.randomOdd(0, maze.length - 1);
    let randomJ = this.randomOdd(0, maze.length - 1);

    maze[randomI][randomJ] = 2;
    return {
      maze: maze,
      i: randomI,
      j: randomJ
    };
  }

}

module.exports = Matrix;
