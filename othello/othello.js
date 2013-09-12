var BOARD_STATE = {
  BLACK: 0,
  WHITE: 1,
  NONE: -1
};

var GAME_STATE = {
  BLACK: 0,
  WHITE: 1,
  END: -2,
  GIVEUP: -3
};

var BOARD_WIDTH = 8;
var BOARD_HEIGHT = 8;


var Othello = function(black, white) {
  this.board = [];
  this.black = black;
  this.white = white;
  this.turn = BOARD_STATE.BLACK;
};

Object.defineProperty(Othello, 'BOARD_STATE', {
  get: function () {return BOARD_STATE;}
});
Object.defineProperty(Othello, 'GAME_STATE', {
  get: function () {return GAME_STATE;}
});

/**
 * 初期化
 */
Othello.prototype.init = function() {
  this.turn = BOARD_STATE.BLACK;
  this.board = [];

  for (var h = 0; h < BOARD_HEIGHT; h++) {
    this.board[h] = [];

    for (var w = 0; w < BOARD_WIDTH; w++) {
      this.board[h][w] = BOARD_STATE.NONE;
    }
  }

  this.board[3][3] = BOARD_STATE.BLACK;
  this.board[4][4] = BOARD_STATE.BLACK;
  this.board[3][4] = BOARD_STATE.WHITE;
  this.board[4][3] = BOARD_STATE.WHITE;
};


/**
 * ひっくり返る数を数える
 * 
 * @param {number} color 置いた石の色
 * @param {number} target そのマスに置かれている石
 * @param {number} count ひっくり返る予定の数
 * @returns {number} ひっくり返る数
 */
function CheckStone(color, target, count) {
  
  if (target === BOARD_STATE.WHITE - color) {
    return count + 1;
  }
  if (target === color) {
    return count;
  }
  if (target === BOARD_STATE.NONE) {
    return 0;
  }
  
  return 0;
}

/**
 * 石がひっくり返る枚数を返す
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {Object} ひっくり返る枚数
 */
Othello.prototype.getChangeCount = function (color, position) {
  var x = position.x,
      y = position.y,
      total = 0,
      count = {
        total: 0,
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        upLeft: 0,
        upRight: 0,
        downLeft: 0,
        downRight: 0
      };
  
  
  // 盤の外には置けない
  if (x < 0 || x >= BOARD_WIDTH ||
      y < 0 || y >= BOARD_HEIGHT) {
    return count;
  }
  
  // すでに石のあるところには置けない
  if (this.board[y][x] !== BOARD_STATE.NONE) {
    return count;
  }
  
  count.up = this.getChangeCountUp(color, position);
  count.down = this.getChangeCountDown(color, position);
  count.left = this.getChangeCountLeft(color, position);
  count.right = this.getChangeCountRight(color, position);
  count.upLeft = this.getChangeCountUpLeft(color, position);
  count.upRight = this.getChangeCountUpRight(color, position);
  count.downLeft = this.getChangeCountDownLeft(color, position);
  count.downRight = this.getChangeCountDownRight(color, position);
  
  for (var key in count) {
    total += count[key];
  }
  
  count.total = total;
  
  return count;
};

/**
 * 石を置く
 * 
 * @param {string} color
 * @param {position} position
 * @return {boolean} 石を置けた時: true, 置けなかった時:false
 */
Othello.prototype.putStone = function(color, position) {
  // 順番が違う場合は置かない
  if (color != this.turn) {
    return false;
  }
  
  // positionが不正な場合は置かない
  if (!position || position.x == null || position.y == null) {
    return false;
  }
  
  var count = null,
      x = position.x,
      y = position.y,
      i = 0;

  count = this.getChangeCount(color, position);
  // ひっくり返せない場合は置かない
  if (count.total == 0) {
    return false;
  }
  
  // ひっくり返す
  this.board[y][x] = color;
  
  // 上
  for (i = 1; i <= count.up; i++) {
    this.board[y - i][x] = color;
  }
  
  // 下
  for (i = 1; i <= count.down; i++) {
    this.board[y + i][x] = color;
  }
  
  // 左
  for (i = 1; i <= count.left; i++) {
    this.board[y][x - i] = color;
  }
  
  // 右
  for (i = 1; i <= count.right; i++) {
    this.board[y][x + i] = color;
  }
  
  // 左上
  for (i = 1; i <= count.upLeft; i++) {
    this.board[y - i][x - i] = color;
  }
  
  // 右上
  for (i = 1; i <= count.upRight; i++) {
    this.board[y - i][x + i] = color;
  }
  
  // 左下
  for (i = 1; i <= count.downLeft; i++) {
    this.board[y + i][x - i] = color;
  }
  
  // 右下
  for (i = 1; i <= count.downRight; i++) {
    this.board[y + i][x + i] = color;
  }
  
  // 順番を移す
  this.turn = 1 - this.turn;
  if (!this.getPossibleCount(this.turn)) {
    // 石が置けない場合は順番をさらに移す
    this.turn = 1 - this.turn;
    
    // 両方が置けない場合はゲーム終了
    if (!this.getPossibleCount(this.turn)) {
      this.turn = GAME_STATE.END;
    }
  }
  
  return true;
};

/**
 * 石が置かれていないマスを数える
 * 
 * @returns {Number}
 */
Othello.prototype.getBlankCount = function() {
  var count = 0,
      x = 0,
      y = 0;

  for (y = 0; y < BOARD_HEIGHT; y++) {
    for (x = 0; x < BOARD_WIDTH; x++) {
      if (this.board[y][x] == BOARD_STATE.NONE) {
        count++;
      }
    }
  }

  return count;
};


/**
 * その色が何箇所に置けるかを数える
 * 
 * @param {number} color 石の色
 * @returns {number} おける箇所数
 */
Othello.prototype.getPossibleCount = function (color) {
  var w = 0,
      h = 0,
      count = 0;
      
  for (h = 0; h < BOARD_HEIGHT; h++) {
    for (w = 0; w < BOARD_WIDTH; w++) {
      if (this.getChangeCount(color, {x: w, y: h}).total) {
        count++;
      }
    }
  }
  
  return count;
};

/**
 * その色が何個あるかを数える
 * 
 * @param {number} color 石の色
 * @returns {number} 石の数
 */
Othello.prototype.getScore = function (color) {
  var w = 0,
      h = 0,
      count = 0;
      
  for (h = 0; h < BOARD_HEIGHT; h++) {
    for (w = 0; w < BOARD_WIDTH; w++) {
      if (this.board[h][w] == color) {
        count++;
      }
    }
  }
  
  return count;
};

/**
 * ユーザーの色を返す
 * 
 * @param {string} user_id ユーザーid
 * @returns {number} ユーザーの色
 */
Othello.prototype.getColor = function (user_id) {
  if (this.black === user_id) {
    return BOARD_STATE.BLACK;
  } else if (this.white === user_id) {
    return BOARD_STATE.WHITE;
  } else {
    return null;
  }
};

//----------

/**
 * 上方向の石がひっくり返る枚数を数える
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {number} ひっくり返る枚数
 */
Othello.prototype.getChangeCountUp = function (color, position) {
  var count = 0,
      count_tmp = 0,
      h = 0,
      x = position.x,
      y = position.y;
  
  for (h = y - 1; h >= 0; h--) {
    // ひっくり返る枚数を数える
    count_tmp = CheckStone(color, this.board[h][x], count);
    
    if (count_tmp) {
      if (count === count_tmp) {  // 枚数が増えない場合は終了
        break;
      } else {  // 枚数が増えている間は続行
        count = count_tmp;
      }
    } else { // 0が帰ってくる場合はその位置には置けない
      count = 0;
      break;
    }
  }
  
  if (h < 0) {
    count = 0;
  }
  
  return count;
};

/**
 * 下方向の石がひっくり返る枚数を数える
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {number} ひっくり返る枚数
 */
Othello.prototype.getChangeCountDown = function (color, position) {
  var count = 0,
      count_tmp = 0,
      h = 0,
      x = position.x,
      y = position.y;
  
  for (h = y + 1; h < BOARD_HEIGHT; h++) {
    // ひっくり返る枚数を数える
    count_tmp = CheckStone(color, this.board[h][x], count);
    
    if (count_tmp) {
      if (count === count_tmp) {  // 枚数が増えない場合は終了
        break;
      } else {  // 枚数が増えている間は続行
        count = count_tmp;
      }
    } else { // 0が帰ってくる場合はその位置には置けない
      count = 0;
      break;
    }
  }
  
  if (h >= BOARD_HEIGHT) {
    count = 0;
  }
  
  return count;
};

/**
 * 左方向の石がひっくり返る枚数を数える
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {number} ひっくり返る枚数
 */
Othello.prototype.getChangeCountLeft = function (color, position) {
  var count = 0,
      count_tmp = 0,
      w = 0,
      x = position.x,
      y = position.y;
  
  for (w = x - 1; w >= 0; w--) {
    // ひっくり返る枚数を数える
    count_tmp = CheckStone(color, this.board[y][w], count);
    
    if (count_tmp) {
      if (count === count_tmp) {  // 枚数が増えない場合は終了
        break;
      } else {  // 枚数が増えている間は続行
        count = count_tmp;
      }
    } else { // 0が帰ってくる場合はその位置には置けない
      count = 0;
      break;
    }
  }
  
  if (w < 0) {
    count = 0;
  }
  
  return count;
};

/**
 * 右方向の石がひっくり返る枚数を数える
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {number} ひっくり返る枚数
 */
Othello.prototype.getChangeCountRight = function (color, position) {
  var count = 0,
      count_tmp = 0,
      w = 0,
      x = position.x,
      y = position.y;
  
  for (w = x + 1; w < BOARD_WIDTH; w++) {
    // ひっくり返る枚数を数える
    count_tmp = CheckStone(color, this.board[y][w], count);
    
    if (count_tmp) {
      if (count === count_tmp) {  // 枚数が増えない場合は終了
        break;
      } else {  // 枚数が増えている間は続行
        count = count_tmp;
      }
    } else { // 0が帰ってくる場合はその位置には置けない
      count = 0;
      break;
    }
  }
  
  if (w >= BOARD_WIDTH) {
    count = 0;
  }
  
  return count;
};


/**
 * 左上方向の石がひっくり返る枚数を数える
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {number} ひっくり返る枚数
 */
Othello.prototype.getChangeCountUpLeft = function (color, position) {
  var count = 0,
      count_tmp = 0,
      w = 0,
      h = 0,
      x = position.x,
      y = position.y;
  
  for (w = x - 1, h = y - 1; (h >= 0 && w >= 0); w--, h--) {
    // ひっくり返る枚数を数える
    count_tmp = CheckStone(color, this.board[h][w], count);
    
    if (count_tmp) {
      if (count === count_tmp) {  // 枚数が増えない場合は終了
        break;
      } else {  // 枚数が増えている間は続行
        count = count_tmp;
      }
    } else { // 0が帰ってくる場合はその位置には置けない
      count = 0;
      break;
    }
  }
  
  if (w < 0 || h < 0) {
    count = 0;
  }
  
  return count;
};

/**
 * 右上方向の石がひっくり返る枚数を数える
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {number} ひっくり返る枚数
 */
Othello.prototype.getChangeCountUpRight = function (color, position) {
  var count = 0,
      count_tmp = 0,
      w = 0,
      h = 0,
      x = position.x,
      y = position.y;
  
  for (w = x + 1, h = y - 1; (h >= 0 && w < BOARD_WIDTH); w++, h--) {
    // ひっくり返る枚数を数える
    count_tmp = CheckStone(color, this.board[h][w], count);
    
    if (count_tmp) {
      if (count === count_tmp) {  // 枚数が増えない場合は終了
        break;
      } else {  // 枚数が増えている間は続行
        count = count_tmp;
      }
    } else { // 0が帰ってくる場合はその位置には置けない
      count = 0;
      break;
    }
  }
  
  if (h < 0 || w >= BOARD_WIDTH) {
    count = 0;
  }
  
  return count;
};


/**
 * 左下方向の石がひっくり返る枚数を数える
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {number} ひっくり返る枚数
 */
Othello.prototype.getChangeCountDownLeft = function (color, position) {
  var count = 0,
      count_tmp = 0,
      w = 0,
      h = 0,
      x = position.x,
      y = position.y;
  
  for (w = x - 1, h = y + 1; (h < BOARD_HEIGHT && w >= 0); w--, h++) {
    // ひっくり返る枚数を数える
    count_tmp = CheckStone(color, this.board[h][w], count);
    
    if (count_tmp) {
      if (count === count_tmp) {  // 枚数が増えない場合は終了
        break;
      } else {  // 枚数が増えている間は続行
        count = count_tmp;
      }
    } else { // 0が帰ってくる場合はその位置には置けない
      count = 0;
      break;
    }
  }
  
  if (w < 0 || h >= BOARD_HEIGHT) {
    count = 0;
  }
  
  return count;
};

/**
 * 右下方向の石がひっくり返る枚数を数える
 * 
 * @param {number} color 置く石の色
 * @param {Object} position 石を置く位置
 * @returns {number} ひっくり返る枚数
 */
Othello.prototype.getChangeCountDownRight = function (color, position) {
  var count = 0,
      count_tmp = 0,
      w = 0,
      h = 0,
      x = position.x,
      y = position.y;
  
  for (w = x + 1, h = y + 1; (h < BOARD_HEIGHT && w < BOARD_WIDTH); w++, h++) {
    // ひっくり返る枚数を数える
    count_tmp = CheckStone(color, this.board[h][w], count);
    
    if (count_tmp) {
      if (count === count_tmp) {  // 枚数が増えない場合は終了
        break;
      } else {  // 枚数が増えている間は続行
        count = count_tmp;
      }
    } else { // 0が帰ってくる場合はその位置には置けない
      count = 0;
      break;
    }
  }
  
  if (w >= BOARD_WIDTH || h >= BOARD_HEIGHT) {
    count = 0;
  }
  
  return count;
};


module.exports = Othello;