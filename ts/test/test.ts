import * as fs from "fs";
let helpers = require('./helpers');

describe('spotifork', function() {

  // Make sure config always has a valid access token
  before(function(done) {
    helpers.refreshConfig().then(() => {
      done();
    }).catch((error: Error) => {
      done(error);
    })
  })

  require('./test.api');
  require('./test.playlist');
  require('./test.forker');
  require('./test.cli');
})
