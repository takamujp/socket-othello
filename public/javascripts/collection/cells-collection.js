window.Othello = window.Othello || {};
window.Othello.Collection = window.Othello.Collection || {};

(function () {
    var Cells = Backbone.Collection.extend({
        model: window.Othello.Model.Cell
    });

    window.Othello.Collection.Cells = Cells;
})();