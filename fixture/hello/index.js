'use strict';

/* istanbul ignore next */
var hello = module.exports = require('../../').mount('hello')
.get(function (req, res, next) {
  this.emit('get:hello', req, res, next);
});

/* istanbul ignore next */
hello.mount('world')
.get(function (req, res, next) {
  this.emit('get:hello/world', req, res, next);
});
