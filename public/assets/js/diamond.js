function Diamond(i, j, color, point) {
  this.i = i;
  this.j = j;

  this.color = color;

  this.point = point;

  this.tempPoint = point;

  this.show = function() {
    fill(this.color);
    ellipse(this.i * w + w / 2, this.j * h + h / 2, w * 0.6 * (this.point / 4), h * 0.6 * (this.point / 8));
    ellipse(this.i * w + w / 2, this.j * h + h / 2, w * 0.6 * (this.point / 8), h * 0.6 * (this.point / 4));
  }

  this.update = function() {
    this.point = random(this.tempPoint*0.9, this.tempPoint);
  }
}
