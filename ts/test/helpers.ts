import * as fs from "fs";
import * as os from "os"
import * as path from "path";

let configFile = fs.readFileSync(path.join(os.homedir(), '.spotiforkr'));
let config = JSON.parse(configFile.toString());

module.exports = {
  config: config
}
