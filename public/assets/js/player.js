function Player(i, j, r, g, b) {
  this.i = i;
  this.j = j;

  this.score = 0;

  this.color = {
    'r': r,
    'g': g,
    'b': b
  };

  // this.goLeft = function() {
  //   if (this.i > 0 && grid[this.i - 1][this.j].wall === false) {
  //     // this.i -= 1;
  //     // translateXYZ.x += w;
  //     // console.log(transX, transY, this.i, this.j);
  //     return true;
  //   }
  //   return false;
  // }
  //
  // this.goRight = function() {
  //   if (this.i < grid.length - 1 && grid[this.i + 1][this.j].wall === false) {
  //     // this.i += 1;
  //     // translateXYZ.x -= w;
  //     // console.log(transX, transY);
  //     return true;
  //   }
  //   return false;
  // }
  //
  // this.goUp = function() {
  //   if (this.j > 0 && grid[this.i][this.j - 1].wall === false) {
  //     // this.j -= 1;
  //     // translateXYZ.y += h;
  //     // console.log(transX, transY);
  //     return true;
  //   }
  //   return false;
  // }
  //
  // this.goDown = function() {
  //   if (this.j < grid[0].length - 1 && grid[this.i][this.j + 1].wall === false) {
  //     // this.j += 1;
  //     // translateXYZ.y -= h;
  //     // console.log(transX, transY);
  //     return true;
  //   }
  //   return false;
  // }

  this.show = function() {
    fill(this.color.r, this.color.g, this.color.b);
    noStroke();
    ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 1.25, h / 1.25);

    //        rect(this.i * w, this.j * h, w, h);
  }

  // this.eatDiamond = function(diamond) {
  //   var i = this.i;
  //   var j = this.j;
  //
  //   var result = diamond.findIndex(x => x.i === i && x.j === j);
  //
  //   if (result != -1) {
  //     diamond.splice(result, 1);
  //   }
  //   return result;
  //   //   console.log(this.score);
  // }
}
