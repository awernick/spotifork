var SpotifyAPI = require('spotify-web-api-node');
var Forker = (function () {
    function Forker(accessToken) {
        client = new SpotifyAPI();
        client.setAccessToken(accessToken);
    }
    return Forker;
}());
