import * as commander from "commander";
import Playlist, { PlaylistFactory } from "./playlist";
let API = require('./api');

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
    return new Promise((resolve, reject) => {
      let playlist = PlaylistFactory.fromUri(uri);
      let user: any;

      // Load User data
      this.client.getMe()
      .then((data: any) => { user = data.body })

      // Load playlist tracks and info
      .then(() => { return playlist.load() })

      // Change playlist user and remove id
      .then(() => {
        playlist = playlist.duplicate({
          id: '',
          userId: user.id,
          visible: this.visible
        });
        console.log(playlist.id);
        console.log(playlist.userId);
        return playlist.create();
      })

      // Save playlist to the current user's account
      .then(() => { return playlist.save() })

      // Success!
      .then(() => resolve())

      // Throw error if anything happened in the chain
      .catch((err: Error) => {
        reject(err);
      });
    })
  }
}

export default Forker;
