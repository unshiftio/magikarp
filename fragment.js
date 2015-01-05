'use strict';

var dollars = require('dollars')
  , Supply = require('supply');

/**
 *
 * @constructor
 * @param {Fragment} and Previous fragment.
 * @param {RegularExpression} regexp Fragment we need to match.
 * @api public
 */
function Fragment(and, regexp) {
  if (!this) return new Fragment();

  this.regexp = regexp;
  this.endpoints = [];
  this.methods = {};
  this.and = and;
}

/**
 *
 * @param {Function} fn
 * @returns {Fragment}
 * @api public
 */
dollars.array.each('get post put delete'.split(' '), function each(method) {
  Fragment.prototype[method] = function methodproxy(fn) {
    if (!(method in this.methods)) {
      this.methods[method] = new Supply();
    }
    return this;
  };
});

/**
 *
 * @param {String} url URL we mount upon.
 * @returns {Fragment} The new fragment Application.
 * @api public
 */
Fragment.prototype.endpoint = function endpoint(url) {
  var frag = new Fragment(this, this.parse(url));

  if (this.and) this.and.endpoints.push(frag);
  else this.endpoints.push(frag);

  return frag;
};

/**
 * Transform an URL to an regular expression we can use for testing.
 *
 * @param {String} url The URL we need to parse.
 * @returns {Object} Specification.
 * @api public
 */
Fragment.prototype.parse = function parse(url) {
  if (url.charAt(url.length - 1) === '/') url = url.slice(0, -1);
  if (url.charAt(0) === '/') url = url.slice(1);
  url = url.split('/');

  var spec = Object.create(null);

  spec.path = new RegExp('^' + dollars.array.map(url, function each(frag) {
    return frag.replace(/\{([^\{]+?)\}/g, function replace(match, key) {
      if (!spec.params) spec.params = [];

      spec.params.push(key);
      return '([a-zA-Z0-9-_~\\.%]+)';
    });
  }).join('\\/') + '$');

  return spec;
};

/**
 * Return a middleware layer which can be used for matching.
 *
 * @param {Magicarp} magicarp Reference to margicarp
 * @returns {Function}
 * @api public
 */
Fragment.prototype.matches = function matches(magicarp) {
  var frag = this;

  return function match(req, res, next) {

  };
};

//
// Expose the module.
//
module.exports = Fragment;
