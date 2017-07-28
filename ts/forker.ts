import * as commander from "commander";
import Playlist, { PlaylistFactory } from "./playlist";
let API = require('./api');


interface ForkerArgs {
  /** Access token for Spotify API **/
  accessToken: string

  /** Visibility for playlist forks **/
  visible: boolean
}


/**
 * Duplicates Spotify playlists using the Web API
 **/
class Forker {

  /** Visibility for playlist forks **/
  private visible: boolean

  /** Spotify API REST client **/
  private client: any;


  /**
   * @constructor
   * @param {ForkerArgs} args - Includes visibility for playlists, and 
   * access token
   */
  constructor(args: ForkerArgs) {
    this.visible = args.visible;
    this.client = new API(args.accessToken);
    PlaylistFactory.setClient(this.client);
  }


  /**
   * Fork a Spotify playlist using the URI representation.
   * @param {String} uri - Spotify playlist uri
   * @returns {Promise} success if forking completed, error otherwise
   */
  public async fork(uri: string) {
    let playlist = PlaylistFactory.fromUri(uri);

    // Load User data
    let data = await this.client.getMe()
    let user = data.body;
    await playlist.load();

    playlist = playlist.duplicate({
      id: '',
      userId: user.id,
      visible: this.visible
    });

    await playlist.create();
    await playlist.save();
    return playlist;
  }
}

export default Forker;
