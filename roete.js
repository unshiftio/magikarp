'use strict';

/**
 * Roete (Route) matching.
 *
 * @constructor
 * @param {String} url URL we should trigger upon.
 * @api public
 */
function Roete(url) {
  if (!this) return new Roete(url);

  this._parsers = {};    // Parameter parsers.
  this._methods = {};    // HTTP methods we handle.
  this._params = [];     // Name of the parsers.
  this._path = null;     // The compiled Regular Expression.

  if (url) this.parse(url);
}

/**
 * Add a new parameter parser.
 *
 * @param {String} name Name of the param that we should parse.
 * @param {Function} fn Parser method.
 * @returns {Roete}
 * @api public
 */
Roete.prototype.param = function param(name, fn) {
  this._parsers[name] = fn;

  return this;
};

/**
 * Transform a given URL to a regular expression so we can match against
 * incoming URL's.
 *
 * @param {String} url The URL or Regular-like-Expression we should match.
 * @returns {Roete}
 * @api public
 */
Roete.prototype.parse = function parse(url) {
  if (url.charAt(url.length - 1) === '/') url = url.slice(0, -1);
  if (url.charAt(0) === '/') url = url.slice(1);
  url = url.split('/');

  var roete = this
    , slash = '\\/';

  //
  // Transform the {} placeholders to an all capturing regular expression so we
  // can start capturing parameters.
  //
  url = url.map(function each(frag) {
    return frag.replace(/\{([^\{]+?)\}/g, function replace(match, key) {
      roete._params.push(key);

      return '([a-zA-Z0-9-_~\\.%]+)';
    });
  });

  roete._path = new RegExp('^'+ slash + url.join(slash) + slash);

  return roete;
};

/**
 * Check if the route is matching the given URL.
 *
 * @param {String} url Pathname we need to match.
 * @param {String} method HTTP method we accept.
 * @returns {String|Undefined} Matches URL.
 * @api public
 */
Roete.prototype.match = function matching(url, method) {
  if (url.charAt(url.length - 1) !== '/') url = url +'/';
  if (url.charAt(0) !== '/') url = '/'+ url;

  var slices = this._path.exec(url)
    , roete = this
    , match;

  if (slices) match = new Match(slices, url, roete._methods[method]);
  if (!slices || slices.length === 1) return match;

  return slices.slice(1).reduce(function reduce(memo, arg, index) {
    var param = roete._params[index];

    match.params[param] = roete._parsers[param]
    ? roete._parsers[param](arg)
    : arg;

    return match;
  }, match);
};

/**
 * Representation of a matched route.
 *
 * @constructor
 * @param {Array} slices The matches from the Roete RegExp.
 * @param {String} url The URL that we matched.
 * @api private
 */
function Match(slices, url, method) {
  this.url = url.slice(slices[0].length);
  this.match = slices[0];
  this.matches = slices;
  this.method = method;
  this.params = {};
}

//
// Expose the interface.
//
Roete.Match = Match;
module.exports = Roete;
