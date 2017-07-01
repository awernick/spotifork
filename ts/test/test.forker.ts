import "mocha";
import * as chai from "chai";
import Forker from "../forker";

let helpers = require('./helpers');
let config = helpers.config;
let API = require('../api');
let Playlist = require("../playlist").default;
let PlaylistFactory = require('../playlist')['PlaylistFactory'];
let should = chai.should();
let expect = chai.expect;

let forker: Forker;
let VALID_PLAYLIST_URI = helpers.VALID_PLAYLIST_URI;

describe('Forker', function() {

  beforeEach(function() {
    forker = new Forker({
      visible: true,
      accessToken: config.access_token
    })
  })

  describe('fork()', function() {
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
        .then(() => done())
        .catch((err) => done(err))
    })

    it('should create a fork with the same tracks as the original', function() {
    })

    it('should create a fork with the same name as the original', function() {
    })
  })
})
