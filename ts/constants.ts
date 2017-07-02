import * as path from 'path';
import * as os from 'os';

module Constants {
  export const CONFIG_FILENAME = '.spotifork'
  export const CONFIG_PATH = path.join(os.homedir(), CONFIG_FILENAME);
}

export default Constants;
