'use strict';

var dollars = require('dollars')
  , Supply = require('supply');

/**
 *
 * @constructor
 * @param {Fragment} and Previous fragment.
 * @param {Object} spec URL specification.
 * @api public
 */
function Fragment(and, spec) {
  if (!this) return new Fragment(and, spec);

  this.parsers = Object.create(null);
  this.specification = spec;
  this.endpoints = [];
  this.methods = [];
  this.and = and;
}

/**
 * Add a new method/function which will be called for the application.
 *
 * @param {Function} fn Callback function.
 * @returns {Fragment}
 * @api public
 */
dollars.array.each('get post put delete'.split(' '), function each(method) {
  Fragment.prototype[method] = function methodproxy(fn) {
    this.methods.push({ method: method, fn: fn });
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
 * Add a new argument/param parser.
 *
 * @param {String} name Name of the param that needs to be parsed.
 * @param {Function} parser The parser that needs to be called.
 * @returns {Fragment}
 * @api public
 */
Fragment.prototype.param = function param(name, parser) {
  this.parsers[name] = parser;
  return this;
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
 * Return a middleware layer which can be used for matching. In addition to that
 * we also optimize our internals because we can :D.
 *
 * @param {Magicarp} magicarp Reference to the margicarp instance.
 * @returns {Function}
 * @api public
 */
Fragment.prototype.matches = function matches(magicarp) {
  var frag = this
    , methods;

  if (Array.isArray(this.methods)) {
    methods = this.methods;

    this.methods = Object.create(null);
    methods.forEach(function methods(http) {
      if (!(http.method in frag.methods)) {
        frag.methods[http.method] = new Supply(magicarp);
      }

      frag.methods[http.method].use(http.fn);
    });
  }

  return function match(req, res, next) {
  };
};

//
// Expose the module.
//
module.exports = Fragment;
