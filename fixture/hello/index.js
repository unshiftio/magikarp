'use strict';

/* istanbul ignore next */
var hello = module.exports = require('../../').path('hello')
.get(function (req, res, next) {
  this.emit('get:hello', req, res, next);
});

/* istanbul ignore next */
hello.path('world')
.get(function (req, res, next) {
  this.emit('get:hello/world', req, res, next);
});
