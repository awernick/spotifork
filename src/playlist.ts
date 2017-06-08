import Track from "./track";

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
    return new Playlist("Test", { visible: false, collaborative: false })
  }

  public duplicate(options: any) {

  }

  public save(api: any) {
    if(this.id == null) {
      this.create(api)
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

  public create(api: any) {
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
