let SpotifyAPI = require('spotify-web-api-node');

function createRESTClient(options: any) {
  return new Promise((resolve: any, reject: any) => {
    if(!options.accessToken) {
      throw new Error("Please provide access token to authenticate client");
    }

    let client = new SpotifyAPI();
    client.setAccessToken(options.accessToken);
    client.setRefreshToken(options.refreshToken);
    resolve(client);
  })
}

module.exports = createRESTClient;
