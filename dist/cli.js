"use strict";
exports.__esModule = true;
var commander = require("commander");
var fs = require("fs");
var forker_1 = require("./forker");
var CLI = (function () {
    function CLI() {
        this.commander = commander;
        this.setVersion();
        this.setOptions();
        if (this.commander.accessToken == null) {
            var config = this.loadConfigFile();
            this.commander.accessToken = config.accessToken;
        }
    }
    CLI.prototype.setVersion = function () {
        var pinfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        this.commander.version(pinfo.version);
    };
    CLI.prototype.setOptions = function () {
        this.commander
            .usage('[options] <uri ...>')
            .arguments('<uri>')
            .option('-a, --access-token <token>', 'Spotify API access token')
            .option('-P, --public', 'Create all forks as public')
            .parseOptions(process.argv);
    };
    CLI.prototype.loadConfigFile = function () {
        var data = fs.readFileSync('.spotiforker.json', 'utf8');
        return JSON.parse(data);
    };
    CLI.prototype.execute = function () {
        var forker = new forker_1["default"]({
            accessToken: this.commander.accessToken,
            visible: this.commander.public
        });
        console.log("TEST");
        console.log(this.commander.args);
        console.log(this.commander.uri);
        for (var _i = 0, _a = this.commander.args; _i < _a.length; _i++) {
            var uri = _a[_i];
            forker.fork(uri);
        }
    };
    return CLI;
}());
new CLI().execute();
