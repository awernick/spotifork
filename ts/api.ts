import * as http from 'http';
import * as url from 'url';
import * as express from 'express';
let SpotifyAPI = require('spotify-web-api-node');
let opn = require('opn');

const PORT = 4567
const REDIRECT_URI = `http://localhost:${PORT}/callback`

const AUTH_URL = 'https://accounts.spotify.com/authorize'
const CLIENT_ID = 'e1d2c48246124c16b0b45b3c22a81df0'
const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private'
]

function generateAccessToken() {
  return new Promise((resolve, reject) => {
    let server = express();
    server.listen(PORT);

    // Listen to incoming callback from Spotify
    server.get('/callback', function(req, res) {

      // Parse hash fragment from OAuth and send it back to server *sigh*
      res.write(
        "<script type='text/javascript'> " +
        "var http = new XMLHttpRequest(); " +
        "var hash = window.location.hash.substr(1);" +
        "var token = hash.substr(hash.indexOf('access_token='))" +
        ".split('&')[0]" + 
        ".split('=')[1];" +
        "var url = '/token?access_token=' + token;" +
        "http.open('GET', url, true); " +
        "http.send(null);" + 
        "setTimeout(window.close, 500);" +
        "</script>"
      );
    })

    server.get('/token', function(req, res) {
      let params = url.parse(req.url, true);
      let access_token = params.query.access_token;
      if(access_token) {
        resolve(access_token);
      } else {
        reject(new Error(req.params.error));
      }
    })


    // Build auth url with params
    let tmp_url = url.parse(AUTH_URL);
    tmp_url.query = {};
    tmp_url.query['client_id'] = CLIENT_ID;
    tmp_url.query['response_type'] = 'token';
    tmp_url.query['scope'] = SCOPES.join(' ');
    let auth_url = url.format(tmp_url);
    auth_url += `&redirect_uri=${REDIRECT_URI}`;

    // Call Spotify endpoint
    opn(auth_url, function(error: Error) {
      if(error) { reject(error) }
    })
  })
}

function createRESTClient(accessToken: string) {
  if(accessToken == null) {
    throw new Error("Please provide access token to authenticate client");
  }

  let client = new SpotifyAPI();
  client.setAccessToken(accessToken);
  client.generateAccessToken = generateAccessToken;
  return client;
}

module.exports = createRESTClient;
