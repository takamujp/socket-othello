(function () {
    window.Othello.Socket = io.connect(window.location.href,  {"sync disconnect on unload" : true});
    
    var router = new window.Othello.Router(),
        app = new window.Othello.View.App({router: router});
    
    Backbone.history.start();
    
})();
