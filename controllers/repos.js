'use strict';
var views = require('co-views');
var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost/repodb');
var co = require('co');

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
  this.body = 'Done!';
};

module.exports.searchGithub = function * searchGithub(data, next){
  
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

