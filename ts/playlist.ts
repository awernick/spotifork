import Track from "./track";
let clone = require('lodash.clone');
let api = require('./api')();

interface PlaylistOptions {
  id?: string
  userId?: string
  visible?: boolean
  collaborative?: boolean
  description?: string
}

class Playlist {
  public id: string | undefined
  public userId: string | undefined
  public name: string
  public visible: boolean
  public collaborative: boolean
  public description: string | undefined
  public tracks: Array<Track>
  public api: any

  constructor(name: string, options: PlaylistOptions, api: any) {
    this.name = name;
    Object.assign(this, options);
    this.api = api;
  }

  public load() {
    return new Promise<any>((resolve: any, reject: any) => {
      this.api.getPlaylist(this.userId, this.id)
        .then((data: any) => {
          this.name = data.name;
          this.collaborative = data.collaborative;
          this.description = data.description;
          this.visible = data.public;
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        })
    })
  }

  public duplicate(options: any) {
    return clone(this);
  }

  public save() {
    if(this.id == null) {
      this.create();
    }

    for(let track of this.tracks) {
      this.api.addTracksToPlaylist(this.userId, this.id, track.uri)
        .then((data: any) => {
          console.log('Tracks added to playlist!');
        })
        .catch((err: any) => {
          console.error(err.toString());
        })
    }
  }

  public create() {
    this.api.createPlaylist(this.userId, this.name, {
      public: this.visible,
      collaborative: this.collaborative,
      description: this.description
    }).then((data: any) => {
      console.log(`Playlist ${data.id} created!`);
      this.id = data.id;
    }).catch((err: Error) => {
      console.log(err);
    })
  }
}

class PlaylistFactoryBuilder {

  /** Spotify REST client **/
  private client: any

  public setClient(client: any) {
    this.client = client;
  }

  public create(name: string, options: PlaylistOptions) {
    if(this.client == null) {
      throw new Error("Missing REST client. Call setClient first");
    }
    return new Playlist(name, options, this.client);
  }

  public fromUri(uri: string) {
    var [userId, kind, id] = uri.split(':');
    let playlist = new Playlist("blank", { 
      userId: userId,
      id: id,
      visible: false, 
      collaborative: false 
    }, this.client)
    playlist.load();
    return playlist;
  }
}

let PlaylistFactory = new PlaylistFactoryBuilder();

export { PlaylistFactory };
export default Playlist;
