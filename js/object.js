module.exports = {
  createPlayer: function Player(playerId, username, i, j) {
    this.playerId = playerId;
    this.username = username;
    this.i = i;
    this.j = j;
    this.score = 0;
    this.color = {
      'r': Math.floor(Math.random() * (255 - 0 + 1)) + 0,
      'g': Math.floor(Math.random() * (255 - 0 + 1)) + 0,
      'b': Math.floor(Math.random() * (255 - 0 + 1)) + 0
    };
  },
  createRoom: function Room(roomId, name, password, maze, diamond, finish, mazeType) {
    this.roomId = roomId;
    this.name = name;
    this.password = password;
    this.players = {};
    this.maze = maze;
    this.diamond = diamond;
    this.finish = finish;
    //room status : 0 = lobby, 1 = play, 2 = end
    this.status = 0;

    this.hostId = null;

    this.time = 10; //waktu sisa

    this.extraTime = 10; //waktu tambahan

    this.destroyTime = 30; //waktu untuk penghancuran lobby

    this.winnerPlayer = null;

    this.mazeType = mazeType;
  }
}
