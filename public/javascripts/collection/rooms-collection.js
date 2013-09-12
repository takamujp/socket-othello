window.Othello = window.Othello || {};
window.Othello.Collection = window.Othello.Collection || {};

(function () {
    var Rooms = Backbone.Collection.extend({
        model: window.Othello.Model.Room
    });

    window.Othello.Collection.Rooms = Rooms;
})();