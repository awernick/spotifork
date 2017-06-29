import "mocha";
import * as chai from "chai";
let API = require('../api');
let should = chai.should();
let expect = chai.expect;
let config = require('./helpers').config;

const INVALID_ACCESS_TOKEN = "RANDOM_ACCESS_TOKEN";
const VALID_ACCESS_TOKEN = config.access_token;

describe('API Singleton', function() {

  describe('initialization', function() {
    it('should throw error if access token is not provided on first call', function (done){
      API().catch(() => {
        done();
      });
    });

    it('should not throw error if access token is provided', function (done) {
      API({
        accessToken: config.access_token,
        refreshToken: config.refresh_token
      }).then(() => {
        done();
      }).catch((error: Error) => {
        console.log(error.toString());
      })
    }).timeout(6000);

    it('should be an instance of SpotifyAPI', function() {
      API({
        accessToken: config.access_token,
        refreshToken: config.refresh_token
      }).then((api: any) => {
        api.should.be.instanceof(SpotifyAPI);
      }).catch(() => {})
    })
  })

  describe('authentication', function() {
    let api: any;

    beforeEach(function(done) {
      API({
        accessToken: config.access_token,
        refreshToken: config.refresh_token
      }).then((client: any) => {
        api = client;
        done();
      }).catch((error: Error) => { 
        console.log(error.toString()) 
      })
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
      })
    })
  })
})
