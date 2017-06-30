import "mocha";
import * as chai from "chai";
let API = require('../api');
let should = chai.should();
let expect = chai.expect;
let config = require('./helpers').config;
let SpotifyAPI = require('spotify-web-api-node');

const INVALID_ACCESS_TOKEN = "RANDOM_ACCESS_TOKEN";
const VALID_ACCESS_TOKEN = config.access_token;

describe('API', function() {

  describe('initialization', function() {
    it('should throw error if access token is not provided', function (){
      expect(() => {
        new API()
      }).to.throw(Error);
    });

    it('should not throw error if access token is provided', function () {
      expect(() => {
        new API(VALID_ACCESS_TOKEN);
      }).to.not.throw(Error);
    })

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

    it('should authenticate calls with correct access token', function(done) {
      api.getMe().then((data: any) => {
        done();
      }).catch((error: Error) => console.log(error));
    })
  })
})
