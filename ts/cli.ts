import * as fs from 'fs';
import * as commander from "commander";
import Forker from './forker';
import Constants from './constants';

let API = require('./api');
let CONFIG_PATH = Constants.CONFIG_PATH;

class CLI {
  private commander: commander.CommanderStatic;
  private api: any;
  private config: any;

  constructor() {
    this.commander = commander;
    this.api = new API();
    this._setVersion();
    this._setOptions();
    this._loadConfig();
  }

  public _setVersion() {
    let pinfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.commander.version(pinfo.version);
  }

  public _setOptions() {
    this.commander
      .usage('[options] <uris ...>')
      .arguments('<uris...>')
      .action((uris: string) => {
        this.commander.uris = uris;
      })
      .option('-a, --access-token <token>', 'Spotify API access token')
      .option('-p, --public', 'Create all forks as public')
      .parse(process.argv)
  }

  public _loadConfig() {
    try {
      let data = fs.readFileSync(CONFIG_PATH, 'utf8')
      this.config = JSON.parse(data);
    } catch (error) {
      fs.writeFileSync(CONFIG_PATH, '');
      this.config = {};
    }

    if(this.commander.accessToken) {
      this.config.accessToken = this.commander.accessToken;
    } 
  }

  public _validateAPI() {
    console.log(this.config.access_token);
    return new Promise((resolve, reject) => {
      this.api.getMe()
        .then(() => {
          console.log("WORKS");
          resolve()
        })
        .catch((err: Error) => {
          console.error(err.toString());
          reject(err)
        })
    })
  }

  public _loadAPI() {
    this.api.setAccessToken(this.config.access_token);

    return new Promise((resolve, reject) => {
      this._validateAPI()

        // Access token is valid
        .then(() => { 
          resolve();

          // We are rewriting the access token even if it's valid
          // TODO: Break chain instead of re-writing.
          return this.config.access_token;
        })
        
        // Access token is invalid. Regenerate...
        .catch(() => { return this.api.generateAccessToken() })
        
        // Save token in config file
        .then((token: string) => { 

          // Replace old token with new one
          this.config.access_token = token;

          // Save config for future use
          fs.writeFile(CONFIG_PATH, JSON.stringify(this.config), (error?: Error) => {
            if(error) { return reject(error) }
            resolve();
          })
        })

        // Unable to generate a new access token, or unable to save config file
        .catch((err: Error) => reject(err));
    })
  }

  public execute() {
    if(!this.commander.uris) {
      console.error('Please specify uris as arguments');
      return;
    }

    this._loadAPI()
      .then(() => {
        let forker = new Forker({
          visible: this.commander.public,
          accessToken: this.config.accessToken
        });

        for (let uri of this.commander.uris) {
          forker.fork(uri);
        }
      })
      .catch((err) => console.error(err.toString()))
  }
}

export default CLI;

new CLI().execute();
