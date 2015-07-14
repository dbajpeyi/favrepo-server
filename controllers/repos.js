'use strict';
var views = require('co-views');
var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost/repodb');
var co = require('co');
var request = require('koa-request');
var repos = wrap(db.get('repos'));

// From lifeofjs
co(function * () {
  var repos = yield repos.find({});
});


module.exports.all = function * all(next) {
  console.log('test');
  if ('GET' != this.method) return yield next;
  this.body = yield repos.find({});
};

module.exports.search = function * search(name, next){
  if('GET'!=this.method) return yield next;
  
  var options = {
    url : 'https://api.github.com/search/repositories?q=' + name + '&sort=stars',
    headers: {
      'User-Agent': 'repoApp',
      'Content-Type' : 'application/json'
    }
  }
  var result = yield request(options); 
  var test = JSON.parse(result.body);
  this.body = test;
};

module.exports.fetch = function * fetch(id,next) {
  if ('GET' != this.method) return yield next;
  // Quick hack.
  if(id === ""+parseInt(id, 10)){
    var repo = yield repos.find({}, {
      'skip': id - 1,
      'limit': 1
    });
    if (repo.length === 0) {
      this.throw(404, 'repo with id = ' + id + ' was not found');
    }
    this.body = yield repo;
  }

};

module.exports.add = function * add(data,next) {
  if ('POST' != this.method) return yield next;
  var repo = yield parse(this, {
    limit: '1kb'
  });
  var inserted = yield repos.insert(repo);
  if (!inserted) {
    this.throw(405, "The repo couldn't be added.");
  }
  this.body = yield repo;
};



module.exports.remove = function * remove(id,next) {
  if ('DELETE' != this.method) return yield next;

  var repo = yield repos.find({}, {
    'skip': id - 1,
    'limit': 1
  });

  if (repo.length === 0) {
    this.throw(404, 'repo with id = ' + id + ' was not found');
  }

  var removed = repos.remove(repo[0]);

  if (!removed) {
    this.throw(405, "Unable to delete.");
  } else {
    this.body = "Done";
  }

};

module.exports.head = function *(){
  return;
};

module.exports.options = function *() {
  this.body = "Allow: HEAD,GET,PUT,DELETE,OPTIONS";
};

