var host = location.protocol + "//" + location.host;
var socket = io(host + "/play", {
  path: '/socket'
});
var ATAS = 0,
  KANAN = 1,
  BAWAH = 2,
  KIRI = 3;
// This will be the 2D array
var grid;
// Start and end
var start;
var end;
//Mulai Akhir
var indexMulai;
var indexAkhir;
// Width and height of each cell of grid
var w, h;
var players = [];
var maze;
// the player
var player1;
//the point
var diamonds = [];
var showPath = false;
var roomCount = 0;
var tempTransZ = 0;
var scoreHtml;
var timer;
var info;
var translateXYZ;
var papanSkor;
var infoMenang, pemainFinish, pemainTidakFinish;

//interval untuk permintaan waktu ke server
let interval = setInterval(function() {
  socket.emit('updateTime', {
    roomId: localStorage.getItem('roomId')
  });

  if (showPath) {
    if (!grid[player1.i][player1.j].finish) {
      var data = {
        type: "JALUR",
        roomId: localStorage.getItem('roomId'),
        playerId: localStorage.getItem('playerId')
      };
      socket.emit('updateScore', data);
    }
  }

  if (translateXYZ.z == 0) {
    var data = {
      type: "ZOOM",
      roomId: localStorage.getItem('roomId'),
      playerId: localStorage.getItem('playerId')
    };
    socket.emit('updateScore', data);
  }

}, 1000);

function playerMove(arah) {

  let i = arah == 1 ? 1 : arah == 3 ? -1 : 0;
  let j = arah == 0 ? -1 : arah == 2 ? 1 : 0;

  if (maze[player1.i + i][player1.j] != null && maze[player1.i + i][player1.j] != 1) {
    player1.i += i
  }
  if (maze[player1.i][player1.j + j] != null && maze[player1.i][player1.j + j] != 1) {
    player1.j += j
  }

  player1.eatDiamond(diamonds)

  var data = {
    roomId: localStorage.getItem('roomId'),
    playerId: localStorage.getItem('playerId'),
    arah: arah
  };
  socket.emit('update', data);
}

function zoomCamera() {
  if (translateXYZ.z != 0) {
    tempTransZ = translateXYZ.z;
    translateXYZ.z = 0;
    var data = {
      type: "ZOOM-TOGGLE",
      roomId: localStorage.getItem('roomId'),
      playerId: localStorage.getItem('playerId'),
    };
    socket.emit('updateScore', data);
  } else {
    translateXYZ.z = tempTransZ;
  }
}

function pathToggle() {
  if (!showPath) {
    showPath = true;
    var data = {
      type: "JALUR-TOGGLE",
      roomId: localStorage.getItem('roomId'),
      playerId: localStorage.getItem('playerId'),
    };
    socket.emit('updateScore', data);
  } else {
    showPath = false;
  }
}

function initiateSpot() {
  grid = new Array(maze.length);

  // Making a 2D array
  for (var i = 0; i < maze.length; i++) {
    grid[i] = new Array(maze[i].length);
  }
  for (var i = 0; i < maze.length; i++) {
    for (var j = 0; j < maze[i].length; j++) {
      grid[i][j] = new Spot(i, j);
      if (maze[i][j] === 1) {
        grid[i][j].wall = true;
      } else if (maze[i][j] === 2) {
        grid[i][j].finish = true;
        // indexAkhir = [i - floor((m - 1) / 2), j - floor((m - 1) / 2)];
        indexAkhir = [i - floor((1 - 1) / 2), j - floor((1 - 1) / 2)];
      } else {
        roomCount++;
      }
    }
  }

  // All the neighbors
  for (var i = 0; i < maze.length; i++) {
    for (var j = 0; j < maze[i].length; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }
}

function resetSpotValue() {
  for (var i = 0; i < maze.length; i++) {
    for (var j = 0; j < maze[i].length; j++) {
      grid[i][j].f = 0;
      grid[i][j].g = 0;
      grid[i][j].h = 0;
      grid[i][j].previous = undefined;
    }
  }
}

function getUkuran() {
  var uku;
  if (windowWidth > windowHeight) {
    uku = windowHeight;
  } else {
    uku = windowWidth;
  }
  return uku;
}

function AStar() {
  function removeFromArray(arr, elt) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === elt) {
        arr.splice(i, 1);
      }
    }
  }

  function heuristic(a, b) {
    var d = dist(a.i, a.j, b.i, b.j);
    return d;
  }

  // Open and closed set
  var openSet = [];
  var closedSet = [];

  start = grid[floor(player1.i)][floor(player1.j)];
  end = grid[indexAkhir[0]][indexAkhir[1]];

  start.wall = false;
  end.wall = false;

  //reset nilai dari objek spot
  resetSpotValue();

  // openSet starts with beginning only
  openSet.push(start);
  // Am I still searching?
  while (true) {
    if (openSet.length > 0) {

      // Best next option
      var winner = 0;
      for (var i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }
      var current = openSet[winner];

      // Did I finish?
      if (current === end) {
        var path = [];
        var temp = current;
        path.push(temp);
        while (temp.previous) {
          path.push(temp.previous);
          temp = temp.previous;
        }

        return path;
      }

      // Best option moves from openSet to closedSet
      removeFromArray(openSet, current);
      closedSet.push(current);

      // Check all the neighbors
      var neighbors = current.neighbors;
      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];

        // Valid next spot?
        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          var tempG = current.g + heuristic(neighbor, current);

          // Is this a better path than before?
          var newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }

          // Yes, it's a better path
          if (newPath) {
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }

      }
      // Uh oh, no solution
    } else {
      console.log('no solution');
      // Find the path by working backwards
      return;
    }
  }
}

function convertSeconds(s) {
  var min = floor(s / 60);
  var sec = s % 60;
  return nf(min, 2) + ':' + nf(sec, 2);
}

function settingGridAndTranslate() {
  // Grid cell size
  w = width / maze.length;
  h = w;
  translateXYZ = createVector(-w * player1.i - (w / 2), -h * player1.j - (h / 2), w * 70);
}

function drawMaze() {
  for (var i = 0; i < maze.length; i++) {
    for (var j = 0; j < maze[i].length; j++) {
      grid[i][j].show();
    }
  }
}

function drawDiamonds() {
  for (var i = 0; i < diamonds.length; i++) {
    diamonds[i].update();
    diamonds[i].show();
  }
}

function drawPath() {
  var thePath = AStar();
  noFill();
  stroke(10, 255, 100);
  strokeWeight(w / 4);
  beginShape();
  for (var i = 0; i < thePath.length; i++) {
    vertex(thePath[i].i * w + w / 2, thePath[i].j * h + h / 2);
  }
  endShape();
}

function drawPlayer() {
  player1.show();
}

function drawPlayers() {
  for (var i = 0; i < players.length; i++) {
    var id = players[i].playerId;
    if (id !== localStorage.getItem('playerId')) {
      fill(players[i].color.r, players[i].color.g, players[i].color.b);
      noStroke();
      ellipse(players[i].i * w + w / 2, players[i].j * h + h / 2, w / 1.25, h / 1.25);
    }
  }
}

function setup() {
  var canvas = createCanvas(getUkuran(), getUkuran(), WEBGL);
  canvas.parent("mazeSurvival");

  socket.emit('start', {
    roomId: localStorage.getItem('roomId'),
    playerId: localStorage.getItem('playerId')
  });

  socket.once('player', function(data) {
    player1 = new Player(data.i, data.j, data.color.r, data.color.g, data.color.b);
  });

  socket.on('set', function(data) {
    if (data.diamonds != null) {
      diamonds = [];
      for (let key in data.diamonds) {
        let diamond = data.diamonds[key]
        diamonds.push(new Diamond(diamond.i, diamond.j, color(diamond.color.r, diamond.color.g, diamond.color.b), diamond.point));
      }
    }
    if (data.players != null) {
      players = []
      for (let key in data.players) {
        let player = data.players[key]
        players.push(player)
      }
      players.sort((a, b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
      let counter = 0;
      let daftarSkor = "<ol>"
      for (let player of players) {
        var id = player.playerId;
        if (id === localStorage.getItem('playerId')) {
          player1.score = player.score;
        }
        if (counter < 10) {
          if (player.playerId === localStorage.getItem('playerId')) {
            daftarSkor += "<li> <b>" + player.username + "#" + player.playerId + "</b> (" + player.score.toFixed(0) + ") </li>"
          } else {
            daftarSkor += "<li> " + player.username + "#" + player.playerId + " (" + player.score.toFixed(0) + ") </li>"
          }
        }
        counter++;
      }
      daftarSkor += "</ol>";
      papanSkor.html(daftarSkor);
    }
  });

  socket.on('setTime', function(data) {
    timer.html(convertSeconds(data));
    if (data == 0) {
      clearInterval(interval);
    }
  });

  socket.on('info', function(data) {
    info.html(data);
    $("#pop-up-info").fadeIn(1000).delay(5000).fadeOut(1000);
  });

  socket.on('maze', function(data) {
    maze = data;
    initiateSpot();
    settingGridAndTranslate();
  });


  socket.once('finalScore', function(data) {

    let playersIn = data.finishedPlayers;
    let playersOut = data.unfinishedPlayers;
    let winner = data.winnerPlayer;

    let pemainFinish1 = "<ol>";
    for (let playerIn of playersIn) {
      if (playerIn.playerId === localStorage.getItem('playerId')) {
        pemainFinish1 += "<li> <b>" + playerIn.username + "#" + playerIn.playerId + "</b> (" + playerIn.score.toFixed(0) + ") </li>"
      } else {
        pemainFinish1 += "<li> " + playerIn.username + "#" + playerIn.playerId + " (" + playerIn.score.toFixed(0) + ") </li>"
      }
    }
    pemainFinish1 += "</ol>";

    let pemainTidakFinish1 = "<ol>";
    for (let playerOut of playersOut) {
      if (playerOut.playerId === localStorage.getItem('playerId')) {
        pemainTidakFinish1 += "<li> <b>" + playerOut.username + "#" + playerOut.playerId + "</b> (" + playerOut.score.toFixed(0) + ") </li>"
      } else {
        pemainTidakFinish1 += "<li> " + playerOut.username + "#" + playerOut.playerId + " (" + playerOut.score.toFixed(0) + ") </li>"
      }
    }
    pemainTidakFinish1 += "</ol>";

    if (winner.playerId == localStorage.getItem('playerId')) {
      infoMenang.html("Kamu Menang");
    } else {
      infoMenang.html("Kamu Kalah");
    }

    pemainFinish.html(pemainFinish1);
    pemainTidakFinish.html(pemainTidakFinish1);

    $("#finalScore").fadeIn(1000);
  });

  timer = select('#timer');

  scoreHtml = select('#scorer');

  info = select("#pop-up-info");

  papanSkor = select("#papanSkor");

  infoMenang = select("#infoMenang");

  pemainFinish = select("#pemainFinish");

  pemainTidakFinish = select("#pemainTidakFinish");

  select("#upControl").mouseClicked(function() {
    playerMove(ATAS);
  });

  select("#rightControl").mouseClicked(function() {
    playerMove(KANAN);
  });

  select("#downControl").mouseClicked(function() {
    playerMove(BAWAH);
  });

  select("#leftControl").mouseClicked(function() {
    playerMove(KIRI);
  });

  select("#zoomControl").mouseClicked(function() {
    zoomCamera();
  });

  select("#pathControl").mouseClicked(function() {
    pathToggle();
  });

}

function windowResized() {
  resizeCanvas(getUkuran(), getUkuran(), WEBGL);
  settingGridAndTranslate();
}

function draw() {
  if (grid) {
    background(0, 123, 255, 100);
    translateXYZ.x = -w * player1.i - (w / 2)
    translateXYZ.y = -h * player1.j - (h / 2)
    translate(translateXYZ);
    drawMaze();
    drawDiamonds();
    //Jalur Pelarian
    if (showPath) {
      if (!grid[player1.i][player1.j].finish) {
        drawPath();
      }
    }
    scoreHtml.html(player1.score.toFixed(0));
    drawPlayers();
    drawPlayer();
  }
}

function keyPressed() {
  switch (key) {
    case 'W':
      playerMove(ATAS);
      break;
    case 'S':
      playerMove(BAWAH);
      break;
    case 'A':
      playerMove(KIRI);
      break;
    case 'D':
      playerMove(KANAN);
      break;
    case 'Q':
      zoomCamera();
      break;
    case 'E':
      pathToggle();
      break;
  }
}

socket.on('pesan', function(data) {
  alert(data);
  localStorage.removeItem('roomId');
  localStorage.removeItem('roomName');
  localStorage.removeItem('roomPassword');
  location.href = host + "/lobi";
});

document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
}, false);
