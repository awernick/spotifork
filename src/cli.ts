import * as commander from "commander";
import * as fs from "fs";
import Forker from "./forker";

class CLI {
  private commander: commander.CommanderStatic 

  constructor() {
    this.commander = commander;
    this.setVersion();
    this.setOptions();

    if(this.commander.accessToken == null) {
      let config = this.loadConfigFile();
      this.commander.accessToken = config.accessToken;
    }
  }

  setVersion() {
    let pinfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.commander.version(pinfo.version);
  }

  setOptions() {
    this.commander
      .usage('[options] <uri ...>')
      .arguments('<uri>')
      .option('-a, --access-token <token>', 'Spotify API access token')
      .option('-P, --public', 'Create all forks as public')
      .parseOptions(process.argv)
  }

  loadConfigFile() {
    let data = fs.readFileSync('.spotiforker.json', 'utf8')
    return JSON.parse(data);
  }

  execute() {
    let forker = new Forker({
      accessToken: this.commander.accessToken,
      visible: this.commander.public
    });

    console.log("TEST");
    console.log(this.commander.args);
    console.log(this.commander.uri);
    for (let uri of this.commander.args) {
      forker.fork(uri);
    }
  }
}

new CLI().execute();
