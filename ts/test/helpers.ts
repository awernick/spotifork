import * as fs from "fs";
import * as os from "os"
import * as path from "path";

let API = require('../api');
let configPath = path.join(os.homedir(), '.spotiforkr');
let configFile = fs.readFileSync(configPath);
let config = JSON.parse(configFile.toString());

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
  refreshConfig: refreshConfig
}
