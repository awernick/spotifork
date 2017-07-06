import "mocha";
import * as chai from "chai";
import * as promised from "chai-as-promised";
let API = require('../api');
chai.use(promised);
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

    it('should not authenticate calls with wrong accessToken', function() {
      api.setAccessToken(INVALID_ACCESS_TOKEN);
      return expect(api.getMe()).to.eventually.be.rejected;
    })

    it('should not authenticate calls with missing accessToken', function() {
      api.setAccessToken('');
      return expect(api.getMe()).to.eventually.be.rejected;
    })

    it('should authenticate calls with correct access token', function() {
      return expect(api.getMe()).to.eventually.be.fulfilled;
    })
  })
})
