import Track from "./track";
let clone = require('lodash.clone');
let api = require('api');

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

  constructor(name: string, options: PlaylistOptions) {
    this.name = name;
    this.id = options.id;
  }

  static fromUri(uri: string): Playlist {
    var [userId, kind, id] = uri.split(':');
    let playlist = new Playlist("blank", { 
      userId: userId,
      id: id,
      visible: false, 
      collaborative: false 
    })
    playlist.load();
    return playlist;
  }

  public load() {
    api.getPlaylist(this.userId, this.id)
      .then((data: any) => {
        this.name = data.name;
        this.collaborative = data.collaborative;
        this.description = data.description;
        this.visible = data.public;
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
      api.addTracksToPlaylist(this.userId, this.id, track.uri)
        .then((data: any) => {
          console.log('Tracks added to playlist!');
        })
        .catch((err: any) => {
          console.error(err.toString());
        })
    }
  }

  public create() {
    api.createPlaylist(this.userId, this.name, {
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

export default Playlist;
