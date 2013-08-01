var vows    = require('vows'),
    assert  = require('assert'),
    config  = require('./sample-conf.js'),
    browser = config.browser;

//Create a Test Suite
vows.describe("An example")
.addBatch({
  "Init browser": {
    topic: function() {
      browser.init(config.desired, this.callback);
    },
    "Opening the page": {
      topic: function() {
        browser.get("http://saucelabs.com/test/guinea-pig", this.callback);
      },
      "Page title": {
        topic: function() {
          browser.title(this.callback);
        },
        "The page title should be 'I am a page title - Sauce Labs'": function (title) {
          assert.ok( title.indexOf('I am a page title - Sauce Labs') >= 0 );
        }
      }
    }
  }
}).addBatch({
  "Exiting the browser": {
    topic: function() {
      browser.quit(this.callback);
    },
    "The end": function () {

    }
  }
}).export(module);
