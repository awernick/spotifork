import Track from "./track";
let clone = require('lodash.clone');

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
    this.tracks = [];
  }

  public load() {
    return new Promise<any>((resolve: any, reject: any) => {
      this.api.getPlaylist(this.userId, this.id)
        .then((data: any) => {
          this.name = data.body.name;
          this.collaborative = data.body.collaborative;
          this.description = data.body.description;
          this.visible = data.body.public;
          this._loadTracks(data.body.tracks.items);
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        })
    })
  }

  public _loadTracks(items: Array<any>) {
    if (typeof items === 'undefined' || !Array.isArray(items)) {
      throw new Error('Please provide an array of tracks to load');
    }

    for(let item of items) {
      item = item.track;

      // Load artists names
      let artists: Array<string> = []; 
      for(let artist of item.artists) {
        artists.push(artist.name);
      }

      let track: Track = {
        id: item.id,
        uri: item.uri,
        name: item.name,
        album: item.album.name,
        artists: artists.join(', ')
      }
      this.tracks.push(track);
    }
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
    return new Promise((resolve, reject) => {
      this.api.createPlaylist(this.userId, this.name, {
        public: this.visible,
        collaborative: this.collaborative,
        description: this.description
      }).then((data: any) => {
        this.id = data.body.id;
        resolve();
      }).catch((err: Error) => {
        reject(err);
      })
    })
  }

  /** Unfollowing your own playlist is the same as destroying them **/
  public unfollow() {
    return new Promise((resolve, reject) => {
      this.api.unfollowPlaylist(this.userId, this.id)
        .then((data: any) => {
          resolve();
        })
        .catch((err: Error) => {
          reject(err);
        })
    })
  }
}

class PlaylistFactoryBuilder {

  /** Spotify REST client **/
  private client: any

  public setClient(client: any) {
    this.client = client;
  }

  public build(name: string, options: PlaylistOptions) {
    if(this.client == null) {
      throw new Error("Missing REST client. Call setClient first");
    }
    return new Playlist(name, options, this.client);
  }

  public fromUri(uri: string) {
    var [_, _, userId, kind, id] = uri.split(':');
    let playlist = this.build("NewPlaylist", {
      userId: userId,
      id: id,
      visible: false, 
      collaborative: false 
    });
    return playlist;
  }
}

let PlaylistFactory = new PlaylistFactoryBuilder();

export { PlaylistFactory };
export default Playlist;
