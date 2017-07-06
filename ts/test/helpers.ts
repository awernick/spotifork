import * as fs from "fs";
import * as os from "os"
import * as path from "path";
import Constants from "../constants";

let API = require('../api');
let CONFIG_PATH = Constants.CONFIG_PATH;

// Load config file, or create one
let configFile: Buffer;
let config: any;

try {
  configFile = fs.readFileSync(CONFIG_PATH);
  config = JSON.parse(configFile.toString());
} catch (err) {
  fs.writeFileSync(CONFIG_PATH, '{}');
  config = {};
}

// Overwrite config if in test ENV
if(process.env.NODE_ENV == 'test') {
  config = {
    access_token: process.env.SPOTIFY_ACCESS_TOKEN,
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
  }
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
  if(process.env.NODE_ENV == 'test') {
    api.setClientSecret(process.env.SPOTIFY_CLIENT_SECRET);
    return new Promise((resolve, reject) => {
      api.refreshAccessToken()
        .then((data: any) => {
          api.setAccessToken(data.body.access_token);
          resolve();
        })
        .catch((err: Error) => reject(err))
    })
  } 

  // Client side can only be generated and not refreshed. Open
  // a browser window to generate a new access token.
  else {
    return new Promise((resolve, reject) => {
      api.generateAccessToken().then((token: string) => {
        let new_config = {
          "access_token": token
        };
        
        config = {...config, ...new_config};
        fs.writeFile(CONFIG_PATH, JSON.stringify(config), (error?: Error) => {
          if(error) { return reject(error) }
          resolve(config);
        })
      })
    })
  }
}

module.exports = {
  config: config,
  refreshConfig: refreshConfig,
  VALID_USER_ID: VALID_USER_ID,
  VALID_PLAYLIST_ID: VALID_PLAYLIST_ID,
  VALID_PLAYLIST_URI: VALID_PLAYLIST_URI,
  PERSONAL_PLAYLIST_ID: PERSONAL_PLAYLIST_ID
}
