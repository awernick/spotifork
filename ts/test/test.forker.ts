import "mocha";
import * as chai from "chai";
import Forker from "../forker";
import Playlist, { PlaylistFactory } from "../playlist";

let helpers = require('./helpers');
let config = helpers.config;
let API = require('../api');
let should = chai.should();
let expect = chai.expect;

let forker: Forker;
let playlist: Playlist | null;
let VALID_PLAYLIST_URI = helpers.VALID_PLAYLIST_URI;

describe('Forker', function() {

  before(function() {
    let api = new API(config.access_token);
    PlaylistFactory.setClient(api);
  })

  beforeEach(function() {
    forker = new Forker({
      visible: true,
      accessToken: config.access_token
    })
  })


  describe('fork()', function() {
    beforeEach(function() {
      playlist = null;
    })

    // Make sure to remove any forks we created
    afterEach(function(done) {
      if(playlist) {
        playlist.unfollow()
          .then(() => done())
          .catch((err: Error) => done(err));
      } else {
        done();
      }
    })

    it('should throw error if API is not authenticated', function(done) {
      forker = new Forker({
        visible: true,
        accessToken: 'INVALID'
      })

      forker.fork(VALID_PLAYLIST_URI)
        .catch(() => done())
    })

    it('should throw error if uri is invalid', function(done) {
      forker.fork('INVALID')
        .catch(() => done())
    })

    it('should succeed if API is authenticated and URI is valid', function(done) {
      forker.fork(VALID_PLAYLIST_URI)
        .then((fork: Playlist) => {
          playlist = fork;
          done()
        })
        .catch((err) => done(err))
    })

    it('should return a playlist with a valid id if succesful', function(done) {
      forker.fork(VALID_PLAYLIST_URI)
        .then((fork: Playlist) => {
          expect(fork).to.be.instanceof(Playlist)
          playlist = fork;
          done();
        })
        .catch((err: Error) => done(err))
    }).timeout(3000);

    it('should create a fork with the same tracks as the original', function(done) {
      let og_playlist = PlaylistFactory.fromUri(VALID_PLAYLIST_URI);

      // Load tracks
      og_playlist.load()

        // Create fork
        .then(() => { return forker.fork(VALID_PLAYLIST_URI) })

        // Compare tracks
        .then((fork: Playlist) => {
          expect(fork.tracks).to.eql(og_playlist.tracks);
          playlist = fork;
          done();
        })
        
        // Catch errors
        .catch((err: Error) => done(err));
    })
  })
})
