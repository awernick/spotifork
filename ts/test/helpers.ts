import * as fs from "fs";
import * as os from "os"
import * as path from "path";
import Constants from "../constants";

let API = require('../api');
require('dotenv').config();

// Load config file, or create one
let config: any;

// Overwrite config if in test ENV
config = {
  access_token: process.env.SPOTIFY_ACCESS_TOKEN,
  refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
  client_secret: process.env.SPOTIFY_CLIENT_SECRET
}

const VALID_USER_ID = 'spotify';
const VALID_PLAYLIST_ID = '37i9dQZF1DXdgz8ZB7c2CP';
const VALID_PLAYLIST_URI = 
`spotify:user:${VALID_USER_ID}:playlist:${VALID_PLAYLIST_ID}`;
const PERSONAL_PLAYLIST_ID = '3LMKpFlpPDC1QjE49DmDms';

/** Generate a new access token and save it to our config fie **/
function refreshConfig() {
  let api = new API(config.access_token);

  // We can refresh a token in test env since we 
  // have client secret.
  api.setClientSecret(config.client_secret);
  api.setRefreshToken(config.refresh_token);
  return new Promise((resolve, reject) => {
    api.refreshAccessToken()
      .then((data: any) => {
        api.setAccessToken(data.body.access_token);
        resolve();
      })
      .catch((err: Error) => reject(err))
  })
}

module.exports = {
  config: config,
  refreshConfig: refreshConfig,
  VALID_USER_ID: VALID_USER_ID,
  VALID_PLAYLIST_ID: VALID_PLAYLIST_ID,
  VALID_PLAYLIST_URI: VALID_PLAYLIST_URI,
  PERSONAL_PLAYLIST_ID: PERSONAL_PLAYLIST_ID
}
