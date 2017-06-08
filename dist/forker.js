"use strict";
exports.__esModule = true;
var playlist_1 = require("./playlist");
var SpotifyAPI = require('spotify-web-api-node');
var Forker = (function () {
    function Forker(args) {
        this.accessToken = args.accessToken;
        this.visible = args.visible;
        this.api = new SpotifyAPI();
        this.api.setAccessToken(this.accessToken);
    }
    Forker.prototype.fork = function (uri) {
        var _this = this;
        var playlist = playlist_1["default"].fromUri(uri);
        this.api.getMe().then(function (user) {
            playlist.duplicate({});
            playlist.create(_this.api);
            playlist.save(_this.api);
        });
    };
    return Forker;
}());
exports["default"] = Forker;
