window.Othello = window.Othello || {};
window.Othello.View = window.Othello.View || {};

(function () {
    var Cell = Backbone.View.extend({
        tagName: 'td',
        className: 'cell',
        id: function () { return _.uniqueId('cell'); },
        events: {
            'click': 'onClick'
        },            
                
        /**
         * 初期化
         */
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'remove', this.remove);
        },
                
        /**
         * 描画
         * @returns {Backbone.View} thisオブジェクト
         */
        render: function () {
            this.$el.css('background-color', this.model.get('color'));
            return this;
        },
        
        /**
         * onClick
         */
        onClick: function () {
            window.Othello.Socket.emit('putStone', {position: {x: this.model.get('x'), y: this.model.get('y')}});
        },
        /**
         * 削除イベント
         */
        remove: function () {
            Backbone.View.prototype.remove.call(this);
        }
    });
    
    window.Othello.View.Cell = Cell;
})();


