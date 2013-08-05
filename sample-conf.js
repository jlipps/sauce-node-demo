var webdriver = require('wd'),
    exports = module.exports = {},
    host = "ondemand.saucelabs.com",
    port = 80,
    username = process.env.SAUCE_USERNAME,
    accessKey = process.env.SAUCE_ACCESS_KEY,
    browser = exports.browser = webdriver.remote(host, port, username, accessKey),
    desired = exports.desired = {
      "browserName": "chrome",
      "version"    : "",
      "platform"   : "Linux",
      "tags"       : ["sauce-node-demo", "test"],
      "name"       : "Sauce Node Demo",
      "build"      : "dev-tests"
    };

browser.on("status", function(info) {
  //console.log("\x1b[36m%s\x1b[0m", info);
});

browser.on("command", function(meth, path, data) {
  //console.log(" > \x1b[33m%s\x1b[0m: %s", meth, path, data || "");
});

/**
Vows Errored » callback not fired
http://birkett.no/blog/2013/05/01/vows-errored-callback-not-fired/
*/
process.on('uncaughtException', function(err) {
  browser.quit();
  console.log('Caught exception: ' + err );
});
