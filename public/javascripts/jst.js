window.JST = window.JST || {};

window.JST.Lobby = _.template(
    '<div id="lobby">ロビー\
        <ul id="rooms"></ul>\
    </div>'
);

window.JST.Stage = _.template(
    '<div id="stage">\
        <div id="score">\
            <div>\
                <div id="black-user">空席</div>\
                <div class="symbol color-black"></div><div id=black-score>0</div>\
            </div>\
            <div>\
                <div id="white-user">空席</div>\
                <div class="symbol color-white"></div><div id=white-score>0</div>\
            </div>\
        </div>\
        <table>\
            <tbody id="board">\
            </tbody>\
        </table>\
        <div id="msg"></div><div><button id="restart">再戦</button><button id="leave">退室</button></div>\
    </div>'
);

window.JST.Room = _.template(
    '<span><%= name %>  </span><span>黒:<input data-type="black" data-room="<%= name %>" type="button" value="席に着く" <% if (black) { %> disabled <% } %>></span><span>白:<input data-type="white" type="button" data-room="<%= name %>" value="席に着く" <% if (white) { %> disabled <% } %>></span>'
);