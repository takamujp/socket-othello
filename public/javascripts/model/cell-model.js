window.Othello = window.Othello || {};
window.Othello.Model = window.Othello.Model || {};

(function () {
    var Cell = Backbone.Model.extend({
        defalut: {
            x: 0,
            y: 0,
            color: ''
        }
    });
    
    window.Othello.Model.Cell = Cell;
})();


