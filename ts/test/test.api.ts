import "mocha";
import * as chai from "chai";
let SpotifyAPI = require('spotify-web-api-node');
let should = chai.should();
let expect = chai.expect;
let config = require('./helpers').config;

const INVALID_ACCESS_TOKEN = "RANDOM_ACCESS_TOKEN";
const VALID_ACCESS_TOKEN = config.access_token;

describe('API Singleton', function() {
  beforeEach(function () {
    delete require.cache[require.resolve('../api')];
  })

  describe('initialization', function() {
    it('should throw error if access token is not provided on first call', function (){
      expect(require('../api')).to.throw(Error);
    });

    it('should not throw error if access token is provided', function () {
      expect(() => {
        require('../api')(INVALID_ACCESS_TOKEN)
      }).to.not.throw(Error);
    })

    it('should be an instance of SpotifyAPI', function() {
      let api = require('../api')(INVALID_ACCESS_TOKEN);
      api.should.be.instanceof(SpotifyAPI);
    })
  })

  describe('authentication', function() {
    it('should not authenticate calls with wrong accessToken', function(done) {
      let api = require('../api')(INVALID_ACCESS_TOKEN);
      api.getMe().catch((error: Error) => {
        done();
      })
    })

    it('should authenticate calls with correct access token', function(done) {
      let api = require('../api')(VALID_ACCESS_TOKEN);
      api.getMe().then((data: any) => {
        done();
      })
    })
  })
})
