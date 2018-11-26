var host = location.protocol + "//" + location.host;
var play = host + "/play";
let url = host + "/get_profil?token=" + localStorage.getItem('token');

var socket = io(host + "/lobby", {
  path: '/socket'
});

$('#v-pills-home-tab').click(function() {
  document.title = 'Maze Survival by Doelmi | Beranda';
});

$('#v-pills-profile-tab').click(function() {
  document.title = 'Maze Survival by Doelmi | Profil';
});

$('#v-pills-messages-tab').click(function() {
  document.title = 'Maze Survival by Doelmi | Lobi';
});

//<-------- PROFIL -------->

$.get(url, function(data) {
  $(".my-id").html("<p>ID : <b>" + data.id + "</b></p>");
  $(".my-name").html("<p>Username : <b>" + data.username + "</b></p>");
  $(".my-full-name").html("<p>Fullname : <b>" + data.username + "#" + data.id + "</b></p>");
});

$('#logout').click(function() {
  localStorage.clear();
  alert("Anda telah logout!")
  location.href = host;
});

//<---------- LOBI --------->

$(document).ready(function() {
  console.log("ready!");
  $('#pills-tab li:nth-child(3) a').addClass('disabled');
  if (!localStorage.getItem('token')) {
    alert('Anda belum login!');
    location.href = host;
  }
  if (localStorage.getItem('roomId')) {
    $(function() {
      socket.emit('getRoom', {
        roomId: localStorage.getItem('roomId'),
        password: localStorage.getItem('roomPassword')
      });
      $('#v-pills-tab a[href="#v-pills-messages"]').tab('show');
    })
  }

  $('#buatLobi').click(function() {
    let namaLobi = $('#namaLobiBuat').val();
    let passwordLobi = $('#passwordLobiBuat').val();
    let tipeMaze = $('#tipeMazeBuat').val();

    let playerId = localStorage.getItem('playerId');
    let username = localStorage.getItem('username');

    let data = {
      'roomName': namaLobi,
      'password': passwordLobi,
      'playerId': playerId,
      'username': username,
      'type': tipeMaze
    };
    socket.emit('createRoom', data);

  });

  $('#ikutLobi').click(function() {
    let idLobi = $('#idLobiIkut').val();
    let passwordLobi = $('#passwordLobiIkut').val();

    let playerId = localStorage.getItem('playerId');
    let username = localStorage.getItem('username');

    let data = {
      'roomId': idLobi,
      'password': passwordLobi,
      'playerId': playerId,
      'username': username
    };
    socket.emit('joinRoom', data);
  });

  $('#mulaiPermainan').click(function() {
    socket.emit('gameStarted', localStorage.getItem('roomId'));
  });

  $('#tinggalkanPermainan').click(function() {
    let roomId = localStorage.getItem('roomId');

    socket.emit('leaveRoom', {
      roomId: roomId,
      playerId: localStorage.getItem('playerId')
    });

    localStorage.removeItem('roomId');
    localStorage.removeItem('roomName');
    localStorage.removeItem('roomPassword');

    $('#pills-tab li:nth-child(1) a').removeClass('disabled');
    $('#pills-tab li:nth-child(2) a').removeClass('disabled');
    $('#pills-tab li:nth-child(3) a').addClass('disabled');
    $('#pills-tab li:nth-child(1) a').tab('show');
  });

});

socket.on('rooms', function(data) {
  $('#pills-tab li:nth-child(1) a').addClass('disabled');
  $('#pills-tab li:nth-child(2) a').addClass('disabled');
  $('#pills-tab li:nth-child(3) a').removeClass('disabled');
  $('#pills-tab li:nth-child(3) a').tab('show');
  localStorage.setItem('roomId', data.roomId);
  localStorage.setItem('roomName', data.name);
  localStorage.setItem('roomPassword', data.password);

  $("#idLobiSekarang").val(localStorage.getItem('roomId'));
  $("#namaLobiSekarang").val(localStorage.getItem('roomName'));
  $("#passwordSekarang").val(localStorage.getItem('roomPassword'));
  console.log(data);
  console.log(data.players);

  let players = [];
  let listPemain = "";

  for (let key in data.players) {
    players.push({
      playerId: data.players[key].playerId,
      username: data.players[key].username
    });
  }

  if (data.hostId == localStorage.getItem('playerId')) {
    $('#mulaiPermainan').removeClass('d-none');
  } else {
    $('#mulaiPermainan').addClass('d-none');
  }

  $.each(players, function(index, value) {
    if (data.hostId == value.playerId) {
      listPemain += '<li class="list-group-item d-flex justify-content-between align-items-center">' + value.username + '#' + value.playerId + '<span class="badge badge-primary badge-pill"> <i class="fas fa-star text-warning"></i>' + (index + 1) + '</span></li>';
    } else {
      listPemain += '<li class="list-group-item d-flex justify-content-between align-items-center">' + value.username + '#' + value.playerId + '<span class="badge badge-primary badge-pill">' + (index + 1) + '</span></li>';
    }
  });

  $("#listPemain").html(listPemain);
});

socket.on('error', function(data) {
  if (data == "Lobi") {
    alert("Lobi tidak ditemukan");
    localStorage.removeItem('roomId');
    localStorage.removeItem('roomName');
    localStorage.removeItem('roomPassword');
  } else if (data == "Play") {
    if (confirm("Permainan sedang berlangsung. Apakah kamu ingin gabung kembali?")) {
      location.href = play;
    } else {
      localStorage.removeItem('roomId');
      localStorage.removeItem('roomName');
      localStorage.removeItem('roomPassword');
    }
  } else {
    alert(data);
  }
});

socket.on('startGame', function(data) {
  alert("Game dimulai");
  location.href = play;
});

// $(window).bind('beforeunload', function() {
//   return true;
// });
