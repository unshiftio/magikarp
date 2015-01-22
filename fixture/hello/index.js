'use strict';

module.exports = require('../../')
.create('hello')
  .get(function (req, res, next) {
    this.emit('get:hello', req, res, next);
  })
.create('world')
  .get(function (req, res, next) {
    this.emit('get:hello/world', req, res, next);
  });
