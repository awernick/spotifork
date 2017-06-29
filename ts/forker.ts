import * as commander from "commander";
import Playlist, { PlaylistFactory } from "./playlist";
let client = require('api');

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
    PlaylistFactory.setClient(client);
  }

  public fork(uri: string) {
    let playlist = PlaylistFactory.fromUri(uri);
    client.getMe().then((user: any) => {
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
