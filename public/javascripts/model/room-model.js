window.Othello = window.Othello || {};
window.Othello.Model = window.Othello.Model || {};

(function () {
    var Room = Backbone.Model.extend({
        defalut: {
            name: '',
            count: 0,
            black: '',
            white: '',
            watcher: 0
        }
    });
    
    window.Othello.Model.Room = Room;
})();



