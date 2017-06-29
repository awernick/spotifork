let SpotifyAPI = require('spotify-web-api-node');

function createRESTClient(accessToken: string) {
  if(accessToken == null) {
    throw new Error("Please provide access token to authenticate client");
  }

  let client = new SpotifyAPI();
  client.setAccessToken(accessToken);
  return client;
}

module.exports = createRESTClient;
