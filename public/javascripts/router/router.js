window.Othello = window.Othello || {};
window.Othello.Router = Backbone.Router.extend({
    routes: {
        "": "index",
        ":room_name": "enter"
    }
});
