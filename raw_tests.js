var assert = require('assert'),
    _s = require('underscore.string'),
    Post = require('./models/post'),
    wd = require('wd');

var exports = module.exports = function RawTests() {};

exports.allTests = function(conf, cap, capText) {

  var site = 'localhost:3000';
  var adminUser = 'admin';
  var adminPass = 'express';

  var login = function(u, p) {
    if (typeof u === 'undefined') {
      u = adminUser;
    }
    if (typeof p === 'undefined') {
      p = adminPass;
    }
    var url = 'http://' + u + ':' + p + '@' + site + '/post/add';
    return url;
  };

  var setUp = function(url, cb, name) {
    var driver = wd.remote(conf.host, conf.port, conf.username, conf.accessKey);
    if (typeof name !== 'undefined') {
      name = name.replace(capText, '');
      cap['name'] = name;
    }
    clearUrl = 'http://' + site + '/clear_all';
    driver.init(cap, function() {
      driver.setImplicitWaitTimeout(30, function() {
        //driver.get(clearUrl, function() {
          driver.get(url, function() {
            cb(driver);
          });
        //});
      });
    });
  };

  var navAndWritePost = function(title, body, cb, name) {
    setUp(login(), function(driver) {
      driver.elementByName('post[title]', function(err, el) {
        driver.type(el, title, function() {
          driver.elementByName('post[body]', function(err, el) {
            driver.type(el, body, function() {
              clickCreateButton(driver, cb);
            });
          });
        });
      });
    }, name);
  };

  var clickCreateButton = function(driver, cb) {
    driver.elementByCss('input[value="Create"]', function(err, el) {
      driver.clickElement(el, function() {
        cb(driver);
      });
    });
  };

  var navAndWritePostThenEdit = function(title, body, cb, name) {
    navAndWritePost(title, body, function(driver) {
      driver.elementByLinkText('Edit', function(err, el) {
        driver.clickElement(el, function() {
          cb(driver);
        });
      });
    }, name);
  };

  var checkForTextAndQuit = function(driver, text, cb) {
    driver.textPresent(text, 'body', function(err, present) {
      driver.quit(function() {
        cb(err, present);
      });
    });
  };

  var postFixture = {
    title: "My new entry",
    body: "This is so cool! I love writing",
    shortBody: "asdf"
  };

  var allTests = {
    'login with correct info gives new post page': {
      topic: function() {
        var cb = this.callback;
        setUp(login('admin', 'express'), function(driver) {
          checkForTextAndQuit(driver, "New Post", cb);
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'site has correct title': {
      topic: function() {
        var _this = this;
        setUp('http://' + site, function(driver) {
          driver.title(function(err, title) {
            driver.quit(function() {
              _this.callback(err, title);
            });
          });
        }, this.context.name);
      },
      '': function(err, title) {
        assert.equal(title, "Blog");
      }
    },

    // can't run this test now because of non-parallelism

    // 'logged in visit at first shows no posts': {
    //   topic: function() {
    //     var cb = this.callback;
    //     setUp('http://' + site, function(driver) {
    //       checkForTextAndQuit(driver, "It looks like you have no posts!", cb);
    //     }, this.context.name);
    //   },
    //   '': function(err, present) {
    //     assert.ok(present);
    //   }
    // },

    'adding a valid entry redirects to entry page': {
      topic: function() {
        var cb = this.callback;
        navAndWritePost(postFixture.title, postFixture.body, function(driver) {
          driver.url(function(err, url) {
            driver.quit(function() {
              cb(err, url);
            });
          });
        }, this.context.name);
      },
      'to entry page': function(err, url) {
        assert.ok(url.search(/\/post\/\d/) > -1);
      }
    },

    'adding a valid entry shows entry title': {
      topic: function() {
        var cb = this.callback;
        navAndWritePost(postFixture.title, postFixture.body, function(driver) {
          checkForTextAndQuit(driver, postFixture.title, cb);
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'adding a valid entry shows entry text': {
      topic: function() {
        var cb = this.callback;
        navAndWritePost(postFixture.title, postFixture.body, function(driver) {
          checkForTextAndQuit(driver, postFixture.body, cb);
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'adding a valid entry shows success': {
      topic: function() {
        var cb = this.callback;
        var msg = "Successfully created the post.";
        navAndWritePost(postFixture.title, postFixture.body, function(driver) {
          checkForTextAndQuit(driver, msg, cb);
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'adding a valid entry when back to main page shows title': {
      topic: function() {
        var title = postFixture.title + " " + Math.random().toString();
        var body = postFixture.body + " " + Math.random().toString();
        var cb = this.callback;
        navAndWritePost(title, body, function(driver) {
          driver.get('http://' + site, function() {
            driver.refresh(function() {
              checkForTextAndQuit(driver, title, cb);
            });
          });
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'adding valid entry when back to main page shows body': {
      topic: function() {
        var title = postFixture.title + " " + Math.random().toString();
        var body = postFixture.body + " " + Math.random().toString();
        var cb = this.callback;
        navAndWritePost(title, body, function(driver) {
          driver.get('http://' + site, function() {
            checkForTextAndQuit(driver, body, cb);
          });
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'adding entry with no title shows error': {
      topic: function() {
        var cb = this.callback;
        var msg = "title required";
        navAndWritePost('', postFixture.body, function(driver) {
          checkForTextAndQuit(driver, msg, cb);
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'adding entry with no body shows error': {
      topic: function() {
        var msg = "body required";
        var cb = this.callback;
        navAndWritePost(postFixture.title, '', function(driver) {
          checkForTextAndQuit(driver, msg, cb);
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'adding entry with short body shows error': {
      topic: function() {
        var msg = "body should be at least 10 characters long";
        var cb = this.callback;
        navAndWritePost(postFixture.title, postFixture.shortBody, function(driver) {
          checkForTextAndQuit(driver, msg, cb);
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    },

    'viewing edit post shows correct title': {
      topic: function() {
        var cb = this.callback;
        navAndWritePostThenEdit(postFixture.title, postFixture.body, function(driver) {
          driver.elementByName('post[title]', function(err, el) {
            driver.getValue(el, function(err, value) {
              driver.quit(function() {
                cb(err, value);
              });
            });
          });
        }, this.context.name);
      },
      '': function(err, title) {
        assert.equal(title, postFixture.title);
      }
    },

    'viewing edit post shows correct body': {
      topic: function() {
        var cb = this.callback;
        navAndWritePostThenEdit(postFixture.title, postFixture.body, function(driver) {
          driver.elementByName('post[body]', function(err, el) {
            driver.getValue(el, function(err, value) {
              driver.quit(function() {
                cb(err, value);
              });
            });
          });
        }, this.context.name);
      },
      '': function(err, body) {
        assert.equal(body, postFixture.body);
      }
    },

    'editing post title shows new title': {
      topic: function() {
        var cb = this.callback;
        var newTitle = 'This is a sweet new title';
        navAndWritePostThenEdit(postFixture.title, postFixture.body, function(driver) {
          driver.elementByName('post[title]', function(err, el) {
            driver.clear(el, function() {
              driver.type(el, newTitle, function() {
                clickCreateButton(driver, function(driver) {
                  driver.elementByName('post[title]', function(err, el) {
                    driver.getValue(el, function(err, value) {
                      driver.quit(function() {
                        cb(err, newTitle, value);
                      });
                    });
                  });
                });
              });
            });
          });
        }, this.context.name);
      },
      '': function(err, expected, value) {
        assert.equal(expected, value);
      }
    },

    'editing post body shows new body': {
      topic: function() {
        var cb = this.callback;
        var newBody = 'This is a sweet new body';
        navAndWritePostThenEdit(postFixture.title, postFixture.body, function(driver) {
          driver.elementByName('post[body]', function(err, el) {
            driver.clear(el, function() {
              driver.type(el, newBody, function() {
                clickCreateButton(driver, function(driver) {
                  driver.elementByName('post[body]', function(err, el) {
                    driver.getValue(el, function(err, value) {
                      driver.quit(function() {
                        cb(err, newBody, value);
                      });
                    });
                  });
                });
              });
            });
          });
        }, this.context.name);
      },
      '': function(err, expected, value) {
        assert.equal(expected, value);
      }
    },

    'clicking view full link shows post modal': {
      topic: function() {
        var cb = this.callback;
        var title = postFixture.title + " " + Math.random().toString();
        var body = postFixture.body + " " + Math.random().toString();
        navAndWritePost(title, body, function(driver) {
          driver.get('http://'+site, function() {
            driver.waitForElement('link text', title, 10, function(err) {
              driver.elementByLinkText(title, function(err, el) {
                driver.getAttribute(el, 'data-post-id', function(err, postId) {
                  var seeFullSel = 'seeFull_'+postId;
                  driver.elementById(seeFullSel, function(err, el) {
                    driver.clickElement(el, function(err) {
                      var fumSel = 'fullExcerptModal_'+postId;
                      driver.waitForVisible('id', fumSel, 10000, function(err) {
                        driver.quit(function() {
                          cb(err, typeof err == 'undefined');
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        }, this.context.name);
      },
      '': function(err, present) {
        assert.ok(present);
      }
    }

  };

  return allTests;
};
