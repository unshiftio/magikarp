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
  var fragment = new Fragment(this, this.parse(url));

  if (this.and) this.and.endpoints.push(fragment);
  else this.endpoints.push(fragment);

  return fragment;
};

/**
 * Transform an URL to an regular expression we can use for testing.
 *
 * @param {String} url The URL we need to parse.
 * @returns {RegularExpression}
 * @api public
 */
Fragment.prototype.parse = function parse(url) {
  if (url.charAt(url.length - 1) === '/') url = url.slice(0, -1);
  if (url.charAt(0) === '/') url = url.slice(1);

  return new RegExp('^' + dollars.array.map(url.split('/'), function each(frag) {
    return frag.replace(/\{([^\{]+?)\}/g, function replace(match, key) {
      return '([a-zA-Z0-9-_~\\.%]+)';
    });
  }).join('\\/') + '$');
};

