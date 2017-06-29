import "mocha";
import * as chai from "chai";
let config = require('./helpers').config;
let api = require('../api')(config.access_token, config.refreshToken);
import Playlist, { PlaylistFactory } from "../playlist";
let should = chai.should();
let expect = chai.expect;

const VALID_USER_ID = 'spotify';
const VALID_PLAYLIST_ID = '37i9dQZF1DXdgz8ZB7c2CP';


describe('Playlist', function() {
  beforeEach(function() {
  })

  describe('constructor', function() {
  })

  describe('factory', function() {
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
  
  describe('load()', function() {
    it('should throw error if id is invalid', function (done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID,
        id: "INVALID ID"
      }, api);
      playlist.load().catch(done)
    })

    it('should throw error if user id is invalid', function (done) {
      let playlist = new Playlist('blank', {
        userId: "johndoe",
        id: VALID_PLAYLIST_ID
      }, api);
      playlist.load().catch(done)
    })

    it('should load playlist data if id and user id are valid', function(done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID,
        id: VALID_PLAYLIST_ID
      }, api);
      playlist.load().then(done);
    })

    it('should not load data if user does not own a playlist with the specified id', function(done) {
      // Valid user id, but does not own playlist
      let userId = '121785691'
      let playlist = new Playlist('blank', {
        userId: userId,
        id: VALID_PLAYLIST_ID
      }, api);
      playlist.load().catch(done);
    })
  })

  describe('fromUri()', function() {
  })
});

describe('PlaylistFactory', function() {
})
