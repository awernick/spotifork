#!/usr/bin/env node

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
    let pinfo = require('../package.json');
    this.commander.version(pinfo.version);
  }

  public _setOptions() {
    this.commander
      .usage('[options] <uris ...>')
      .arguments('<uris...>')
      .action((uris: string) => {
        this.commander.uris = uris;
      })
      .option('-a, --access-token <token>', 'Spotify Web API access token')
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

  public async _validateAPI() {
    return this.api.getMe();
  }

  public async _loadAPI() {
    // Verify that the access token that we have works
    try {
      this.api.setAccessToken(this.config.access_token);
      await this._validateAPI();
    } 

    // The access token doesn't work, regenerate it.
    catch(e) {
      console.log("Missing or invalid access token. Regenerating...");

      try {
        let token = await this.api.generateAccessToken() 
        this.config.access_token = token;
      } catch(e) {
        console.error("Could not generate/obtain access token. Exiting...");
        throw e;
      }
    }

    // Save config for future use
    fs.writeFile(CONFIG_PATH, JSON.stringify(this.config), (error?: Error) => {
      if(error) { console.log("Could not write access token to file") }
    })
  }

  public async execute() {
    if(!this.commander.uris) {
      console.error('Please specify uris as arguments');
      return;
    }

    try {
      await this._loadAPI();
    } catch(e) {
      console.error(e.toString());
      return;
    }

    let forker = new Forker({
      visible: this.commander.public,
      accessToken: this.config.access_token
    });

    console.log("\nForking...");
    for (let uri of this.commander.uris) {
      try {
        console.log(`\n+ URI: ${uri}`);
        await forker.fork(uri)
        console.log("  done!")
      } catch(err) {
        console.error("  " + err.toString())
      }
    }
  }
}

export default CLI;

new CLI().execute();
