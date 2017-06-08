"use strict";
exports.__esModule = true;
var Playlist = (function () {
    function Playlist(name, options) {
        this.name = name;
        this.id = options.id;
    }
    Playlist.fromUri = function (uri) {
        return new Playlist("Test", { visible: false, collaborative: false });
    };
    Playlist.prototype.duplicate = function (options) {
    };
    Playlist.prototype.save = function (api) {
        if (this.id == null) {
            this.create(api);
        }
        for (var _i = 0, _a = this.tracks; _i < _a.length; _i++) {
            var track = _a[_i];
            api.addTracksToPlaylist(this.userId, this.id, track.uri)
                .then(function (data) {
                console.log('Tracks added to playlist!');
            })["catch"](function (err) {
                console.error(err.toString());
            });
        }
    };
    Playlist.prototype.create = function (api) {
        var _this = this;
        api.createPlaylist(this.userId, this.name, {
            public: this.visible,
            collaborative: this.collaborative,
            description: this.description
        }).then(function (data) {
            console.log("Playlist " + data.id + " created!");
            _this.id = data.id;
        })["catch"](function (err) {
            console.log(err);
        });
    };
    return Playlist;
}());
exports["default"] = Playlist;
