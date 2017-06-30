import "mocha";
import * as chai from "chai";
let config = require('./helpers').config;
let API = require('../api');
let Playlist = require("../playlist").default;
let PlaylistFactory = require('../playlist')['PlaylistFactory'];
let should = chai.should();
let expect = chai.expect;

const VALID_USER_ID = 'spotify';
const VALID_PLAYLIST_ID = '37i9dQZF1DXdgz8ZB7c2CP';
const VALID_PLAYLIST_URI = 
`spotify:user:${VALID_USER_ID}:playlist:${VALID_PLAYLIST_ID}`;

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
    user = data;
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


describe('Playlist', function() {
  before(reloadAPI);

  describe('constructor', function() {
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

      playlist.load().then(() => { done() });
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
      });
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
      });
    })
  })

  describe('create()', function() {
    let playlist: any;

    // Hooks
    before(loadCurrentUser);
    beforeEach(() => {
      playlist = buildNewPlaylist();
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
      api.getMe().then((data: any) => {
        playlist.userId = data.body.id;
        console.log(playlist.userId);
        console.log(playlist.name);
        playlist.create().then(() => {
          expect(playlist.id).to.not.be.null
          done();
        }).catch((error: any) => {
          throw error;
        })
      }).catch((error: any) => {
        throw error;
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
