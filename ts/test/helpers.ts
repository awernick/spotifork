import * as fs from "fs";
import * as os from "os"
import * as path from "path";

let API = require('../api');
let configPath = path.join(os.homedir(), '.spotiforkr');
let configFile = fs.readFileSync(configPath);
let config = JSON.parse(configFile.toString());

const VALID_USER_ID = 'spotify';
const VALID_PLAYLIST_ID = '37i9dQZF1DXdgz8ZB7c2CP';
const VALID_PLAYLIST_URI = 
`spotify:user:${VALID_USER_ID}:playlist:${VALID_PLAYLIST_ID}`;
const PERSONAL_PLAYLIST_ID = '3LMKpFlpPDC1QjE49DmDms';

/** Generate a new access token and save it to our config fie **/
function refreshConfig() {
  return new Promise((resolve, reject) => {
    let api = new API(config.access_token);
    api.generateAccessToken().then((token: string) => {
      let new_config = {
        "access_token": token
      };
      
      config = {...config, ...new_config};
      fs.writeFile(configPath, JSON.stringify(config), (error?: Error) => {
        if(error) { return reject(error) }
        resolve(config);
      })
    })
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
