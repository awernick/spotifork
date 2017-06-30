import * as fs from "fs";
let helpers = require('./helpers');

describe('Spotifork', function() {
  before(function(done) {
    helpers.refreshConfig().then(() => {
      done();
    }).catch((error: Error) => {
      done(error);
    })
  })

  require('./test.api');
  require('./test.playlist');
})
