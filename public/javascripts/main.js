(function () {
    window.Othello.Socket = io.connect("http://mumu.sharuru07.jp:3100/",  {"sync disconnect on unload" : true});
    
    var router = new window.Othello.Router(),
        app = new window.Othello.View.App({router: router});
    
    Backbone.history.start();
    
})();
