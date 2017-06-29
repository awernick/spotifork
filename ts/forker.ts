import * as commander from "commander";
import Playlist from "./playlist";
let api = require('api');

interface ForkerArgs {
  visible: boolean
}

/**
 * TODO: Duplicate playlist, changing options based on args
 **/
class Forker {

  /** Visibility for playlist forks **/
  private visible: boolean

  constructor(args: ForkerArgs) {
    this.visible = args.visible;
  }

  public fork(uri: string) {
    let playlist = Playlist.fromUri(uri);
    api.getMe().then((user: any) => {
      playlist = playlist.duplicate({
        userId: user.id,
        visible: this.visible
      });
      playlist.create();
      playlist.save();
    })
  }
}

export default Forker;
