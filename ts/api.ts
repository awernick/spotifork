let SpotifyAPI = require('spotify-web-api-node');
let instance: any;

function getInstance(accessToken: string, refreshToken: string) {
  if(instance == null) {
    if(accessToken == null) {
      throw new Error("Initialize API with access token");
    }

    instance = new SpotifyAPI();
    instance.setAccessToken(accessToken);
    instance.setRefreshToken(refreshToken);
  }

  // Refresh token to ensure everything is working
  instance.refreshAccessToken().then((data: any) => {
    instance.setAccessToken(data.body['access_token'])
  })

  return instance;
}

module.exports = getInstance.bind(this);
