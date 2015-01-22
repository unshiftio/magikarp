'use strict';

require('../')
.create('foo', module)
  .post(function (req, res, next) {
    this.emit('post:foo', req, res, next);
  })
  .get(function (req, res, next) {
    this.emit('get:foo', req, res, next);
  })
.create('bar')
  .get(function (req, res, next) {
    this.emit('get:foo/bar', req, res, next);
  });
