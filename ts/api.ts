let SpotifyAPI = require('spotify-web-api-node');
let instance: any;

function getInstance(accessToken: string) {
  if(instance == null) {
    if(accessToken == null) {
      throw new Error("Initialize API with access token");
    }

    instance = new SpotifyAPI();
    instance.setAccessToken(accessToken);
  }
  return instance;
}

module.exports = getInstance.bind(this);
