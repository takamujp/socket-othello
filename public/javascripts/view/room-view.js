window.Othello = window.Othello || {};
window.Othello.View = window.Othello.View || {};

(function () {
    var Room = Backbone.View.extend({
        tagName : 'li',
        className : 'room',
        events : {
            'click input' : 'onClick'
        },
        /**
         * 初期化
         */
        initialize : function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'remove', this.remove);
            this.render();
        },
        /**
         * 描画
         * @returns {Backbone.View} thisオブジェクト
         */
        render : function () {
            this.$el.html(JST.Room(this.model.toJSON()));
            return this;
        },
        /**
         * 入室
         * 
         * @param {Event} e イベント
         */
        onClick : function (e) {
            var dataset = e.target.dataset;
            window.Othello.Socket.emit('enter', {
                room: dataset.room,
                type: dataset.type
            });
        }
    });

    window.Othello.View.Room = Room;
})();


