'use strict';
var repos = require('./controllers/repos');
var compress = require('koa-compress');
var logger = require('koa-logger');
var serve = require('koa-static');
var route = require('koa-route');
var koa = require('koa');
var path = require('path');
var app = module.exports = koa();
var cors = require('koa-cors');

app.use(cors());

// Logger
app.use(logger());

app.use(route.get('/repos/', repos.all));
app.use(route.post('/repos/', repos.add));
app.use(route.delete('/repos/:id', repos.remove));
app.use(route.delete('/search/:name', repos.searchGithub));


// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(1337);
  console.log('listening on port 1337');
}
