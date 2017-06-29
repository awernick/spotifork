import "mocha";
import * as chai from "chai";
let config = require('./helpers').config;
let api = require('../api')(config.access_token);
import Playlist from "../playlist";
let should = chai.should();
let expect = chai.expect;

const VALID_USER_ID = 'spotify';
const VALID_PLAYLIST_ID = '37i9dQZF1DXdgz8ZB7c2CP';

describe('Playlist', function() {
  describe('constructor', function() {
  })
  
  describe('load()', function() {
    it('should throw error if id is invalid', function (done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID,
        id: "INVALID ID"
      });
      playlist.load().catch(done)
    })

    it('should throw error if user id is invalid', function (done) {
      let playlist = new Playlist('blank', {
        userId: "johndoe",
        id: VALID_PLAYLIST_ID
      });
      playlist.load().catch(done)
    })

    it('should load playlist data if id and user id are valid', function(done) {
      let playlist = new Playlist('blank', {
        userId: VALID_USER_ID,
        id: VALID_PLAYLIST_ID
      });
      playlist.load().then(done);
    })
  })

  describe('fromUri()', function() {

  })
});
