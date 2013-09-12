window.Othello = window.Othello || {};
window.Othello.View = window.Othello.View || {};

(function () {
    var App = Backbone.View.extend({
        el: '#appview',
        mainView: null,
        
        /**
         * 初期化
         */
        initialize: function () {
            this.listenTo(this.options.router, 'route', this.dispatch);
        },
                
        /**
         * 描画
         * @returns {Backbone.View} thisオブジェクト
         */
        render: function () {
            return this;
        },
        
        /**
         * routeイベントに応じて、viewを切り替える
         * @param {String} name　アクション名
         * @param {Hash} args アクションの引数
         */
        dispatch: function (name, args) {
            if (!_.include(['index', 'enter'], name)) {
                return;
            }
            
            if (this.mainView) {
                this.mainView.remove();
            }
            
            switch(name) {
                case 'index':
                    this.$el.html(JST.Lobby());
                    var rooms = new window.Othello.Collection.Rooms,
                        lobby_view = new window.Othello.View.Lobby({collection: rooms});
                
                    this.mainView = lobby_view;
                    break;
                
                case 'enter':
                    this.$el.html(JST.Stage());
                    var cells = new window.Othello.Collection.Cells,
                        board_view = new window.Othello.View.Board({collection: cells});

                    this.mainView = board_view;
                    break;
            }
        },
        
    });
    
    window.Othello.View.App = App;
})();



