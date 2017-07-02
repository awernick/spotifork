import Track from "./track";
let clone = require('lodash.clone');

interface PlaylistOptions {
  id?: string
  userId?: string
  visible?: boolean
  collaborative?: boolean
  description?: string
}

/** Object representation for a Spotify playlist. **/
class Playlist {
  public id: string | undefined
  public userId: string | undefined
  public name: string
  public visible: boolean | undefined
  public collaborative: boolean | undefined
  public description: string | undefined
  public tracks: Array<Track>
  public api: any

  /**
   * @constructor
   * @param {string} name - The name of the playlist
   * @param {PlaylistOptions} options - The options for the playlist
   * @param {SpotifyAPI} api - Instance of SpotifyAPI
   */
  constructor(name: string, options: PlaylistOptions, api: any) {
    this.name = name;
    this.userId = options.userId;
    this.id = options.id;
    this.visible = options.visible;
    this.collaborative = options.collaborative;
    this.description = options.description;
    this.api = api;
    this.tracks = [];
  }


  /**
   * Fetches information from Spotify API and loads it
   * into the appropriate attributes
   * @returns {Promise} status of the request to the Spotify API
   */
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
        .catch((error: any) => {
          let err = new Error(
            "Could not load playlist. Make sure user and id are valid."
          );
          reject(err);
        })
    })
  }


  /**
   * Duplicates a playlist without saving it through the Spotify API
   * @param {PlaylistOptions} options - options for the duplicate playlist
   * @returns {Playlist} duplicate of the current playlist.
   **/
  public duplicate(options: PlaylistOptions) {
    let playlist = clone(this);
    playlist = Object.assign(this, options);
    return playlist;
  }


  /**
   * Saves a playlist using the Spotify API.
   * If the playlist does not have a valid id, it first calls Playlist#create
   * to generate it.
   * @returns {Promise} status of the request to the Spotify API
   */
  public save() {
    return new Promise((resolve, reject) => {

      // Use this so that I don't repeat resolve / reject code
      let saveTracksFn = () => {
        this._saveTracks()
          .then(() => resolve())
          .catch((err: Error) => reject(err));
      }

      if(this.id == null) {
        this.create()
          .then(() => saveTracksFn())
          .catch((err: Error) => reject(err))
      } else {
        saveTracksFn();
      }
    })
  }

  
  /**
   * Commits a playlist and its tracks to Spotify.
   * @throws {Error} error - if playlist id is previously set.
   */
  public create() {
    // TODO: Assert id is blank before creating

    return new Promise((resolve, reject) => {
      this.api.createPlaylist(this.userId, this.name, {
        public: this.visible,
        collaborative: this.collaborative,
        description: this.description
      }).then((data: any) => {
        this.id = data.body.id;
        resolve();
      }).catch(() => {
        let err = new Error("Could not create playlist.");
        reject(err);
      })
    })
  }


  /** 
   * Unfollows a playlist for the current user.
   * NOTE: Unfollowing your own playlist is the same as destroying them 
   * @returns {Promise} status of the request to the Spotify API
   * **/
  public unfollow() {
    return new Promise((resolve, reject) => {
      this.api.unfollowPlaylist(this.userId, this.id)
        .then((data: any) => {
          resolve();
        })
        .catch(() => {
          let err = new Error(`Could not unfollow playlist: ${this.id}.`);
          reject(err);
        })
    })
  }


  /**
   * Convert Spotify API track response into simpler Track objects,
   * and store them in the current playlist.
   * @param {Array<any>} items - API Track object array
   */
  public _loadTracks(items: Array<any>) {
    if (typeof items === 'undefined' || !Array.isArray(items)) {
      throw new Error('Please provide an array of tracks to load.');
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


  /**
   * Adds the current tracks to the playlist using the Spotify API.
   * @returns {Promise} - status of the Spotify API request
   */
  public _saveTracks() {
    let uris: Array<string> = [];
    for(let track of this.tracks) {
      uris.push(track.uri);
    }

    return new Promise((resolve, reject) => {
      this.api.addTracksToPlaylist(this.userId, this.id, uris)
        .then((data: any) => {
          resolve(data);
        })
        .catch(() => {
          let err = new Error(`Could not save tracks for playlist: ${this.id}.`)
          reject(err);
        })
    })
  }
}


/**
 * Builder for PlaylistFactory singleton.
 * PlaylistFactory facilitates the creation of playlist objects by
 * injecting the Spotify API as a dependecy autmomatically.
 */
class PlaylistFactoryBuilder {

  /** Spotify REST client **/
  private client: any


  /**
   * Set the Spotify API client
   * @param {SpotifyAPI} client - the Spotify API REST client
   */
  public setClient(client: any) {
    this.client = client;
  }


  /**
   * Builds a Playlist instance with the given name and options.
   * @param {String} name - the name for the playlist.
   * @param {PlaylistOptions} options - the options for the new playlist
   * @returns {Playlist} a new instance of Playlist
   */
  public build(name: string, options: PlaylistOptions) {
    if(this.client == null) {
      throw new Error("Missing REST client. Call setClient first");
    }
    return new Playlist(name, options, this.client);
  }


  /**
   * Builds a playlist from the given URI
   * @param {String} uri - the Spotify URI for the new Playlist instance
   * @returns {Playlist} a new instance of Playlist for the URI
   */
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
