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
const VALID_PLAYLIST_URI = `${VALID_USER_ID}:playlist:${VALID_PLAYLIST_ID}`;


let api: any;
let loadAPI = function(done: Function) {
  // Reload API
  API({
    accessToken: config.access_token,
    refreshToken: config.refresh_token
  }).then((client: any) => {
    api = client;
    done();
  }).catch((error: Error) => {
    console.log(error.toString());
  });
}

describe('Playlist', function() {
  before(loadAPI);

  describe('constructor', function() {
  })

  describe('factory', function() {

    let invalidateCacheAndReload = function() {
      // Invalidate singletons
      delete require.cache[require.resolve('../playlist')]
      PlaylistFactory = require('../playlist')['PlaylistFactory'];
      Playlist = require("../playlist").default;
    }

    beforeEach(invalidateCacheAndReload);
    afterEach(invalidateCacheAndReload);

    describe('create()', function() {
      it('should throw error if REST client is not set', function() {
        expect(() => {
          let playlist = PlaylistFactory.create('MyPlaylist', {
            userId: VALID_USER_ID,
            id: VALID_PLAYLIST_ID
          })
        }).to.throw(Error);
      })

      it('should not throw error if REST client is set', function() {
        PlaylistFactory.setClient(api);
        expect(() => {
          let playlist = PlaylistFactory.create('MyPlaylist', {
              userId: VALID_USER_ID,
              id: VALID_PLAYLIST_ID
          })
        }).to.not.throw(Error);
      })

      it('should create valid instance of Playlist', function() {
        PlaylistFactory.setClient(api);
        let playlist = PlaylistFactory.create('MyPlaylist', {
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
    })
  })
  
  describe('load()', function() {
    it('should throw error if id is invalid', function (done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID,
        id: "INVALID ID"
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

    it('should load playlist data if id and user id are valid', function(done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID,
        id: VALID_PLAYLIST_ID
      }, api);
      playlist.load().then(() => { done() });
    })

    it('should not load data if user does not own a playlist with the specified id', function(done) {
      // Valid user id, but does not own playlist
      let userId = '121785691'
      let playlist = new Playlist('blank', {
        userId: userId,
        id: VALID_PLAYLIST_ID
      }, api);
      playlist.load().catch(() => { done() });
    })
  })

  describe('fromUri()', function() {
  })
});

describe('PlaylistFactory', function() {
})
