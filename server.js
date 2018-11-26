const querystring = require('querystring')
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const saltRounds = 10;
const app = express();
const http = require('http')
const server = http.Server(app);

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "maze_survival"
});

var io = require('socket.io')(server, {
  path: '/socket'
});

server.listen(process.env.PORT || 80, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Maze Survival listening at http://' + host + ':' + port);
});

//<-------------------- SOCKET START ------------------->

const aldousBroderClass = require('./js/AldousBroder.js')
const binaryTreeClass = require('./js/BinaryTree.js')
const growingTreeClass = require('./js/GrowingTree.js')
const huntAndKillClass = require('./js/HuntAndKill.js')
const wilsonsClass = require('./js/Wilsons.js')

const diamond = require("./js/diamond.js");
const object = require("./js/object.js");

let n = 45
let aldousBroder = new aldousBroderClass(n)
let binaryTree = new binaryTreeClass(n)
let growingTree = new growingTreeClass(n)
let huntAndKill = new huntAndKillClass(n)
let wilsons = new wilsonsClass(n)
var rooms = {};

let sendPostMatch = function(matchId, winnerId, mazeType, players) {

  let playersInput = [];

  for (let key in players) {
    let player = players[key]
    playersInput.push({
      playerId: player.playerId,
      score: player.score
    });
  }

  let body = {
    'matchId': matchId,
    'winnerId': winnerId,
    'mazeType': mazeType,
    'players': JSON.stringify(playersInput)
  };

  body = querystring.stringify(body);

  var options = {
    host: server.address().address,
    port: server.address().port,
    path: "/match?authId=adminmazesurvival",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body)
    }
  };

  let req = http.request(options, function(res) {
    // let responseString = "";
    res.on("data", function(data) {
      // responseString += data;
    });
    res.on("end", function() {
      // console.log(responseString);
    });
  });
  req.write(body);
  req.end();
}

setInterval(function() {
  for (let key in rooms) {
    let room = rooms[key]

    if (room.status == 1) {
      if (room.time > 0) {
        room.time -= 1
      } else if (room.extraTime > 0) {
        room.extraTime -= 1
      }
      if (room.extraTime == 0) {
        room.status = 2
        let finishedPlayers = []
        let unfinishedPlayers = []
        for (let keyPlayer in room.players) {
          let player = room.players[keyPlayer]
          if (player.i = room.finish.i && player.j == room.finish.j) {
            finishedPlayers.push(player)
          } else {
            unfinishedPlayers.push(player)
          }
        }
        finishedPlayers.sort((a, b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
        unfinishedPlayers.sort((a, b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
        let winnerPlayer = finishedPlayers.length > 0 ? finishedPlayers[0] : unfinishedPlayers[0]
        room.winnerPlayer = winnerPlayer;
        let players = {
          finishedPlayers: finishedPlayers,
          unfinishedPlayers: unfinishedPlayers,
          winnerPlayer: winnerPlayer
        }
        play.in(room.roomId).emit('finalScore', players)
        sendPostMatch(room.roomId, room.winnerPlayer.playerId, room.mazeType, room.players)
      }
    } else if (room.status == 2) {
      if (room.destroyTime > 0) {
        room.destroyTime -= 1
      }
      if (room.destroyTime == 0) {
        delete rooms[key]
      }
    }
  }
}, 1000);

var lobby = io.of('/lobby');
lobby.on('connection', function(socket) {
  // console.log("We have a lobby new client: " + socket.id);
  socket.on('getRoom',
    function(data) {
      // parameter = roomId, password
      let room = rooms[data.roomId]
      if (room != null && room.password == data.password && room.status == 0) {
        socket.join(data);
        lobby.in(data).emit('rooms', room);
      } else {
        if (room != null && room.status == 1) {
          lobby.to(socket.id).emit('error', "Play");
        } else {
          lobby.to(socket.id).emit('error', "Lobi");
        }
      }
    }
  );

  socket.on('createRoom',
    function(data) {
      //parameter yang dibutuhkan : roomName, password, playerId, username, type
      //type : ALDOUS, BINARY, GROWING, HUNT, WILSONS
      let maze = binaryTree.arrayMazeToMatrix(binaryTree.Maze);
      switch (data.type) {
        case 'ALDOUS':
          maze = aldousBroder.arrayMazeToMatrix(aldousBroder.Maze);
          break;
        case 'BINARY':
          maze = binaryTree.arrayMazeToMatrix(binaryTree.Maze);
          break;
        case 'GROWING':
          maze = growingTree.arrayMazeToMatrix(growingTree.Maze);
          break;
        case 'HUNT':
          maze = huntAndKill.arrayMazeToMatrix(huntAndKill.Maze);
          break;
        case 'WILSONS':
          maze = wilsons.arrayMazeToMatrix(wilsons.Maze);
          break;
      }
      let finish = binaryTree.setFinish(maze);
      maze = finish.maze;
      let roomCount = binaryTree.roomCounter(maze);
      let populateDiamond = diamond.populateDiamond(roomCount, maze);
      let roomId = new Date().valueOf().toString();
      rooms[roomId] = new object.createRoom(roomId, data.roomName, data.password, maze, populateDiamond, {
        i: finish.i,
        j: finish.j
      }, data.type)
      let room = rooms[roomId];
      room.players[data.playerId] = new object.createPlayer(data.playerId, data.username, binaryTree.randomOdd(0, maze.length - 1), binaryTree.randomOdd(0, maze.length - 1));
      room.hostId = data.playerId;
      socket.join(roomId);
      lobby.in(roomId).emit('rooms', room);
    }
  );

  socket.on('joinRoom',
    function(data) {
      //parameter yang dibutuhkan : roomId, password, playerId, username
      let room = rooms[data.roomId];
      if (room != null && room.password == data.password && room.status == 0) {
        room.players[data.playerId] = new object.createPlayer(data.playerId, data.username, binaryTree.randomOdd(0, n * 2 + 1), binaryTree.randomOdd(0, n * 2 + 1));
        socket.join(data.roomId);
        lobby.in(data.roomId).emit('rooms', room);
      } else {
        lobby.to(socket.id).emit('error', "Lobi");
      }
    }
  );

  socket.on('leaveRoom',
    function(data) {
      //parameter yang dibutuhkan : roomId, playerId
      let room = rooms[data.roomId]
      if (room != null && room.status == 0) {
        let player = room.players[data.playerId]
        if (player != null) {
          delete room.players[data.playerId]
          socket.leave(room.roomId)
          if (Object.keys(room.players).length == 0) {
            delete rooms[data.roomId]
          } else {
            if (room.hostId == player.playerId) {
              let players = Object.keys(room.players)
              let randomPlayer = players[Math.floor(Math.random() * players.length)];
              room.hostId = randomPlayer
            }
            lobby.in(room.roomId).emit('rooms', room)
          }
        } else {
          lobby.to(socket.id).emit('error', "Player tidak ditemukan.")
        }
      } else {
        lobby.to(socket.id).emit('error', "Lobi")
      }
    }
  );

  socket.on('gameStarted',
    function(data) {
      //parameter yang dibutuhkan : data=roomId
      let room = rooms[data]
      if (room != null && room.status == 0) {
        room.status = 1;
        // console.log(rooms[i].status);
        lobby.in(data).emit('rooms', room);
        lobby.in(data).emit('startGame', 'Game Started');
      } else {
        lobby.to(socket.id).emit('error', "Lobi tidak ditemukan.");
      }
    }
  );

});

var play = io.of('/play');
play.on('connection',
  function(socket) {
    // console.log("We have a new client: " + socket.id);
    socket.on('start',
      function(data) {
        //parameter yang dibutuhkan : roomId, playerId
        let room = rooms[data.roomId];
        if (room != null && room.status == 1) {
          socket.join(data.roomId);
          play.to(socket.id).emit('player', room.players[data.playerId]);
          play.to(socket.id).emit('set', {
            players: room.players,
            diamonds: room.diamond
          });
          play.to(socket.id).emit('maze', room.maze);
        } else {
          play.to(socket.id).emit('pesan', "Lobi tidak ditemukan.");
        }
      }
    );

    socket.on('update',
      function(data) {
        //parameter yang dibutuhkan : roomId, playerId, arah
        console.log(data.arah)
        let i = data.arah == 1 ? 1 : data.arah == 3 ? -1 : 0;
        let j = data.arah == 0 ? -1 : data.arah == 2 ? 1 : 0;
        // console.log(i, j)
        let room = rooms[data.roomId]
        if (room != null && room.status == 1) {
          let player = room.players[data.playerId]
          if (player != null) {

            if (room.maze[player.i + i][player.j] != null && room.maze[player.i + i][player.j] != 1) {
              player.i += i
            }
            if (room.maze[player.i][player.j + j] != null && room.maze[player.i][player.j + j] != 1) {
              player.j += j
            }

            let deleteDiamond = diamond.deleteDiamond(player.i, player.j, room.diamond)
            if (deleteDiamond != null) {
              player.score += deleteDiamond.point
              room.diamond = diamond.addDiamond(deleteDiamond.diamond, room.maze)
            }
          }
          play.in(data.roomId).emit('set', {
            players: room.players,
            diamonds: room.diamond
          })
        }
      }
    );

    socket.on('updateScore',
      function(data) {
        //parameter yang dibutuhkan : playerId, roomId, type
        let point = 0;
        switch (data.type) {
          case "JALUR":
            point = -1.50;
            break;
          case "ZOOM":
            point = -1.00;
            break;
          case "JALUR-TOGGLE":
            point = -5.00;
            break;
          case "ZOOM-TOGGLE":
            point = -3.00;
            break;
        }
        let room = rooms[data.roomId]
        if (room != null && room.status == 1) {
          let player = room.players[data.playerId]
          if (player != null) {
            player.score += point
          }
          play.in(data.roomId).emit('set', {
            players: room.players,
            diamonds: null
          })
        }
      }
    );

    socket.on('updateTime',
      function(data) {
        //parameter yang dibutuhkan : roomId
        let room = rooms[data.roomId]
        let time = 0
        if (room != null && room.status == 1) {
          if (room.time == 0) {
            play.in(data.roomId).emit('info', "Kamu memiliki waktu tambahan 2 menit.")
            room.time = -1
          }
          if (room.time > 0) {
            time = room.time
          } else if (room.extraTime > 0) {
            time = room.extraTime
          }
        }
        play.in(data.roomId).emit('setTime', time)
      }
    );


    socket.on('disconnect', function() {
      // console.log(socket.id + "client has disconnected");
    });
  }
);

//<-------------------- SOCKET END ------------------->

function getMillis() {
  var d = new Date();
  var n = d.getTime();
  return n;
}

app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', function(req, res) {
  res.sendFile('public/index.html', {
    root: __dirname
  });
});

app.get('/lobi', function(req, res) {
  res.sendFile('public/lobi.html', {
    root: __dirname
  });
});

app.get('/play', function(req, res) {
  res.sendFile('public/play.html', {
    root: __dirname
  });
});

app.use('/assets', express.static('public/assets'));

app.post('/login', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let token;

  var returnValue = function(callback, status) {
    res.status(status);
    res.json(callback);
  };

  var sql = 'SELECT * FROM players WHERE username = ? AND password = SHA(?)';
  con.query(sql, [username, password], function(err, result) {
    if (err) throw err;
    if (result.length != 0) {
      id = result[0].id;
      token = result[0].token;

      let callback = {
        'id': id,
        'username': username,
        'token': token
      };

      returnValue(callback, 200);
    } else {
      let hashToken = bcrypt.hashSync((password + getMillis() + username), saltRounds);
      var sql = "INSERT INTO players (username, password, token) VALUES (?, SHA(?), ?)";
      con.query(sql, [username, password, hashToken], function(err, result) {
        if (err) throw err;
        token = hashToken;

        let callback = {
          'id': result.insertId,
          'username': username,
          'token': token
        };

        returnValue(callback, 200);
      });
    }
  });

});

app.get('/get_profil', function(req, res) {
  let token = req.query.token;

  var returnValue = function(callback, status) {
    res.status(status);
    res.json(callback);
  };

  var sql = 'SELECT * FROM players WHERE token = ?';
  con.query(sql, [token], function(err, result) {
    if (err) throw err;
    if (result.length != 0) {
      let callback = {
        'id': result[0].id,
        'username': result[0].username
      };

      returnValue(callback, 200);
    } else {
      let callback = {
        'kode': 404,
        'pesan': 'Data tidak ditemukan'
      };

      returnValue(callback, 404);
    }
  });

});

app.post('/match', function(req, res) {
  let auth = 'adminmazesurvival'
  // let body = JSON.parse(req.body)
  let matchId = req.body.matchId;
  let winnerId = req.body.winnerId;
  let mazeType = req.body.mazeType;
  let players = JSON.parse(req.body.players);

  let authId = req.query.authId;

  var returnValue = function(callback, status) {
    res.status(status);
    res.json(callback);
  };

  let executeScore = function() {
    let sql = "INSERT INTO scores (player_id, match_id, score_value) VALUES";
    let input = []
    for (let i = 0; i < players.length; i++) {
      if (i == players.length - 1) {
        sql += "(?, ?, ?)";
      } else {
        sql += "(?, ?, ?),";
      }
      input.push(players[i].playerId, matchId, players[i].score);
    }

    con.query(sql, input, function(err, result) {
      if (err) throw err;

      let callback = {
        'kode': 200,
        'pesan': "data berhasil dimasukkan."
      };

      returnValue(callback, 200);
    });
  }

  if (authId != auth) {
    let callback = {
      'kode': 403,
      'pesan': 'Hanya server yang dapat melakukan ini.'
    };

    returnValue(callback, 403);
  } else {
    var sql = "INSERT INTO matches (match_id, winner_id, maze_type) VALUES (?, ?, ?)";
    con.query(sql, [matchId, winnerId, mazeType], function(err, result) {
      if (err) throw err;

      executeScore();
    });
  }
});
