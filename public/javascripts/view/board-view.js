window.Othello = window.Othello || {};
window.Othello.View = window.Othello.View || {};

(function () {
    var Board = Backbone.View.extend({
        el: '#stage',
        rows: [],
        cellViews: [],
        boardElement: null,
        scoreElement: null,
        msgElement: null,
        events : {
            'click #leave' : 'leave',
            'click #restart' : 'restart'
        },
        /**
         * 初期化
         */
        initialize: function () {
            var row_id = 0,
                    x = 0,
                    y = 0;

            this.boardElement = $(this.$el.find('#board')[0]);
            this.scoreElement = $(this.$el.find('#score')[0]);
            this.msgElement = $(this.$el.find('#msg')[0]);

            //イベント登録
            this.listenTo(this.collection, 'add', this.generateCellView);
            window.Othello.Socket.on('gameInfo', this.update.bind(this));

            // 盤面のelementを生成
            this.boardElement.empty();
            for (row_id = 0; row_id < 8; row_id++) {
                this.rows[row_id] = $('<tr class="row">');
                this.boardElement.append(this.rows[row_id]);
            }

            // Cellモデル生成
            var cells = [];
            for (y = 0; y < 8; y++) {
                for (x = 0; x < 8; x++) {
                    cells.push({x: x, y: y, color: '', id: y * 8 + x});
                }
            }
            this.collection.set(cells);

            window.Othello.Socket.emit('gameInfo');
        },
        /**
         * 削除イベント
         */
        remove: function () {
            window.Othello.Socket.emit('leaveRoom');
            Backbone.View.prototype.remove.call(this);
            window.Othello.Socket.removeListener('gameInfo', this.update.bind(this));
            
            this.cellViews.forEach(function (e) {
                e.remove();
            });
        },
        /**
         * Cellのviewを生成する
         * 
         * @param {Bacobone.Model} Cellモデル
         * @returns {Backbone.View} thisオブジェクト
         */
        generateCellView: function (cell) {
            var view = new window.Othello.View.Cell({'model': cell}),
            row_id = cell.get('y');

            this.cellViews.push(view);

            this.rows[row_id].append(view.$el);
            return this;
        },
        /**
         * 更新
         * 
         * @param {type} data
         */
        update: function (data) {
            if (data.blackUser) {
                this.scoreElement.find("#black-user").text(data.blackUser);
            }

            if (data.blackScore != undefined) {
                this.scoreElement.find("#black-score").text(data.blackScore);
            }

            if (data.whiteUser) {
                this.scoreElement.find("#white-user").text(data.whiteUser);
            }

            if (data.whiteScore != undefined) {
                this.scoreElement.find("#white-score").text(data.whiteScore);
            }
            
            if (data.msg) {
                this.msgElement.text(data.msg);
            }
            
            if (data.board) {
                var cells = [];
                for (var y = 0; y < 8; y++) {
                    for (var x = 0; x < 8; x++) {
//                        if (data.board[y][x] !== window.Othello.BOARD_STATE.NONE) {
                            cells.push({x: x, y: y, color: window.Othello.Util.getColor(data.board[y][x]), id: y * 8 + x});
//                        }
                    }
                }
                
                // cellモデルを更新する
                this.collection.set(cells, {remove: false});
            }
        },
        /**
         * 退室
         */
        leave: function () {
            window.Othello.Socket.emit('leaveRoom');
            Backbone.history.navigate('', true);
        },
        /**
         * 再戦
         */
        restart: function () {
            window.Othello.Socket.emit('restart');
        }

    });

    window.Othello.View.Board = Board;
})();



