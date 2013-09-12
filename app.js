
/**
 * Module dependencies.
 */

var express = require('express'), 
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    othello = require('./othello/othello');

var app = express();

// all environments
app.set('port', 3100);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);

server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);
var roomList = {};

// 部屋作成
for (var i = 1; i <= 4; i++) {
  roomList['room' + i] = {
    name: 'room' + i,
    count: 0,
    black: '',
    white: '',
    watcher: [],
    othello: null
  };
}

/**
 * エスケープ処理
 * @param {type} text
 */
function HtmlEscape(text) {
  if (!text) {
    return '';
  }
  
  return text.replace(/&/g, '&amp;').
          replace(/</g, '&lt;').
          replace(/"/g, '&quot;').
          replace(/'/g, '&#039;');
}

/**
 * ルームリストを通知する
 * @param {type} socket
 */
function EmitRoomList(socket) {
  socket.emit('roomList', {roomList: roomList});
}

/**
 * ルームリストを通知する
 */
function EmitRoomListToAllUser() {
  io.sockets.emit('roomList', {roomList: roomList});
}

/**
 * 退室
 * 
 * @param {string} room_name
 * @param {string} user_id
 */
function LeaveRoom(room_name, user_id) {
  if (roomList[room_name]) {
    var room = roomList[room_name];

    if (room.black === user_id) {
      room.black = '';
      room.count--;
    } else if (room.white === user_id) {
      room.white = '';
      room.count--;
    } else if (room.watcher.indexOf(user_id) !== -1) {
      room.watcher.splice(room['watcher'].indexOf(user_id), 1);
      room.count--;
    }
    
    if (room.othello) {
      if (!room.black && !room.white) {
        delete room.othello;
      } else {
        room.othello.turn = othello.GAME_STATE.GIVEUP;
      }
    }
    
    EmitRoomListToAllUser();
  }
}

/**
 * ゲーム情報を通知する
 * @param {type} socket
 * @param {type} msg
 */
function EmitGameInfoToUser(socket, msg) {
  var room_name = '',
      room = null,
      data = {
        blackUser: '空席',
        blackScore: 0,
        whiteUser: '空席',
        whiteScore: 0,
        board: null,
        msg: msg
      },
      id = '';
    
  socket.get('room', function (err, room) {
    room_name = room;
  });

  if (!room_name || !roomList[room_name]) {
    return;
  }

  room = roomList[room_name];
  
  if (room.othello) {
    data.board = room.othello.board;
    data.blackScore = room.othello.getScore(othello.BOARD_STATE.BLACK);
    data.whiteScore = room.othello.getScore(othello.BOARD_STATE.WHITE);
    if (room.othello.turn === othello.GAME_STATE.BLACK) {
      data.msg = '黒の番です';
    } else if (room.othello.turn === othello.GAME_STATE.BLACK) {
      data.msg = '白の番です';
    }
  }
  
  ['black', 'white'].forEach (function (type) {
    if (!room[type]) {
      return;
    }

    if (room.black) {
      data.blackUser = room.black === room[type] ? 'あなた' : 'あいて';
    }
    if (room.white) {
      data.whiteUser = room.white === room[type] ? 'あなた' : 'あいて';
    }

    io.sockets.socket(room[type]).emit('gameInfo', data);
  });
}

function EmitGameInfoToRoom(room) {
  var game_info = {
    blackScore: 0,
    whiteScore: 0,
    board: null,
    msg: ''
  };
  
  if (room.othello) {
    game_info.blackScore = room.othello.getScore(othello.BOARD_STATE.BLACK);
    game_info.whiteScore = room.othello.getScore(othello.BOARD_STATE.WHITE);
    game_info.board = room.othello.board;

    if (room.othello.turn === othello.GAME_STATE.BLACK) {
      game_info.msg = '黒の番です';
    } else if (room.othello.turn === othello.GAME_STATE.WHITE) {
      game_info.msg = '白の番です';
    } else if (room.othello.turn === othello.GAME_STATE.END) {
      if (game_info.blackScore > game_info.whiteScore) {
        game_info.msg = '黒の勝ち';
      } else if (game_info.blackScore < game_info.whiteScore) {
        game_info.msg = '白の勝ち';
      } else {
        game_info.msg = '引き分け';
      }
    } else {
      game_info.msg = '相手が退席しました';
    }

    io.sockets.to(room.name).emit('gameInfo', game_info);
  }
}

server.listen(app.get('port'), function() {
  console.log("server listening on port" + app.get('port'));
});

io.sockets.on('connection', function(socket) {

  /**
   * 入室
   */
  socket.on('enter', function(data) {
    var room_name = HtmlEscape(data.room),
        player_type = HtmlEscape(data.type);

    
    if (roomList[room_name]) {  // ルームが存在する場合
      roomList[room_name].count++;
    } else {  // ルームが存在しない場合
      return;
    }

    // プレイヤーのタイプを判別
    switch (player_type) {
      case 'black':
      case 'white':
        if (roomList[room_name][player_type]) {
          return;
        }
        
        roomList[room_name][player_type] = socket.id;
        break;
      case 'watcher':
      default:
        roomList[room_name]['watcher'].push(socket.id);
        break;
    }
    
    roomList[room_name].count++;
    
    // ルームにjoinする
    socket.set('room', room_name);
    socket.join(room_name);
    
    // ゲーム開始処理
    if (roomList[room_name]['black'] && roomList[room_name]['white']) {
      roomList[room_name].othello = new othello(roomList[room_name]['black'], roomList[room_name]['white']);
      roomList[room_name].othello.init();
    }
    
    // 入室完了を通知
    socket.emit('enterRoom', {room: room_name});
    EmitRoomListToAllUser();
  });
  
  /**
   * ゲーム情報通知
   */
  socket.on('gameInfo', function () {
    EmitGameInfoToUser(socket);
  });
  
  /**
   * 石を置く
   */
  socket.on('putStone', function (data) {
    var room_name = '',
        game = null,
        color = '',
        game_info = {
          blackScore: 0,
          whiteScore: 0,
          board: null,
          msg: ''
        };
    
    socket.get('room', function (err, room) {
      room_name = room;
    });
    
    if (room_name && roomList[room_name] && roomList[room_name].othello) {
      game = roomList[room_name].othello;
      
      color = game.getColor(socket.id);
      if (color === null) {
        return;
      }
      
      if (game.putStone(color, data.position)) {
        EmitGameInfoToRoom(roomList[room_name]);
      }
    }
  });
  
  /**
   * 退室
   */
  socket.on('leaveRoom', function (data) {
    var room_name = '';
    
    socket.get('room', function (err, room) {
      room_name = room;
    });
    
    if (room_name && roomList[room_name]) {
      LeaveRoom(room_name, socket.id);
      EmitGameInfoToUser(socket, '相手が退席しました');
    }
  });
    
  /**
   * 切断
   */
  socket.on('disconnect', function() {
    var room_name = '';
    
    socket.get('room', function (err, room) {
      room_name = room;
    });
    
    if (room_name && roomList[room_name]) {
      LeaveRoom(room_name, socket.id);
      EmitGameInfoToUser(socket, '相手が退席しました');
    }
  });
  
  /**
   * ルームリスト通知
   */
  socket.on('roomList', function () {
    EmitRoomList(socket);
  });
  
  /**
   * 再戦
   */
  socket.on('restart', function () {
    var room_name = '';
    
    socket.get('room', function (err, room) {
      room_name = room;
    });
    
    if (room_name && roomList[room_name] && roomList[room_name].othello) {
      if (roomList[room_name].othello.turn == othello.GAME_STATE.END) {
        roomList[room_name].othello.init();
        EmitGameInfoToRoom(roomList[room_name]);
      }
    }
  });
});





