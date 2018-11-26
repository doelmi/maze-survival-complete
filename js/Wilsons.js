const Matrix = require('./Matrix.js');

class Wilsons extends Matrix {
  constructor(n) {
    super(n);
    this.name = "Wilson's";
    this.max = n * 2;
    this.min = 0;
  }

  removeCellUST(ust, cell) {
    let index = ust.findIndex(x => x.i == cell.i && x.j == cell.j);
    if (index != -1) {
      ust.splice(index, 1);
      return true;
    }
    return false;
  }

  get Maze() {
    let arrayMaze = this.Matrix;
    let ust = this.cellOfRoom(arrayMaze);
    let bolRandomStart = true,
      bolFinding = true,
      bolCreating = true;
    let startCell, randomIndex, randomCell;
    let randomVisited = this.randomInt(0, ust.length - 1);
    ust[randomVisited].status = 2;
    ust.splice(randomVisited, 1);
    while (ust.length > 0) {
      if (bolRandomStart) {
        randomIndex = this.randomInt(0, ust.length - 1);
        startCell = ust[randomIndex];
        randomCell = ust[randomIndex];
        bolRandomStart = false;
        bolFinding = true;
      } else if (bolFinding) {
        if (randomCell.status != 2) {
          let acak = this.randomInt(0, randomCell.neighborIndex.length - 1);
          let neighborIndex = randomCell.neighborIndex[acak];
          randomCell.choosedNeighbor = neighborIndex;
          randomCell = randomCell.neighbor[neighborIndex].cell;
        } else {
          bolFinding = false;
          bolCreating = true;
        }
      } else if (bolCreating) {
        if (startCell.status != 2) {
          if (this.removeCellUST(ust, startCell)) {
            let neighborIndex = startCell.choosedNeighbor;
            startCell.status = 2;
            let neighbor = startCell.neighbor[neighborIndex];
            neighbor.side.status = 2;
            startCell = neighbor.cell;
          }
        } else {
          bolCreating = false;
          bolRandomStart = true;
        }
      }
    }
    return arrayMaze;
  }
}

module.exports = Wilsons;
