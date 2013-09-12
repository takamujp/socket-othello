window.Othello = window.Othello || {};

Object.defineProperty(window.Othello, 'BOARD_STATE', {
    get: function () {
        return {
            'BLACK': 0,
            'WHITE': 1,
            'NONE': -1
        };
    }
});

window.Othello.Util = {
    getColor: function (color) {
        if (color === window.Othello.BOARD_STATE.BLACK) {
            return 'black';
        } else if (color === window.Othello.BOARD_STATE.WHITE) {
            return 'white';
        } else {
            return '';
        }
    }
};