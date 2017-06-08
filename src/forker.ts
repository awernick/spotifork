import * as commander from "commander";
import Playlist from "./playlist";

let SpotifyAPI = require('spotify-web-api-node');

interface ForkerArgs {
  accessToken: string
  visible: boolean
}

class Forker {
  private accessToken: string
  private visible: boolean
  private api: any

  constructor(args: ForkerArgs) {
    this.accessToken = args.accessToken;
    this.visible = args.visible;
    this.api = new SpotifyAPI();
    this.api.setAccessToken(this.accessToken);
  }

  public fork(uri: string) {
    let playlist = Playlist.fromUri(uri);
    this.api.getMe().then((user: any) => {
      playlist.duplicate({});
      playlist.create(this.api);
      playlist.save(this.api);
    })
  }
}

export default Forker;
