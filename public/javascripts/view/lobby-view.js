window.Othello = window.Othello || {};
window.Othello.View = window.Othello.View || {};

(function () {
    function FormatData (data) {
        return {
            name: data.name,
            count: data.count,
            black: data.black,
            white: data.white,
            watcher: data.watcher.length
        };
    }

    var Lobby = Backbone.View.extend({
        el: '#lobby',
        /**
         * 初期化
         */
        initialize: function () {
            this.listenTo(this.collection, 'add', this.render);
            window.Othello.Socket.on('roomList', this.initRoomList.bind(this));
            window.Othello.Socket.on('addRoom', this.updateRoom.bind(this));
            window.Othello.Socket.on('removeRoom', this.updateRoom.bind(this));
            window.Othello.Socket.on('updateRoom', this.updateRoom.bind(this));
            window.Othello.Socket.on('enterRoom', this.enterRoom.bind(this));
            
            window.Othello.Socket.emit('roomList');
        },
        /**
         * イベント削除
         */
        remove: function () {
            Backbone.View.prototype.remove.call(this);
            window.Othello.Socket.removeListener('roomList', this.initRoomList.bind(this));
            window.Othello.Socket.removeListener('addRoom', this.updateRoom.bind(this));
            window.Othello.Socket.removeListener('removeRoom', this.updateRoom.bind(this));
            window.Othello.Socket.removeListener('updateRoom', this.updateRoom.bind(this));
            window.Othello.Socket.removeListener('enterRoom', this.enterRoom.bind(this));
        },
        /**
         * 描画
         * 
         * @param {Bacobone.Model}room Roomモデル
         * @returns {Backbone.View} thisオブジェクト
         */
        render: function (room) {
            var view = new window.Othello.View.Room({'model': room});

            this.$el.find('#rooms').append(view.$el);
            return this;
        },
        /**
         * ルームリスト初期化
         * 
         * @param {type} data
         */
        initRoomList: function (data) {
            var room_list = [],
                    name = '';

            for (name in data.roomList) {
                room_list.push(FormatData(data.roomList[name]));
            }

            this.collection.set(room_list);
        },
        /**
         * ルーム追加
         * @param {type} data
         */
        addRoom: function (data) {
            var room = new window.Othello.Model.Room(FormatData(data));

            this.collection.add(room);
        },
        /**
         * ルーム更新
         * @param {type} data
         */
        updateRoom: function (data) {
            this.collection.set([
                FormatData(data)
            ], {remove: false});
        },
        /**
         * ルーム削除
         * @param {type} data
         */
        removeRoom: function (data) {
            this.collection.remove(this.collection.where({name: data.name}));
        },
        /**
         * 入室
         * 
         * @param {type} data
         */
        enterRoom: function (data) {
            Backbone.history.navigate(data.room, true);
        }
    });

    window.Othello.View.Lobby = Lobby;
})();



