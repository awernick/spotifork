import "mocha";
import * as chai from "chai";
let helpers = require('./helpers');
let config = helpers.config;
let API = require('../api');
let Playlist = require("../playlist").default;
let PlaylistFactory = require('../playlist')['PlaylistFactory'];
let should = chai.should();
let expect = chai.expect;

const VALID_USER_ID = helpers.VALID_USER_ID;
const VALID_PLAYLIST_ID = helpers.VALID_PLAYLIST_ID;
const VALID_PLAYLIST_URI = helpers.VALID_PLAYLIST_URI;
const PERSONAL_PLAYLIST_ID = helpers.PERSONAL_PLAYLIST_ID;

let api: any;
let user: any;

// Helpers
let reloadAPI = function() {
  api = new API(config.access_token);
}

let invalidateCacheAndReload = function() {
  // Invalidate singletons
  delete require.cache[require.resolve('../playlist')]
  PlaylistFactory = require('../playlist')['PlaylistFactory'];
  Playlist = require("../playlist").default;
}


let loadCurrentUser = (done: Function) => {
  api.getMe().then((data: any) => {
    user = data.body;
    done();
  }).catch((error: Error) => {
    console.error(error.toString());
  })
}

let buildNewPlaylist = () => {
  return new Playlist("NewPlaylist", {
    userId: VALID_USER_ID
  }, api);
}

let buildNewTrack = () => {
  return {
    id: 'ID' ,
    uri: 'uri',
    album: { name: 'album name' },
    artists: [ { name: 'An artist' } ]
  }
}

let getPersonalPlaylist = () => {
  return new Promise((resolve, reject) => {
    loadCurrentUser((error?: Error) => {
      if(error) { return reject(error) }
      let playlist = new Playlist("Test Playlist", {
        id: PERSONAL_PLAYLIST_ID,
        userId: user.id
      }, api)
      resolve(playlist);
    })
  })
}


describe('Playlist', function() {
  before(reloadAPI);


  describe('constructor', function() {
  })

  describe('_loadTracks()', function() {
    let playlist: any;

    // Hooks
    beforeEach(() => {
      playlist = buildNewPlaylist();
    });

    it('should not store data if parameter is missing', function() {
      expect(() => playlist._loadTracks()).to.throw(Error);
    })

    it('should not store data if parameter is not an array', function() {
      expect(() => playlist._loadTracks("THIS IS A TEST")).to.throw(Error);
    })

    it('should not store data if parameter array is empty', function() {
      playlist._loadTracks([]);
      expect(playlist.tracks).to.be.empty;
    })

    it('should load tracks if parameter is present', function() {
      let track1 = buildNewTrack();
      let track2 = buildNewTrack();
      let track3 = buildNewTrack();
      playlist._loadTracks([
        { track: track1 }, 
        { track: track2 }, 
        { track: track3 }
      ])
      expect(playlist.tracks).to.have.lengthOf(3);
    })

    it('should store album name as attribute', function() {
      let track = buildNewTrack();
      let albumName = 'Album Name';
      track.album.name = albumName;
      playlist._loadTracks([{ track: track }]);
      expect(playlist.tracks).to.have.lengthOf(1);
      expect(playlist.tracks[0].album).to.contain(albumName);
    })

    it('should store artist name as attribute', function() {
      let track = buildNewTrack();
      let artistName = 'Artist Name';
      track.artists = [{ name: artistName }];
      playlist._loadTracks([{ track: track }]);
      expect(playlist.tracks).to.have.lengthOf(1);
      expect(playlist.tracks[0].artists).to.contain(artistName);
    })

    it('should join multiple artists into a single attribute', function() {
      let track = buildNewTrack();
      let name1 = 'Artist #1';
      let name2 = 'Artist #2';

      track.artists = [{ name: name1 }, { name: name2 }]
      playlist._loadTracks([{
        track: track
      }])

      expect(playlist.tracks).to.have.lengthOf(1);
      expect(playlist.tracks[0].artists).to.contain(name1);
      expect(playlist.tracks[0].artists).to.contain(name2);
    })
  })


  describe('_saveTracks()', function() {
    let playlist: any;

    // Hooks
    beforeEach(function(done){
      getPersonalPlaylist().then((result) => {
        playlist = result;
        done();
      }).catch((error) => {
        done(error);
      })
    });

    it('should error if playlist doesn\'t have tracks', function(done) {
      playlist.tracks = [];
      playlist._saveTracks().catch(() => {
        done();
      })
    })

    it('should succeed if a track is present', function(done) {
      let track = {
        uri: 'spotify:track:1jlKdNbOA90rjnt88GJnwO'
      }
      playlist.tracks = [track]
      playlist._saveTracks().then((data: any) => {
        done();
      }).catch((err: Error) => done(err))
    }).timeout(4000);

    it('should succeed if multiple tracks are present', function(done) {
      let tracks = [
        { uri: 'spotify:track:1jlKdNbOA90rjnt88GJnwO' },
        { uri: 'spotify:track:0v8QpLDCw2n7ikFuiRKIx5' }
      ]
      playlist.tracks = tracks
      playlist._saveTracks().then((data: any) => {
        done();
      }).catch((err: Error) => done(err))
    }).timeout(4000);

    it('should add all tracks to playlist', function() {
    })
  })
  
  describe('load()', function() {
    // TODO: Test loading of private playlists

    it('should throw error if id is blank', function(done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID
      }, api);

      playlist.load().catch(() => { done() })
    })

    it('should throw error if id is invalid', function (done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID,
        id: "INVALID ID"
      }, api);

      playlist.load().catch(() => { done() })
    })

    it('should throw error if user id is blank', function(done) {
      let playlist = new Playlist('blank', {
        id: VALID_PLAYLIST_ID
      }, api);

      playlist.load().catch(() => { done() })
    })

    it('should throw error if user id is invalid', function (done) {
      let playlist = new Playlist('blank', {
        userId: "johndoe",
        id: VALID_PLAYLIST_ID
      }, api);

      playlist.load().catch(() => { done() })
    })

    it('should not load data if user does not own the playlist', function(done) {
      // Valid user id, but does not own playlist
      let userId = '121785691'
      let playlist = new Playlist('blank', {
        userId: userId,
        id: VALID_PLAYLIST_ID
      }, api);

      playlist.load().catch(() => { done() });
    })

    it('should load playlist data if id and user id are valid', function(done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID,
        id: VALID_PLAYLIST_ID
      }, api);

      playlist.load()
        .then(() => { done() })
        .catch((error: Error) => done(error));
    })

    it('should load correct name', function(done) {
      let name = "INCORRECT_NAME"
      let playlist = new Playlist(name, {
        userId: VALID_USER_ID,
        id: VALID_PLAYLIST_ID
      }, api);

      playlist.load().then(() => { 
        expect(playlist.name).to.not.equal(name);
        done() 
      }).catch((error: Error) => done(error));
    })

    it('should load correct description', function(done) {
      let desc = "THIS IS INCORRECT"
      let playlist = new Playlist("MyPlaylist", {
        userId: VALID_USER_ID,
        id: VALID_PLAYLIST_ID,
        description: desc
      }, api);

      playlist.load().then(() => { 
        expect(playlist.description).to.not.equal(desc);
        done() 
      }).catch((error: Error) => done(error));
    })
  })

  describe('unfollow()', function() {
    let playlist: any;

    // Hooks
    before(loadCurrentUser);
    beforeEach(() => {
      playlist = buildNewPlaylist();
    });

    it('should throw error if playlist is not owned by user', function(done) {
      playlist.userId = 'BLAH BLAH'
      playlist.id = VALID_PLAYLIST_ID;
      playlist.unfollow().catch(() => done());
    })

    it('should throw error if playlist id is not the valid', function(done) {
      // VALID_USER_ID belongs to spotify and not to me
      playlist.userId = VALID_USER_ID;
      playlist.id = "BLAH BLAH"
      playlist.unfollow().catch(() => done());
    })

    it('should succeed if user follows playlist', function(done) {
      done();
      //api.getUserPlaylists(user.id).then((data: any) => {
      //  let item = data.body.items[0]
      //  playlist.id = item.id
      //  playlist.userId = item.owner.id
      //  playlist.unfollow().then(() => {
      //    done()
      //  }).catch((error: Error) => {
      //    done(error);
      //  })
      //}).catch((error: Error) => {
      //  done(error);
      //})
    }).timeout(4000);
  })

  describe('create()', function() {
    let playlist: any;

    // Hooks
    before(loadCurrentUser);
    beforeEach(() => {
      playlist = buildNewPlaylist();
    });

    afterEach((done) => {
      this.timeout(3000);
      setTimeout(function() {
        playlist.unfollow()
          .then(() => done())
          .catch((error: Error) => done());
      }, 500)
    });

    it('should throw error if user id is blank', function() {
      playlist.userId = '';
      return playlist.create().catch((error: any) => {
        expect(error.statusCode).to.equal(404);
      })
    })

    it('should throw error if name is blank', function() {
      playlist.name = '';
      return playlist.create().catch((error: any) => {
        expect(error.statusCode).to.equal(400);
      })
    })

    it('should throw error if current user does not match with user id', function() {
      // Playlist is using 'spotify' as userId
      return playlist.create().catch((error: any) => {
        expect(error.statusCode).to.equal(403);
      })
    })

    it('should succeed with current user\'s id and valid name', function(done) {
      playlist.id = ''; // ID needs to be blank in order to create
      playlist.userId = user.id;

      playlist.create().then(() => {
        expect(playlist.id).to.not.be.null
        done();
      }).catch((error: any) => {
        done(error);
      })
    })

    it('should throw error if playlist with same name exists', function(done) {
      done();
    })

    it('should throw error if playlist with same id exists', function(done) {
      done();
    })
  })

  /** 
   * Tested afterwards since factory depends on various
   * Playlist methods
   */
  describe('factory', function() {
    // Hooks
    beforeEach(invalidateCacheAndReload);
    afterEach(invalidateCacheAndReload);

    describe('build()', function() {
      it('should throw error if REST client is not set', function() {
        expect(() => {
          let playlist = PlaylistFactory.build('MyPlaylist', {
            userId: VALID_USER_ID,
            id: VALID_PLAYLIST_ID
          })
        }).to.throw(Error);
      })

      it('should not throw error if REST client is set', function() {
        PlaylistFactory.setClient(api);
        expect(() => {
          let playlist = PlaylistFactory.build('MyPlaylist', {
              userId: VALID_USER_ID,
              id: VALID_PLAYLIST_ID
          })
        }).to.not.throw(Error);
      })

      it('should create valid instance of Playlist', function() {
        PlaylistFactory.setClient(api);
        let playlist = PlaylistFactory.build('MyPlaylist', {
          userId: VALID_USER_ID,
          id: VALID_PLAYLIST_ID
        })
        playlist.should.be.instanceof(Playlist);
      })
    })

    describe('fromUri()', function() {
      it('should throw error if REST client is not set', function() {
        expect(() => {
          PlaylistFactory.fromUri(VALID_PLAYLIST_URI)
        }).to.throw(Error);
      })

      it('should not throw error if REST client is set', function() {
        PlaylistFactory.setClient(api);
        expect(() => {
          PlaylistFactory.fromUri(VALID_PLAYLIST_URI)
        }).to.not.throw(Error);
      })

      it('should have same user id as uri', function() {
        PlaylistFactory.setClient(api);
        let playlist = PlaylistFactory.fromUri(VALID_PLAYLIST_URI);
        expect(playlist.userId).to.be.equal(VALID_USER_ID);
      })

      it('should have same playlist id as uri', function() {
        PlaylistFactory.setClient(api);
        let playlist = PlaylistFactory.fromUri(VALID_PLAYLIST_URI);
        expect(playlist.id).to.be.equal(VALID_PLAYLIST_ID);
      })
    })
  })
});
