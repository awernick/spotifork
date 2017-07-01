import "mocha";
import * as chai from "chai";
let API = require('../api');
let should = chai.should();
let expect = chai.expect;
let config = require('./helpers').config;
let SpotifyAPI = require('spotify-web-api-node');

let INVALID_ACCESS_TOKEN = "RANDOM_ACCESS_TOKEN";
let VALID_ACCESS_TOKEN = config.access_token;

describe('API', function() {

  describe('initialization', function() {
    it('should be an instance of SpotifyAPI', function() {
      let api = new API(VALID_ACCESS_TOKEN);
      api.should.be.instanceof(SpotifyAPI);
    })
  })

  describe('authentication', function() {
    let api: any;

    beforeEach(function() {
      api = new API(VALID_ACCESS_TOKEN);
    });

    it('should not authenticate calls with wrong accessToken', function(done) {
      api.setAccessToken(INVALID_ACCESS_TOKEN);
      api.getMe().catch((error: Error) => {
        done();
      })
    })

    it('should not authenticate calls with missing accessToken', function(done) {
      api.setAccessToken('');
      api.getMe().catch((error: Error) => {
        done();
      })
    })

    it('should authenticate calls with correct access token', function(done) {
      api.getMe().then((data: any) => {
        done();
      }).catch((error: Error) => console.log(error));
    })
  })
})
