import * as commander from "commander";
import Playlist, { PlaylistFactory } from "./playlist";
let API = require('api');

interface ForkerArgs {
  accessToken: string
  visible: boolean
}

/**
 * TODO: Duplicate playlist, changing options based on args
 **/
class Forker {

  /** Visibility for playlist forks **/
  private visible: boolean

  /** Spotify API REST client **/
  private client: any;

  constructor(args: ForkerArgs) {
    this.visible = args.visible;
    this.client = new API(args.accessToken);
    PlaylistFactory.setClient(this.client);
  }

  public fork(uri: string) {
    let playlist = PlaylistFactory.fromUri(uri);
    this.client.getMe().then((user: any) => {
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
