'use strict';

var Application = require('./application')
  , dollars = require('dollars')
  , Supply = require('supply')
  , path = require('path')
  , url = require('url')
  , fs = require('fs');

/**
 * Magicarp: A PLBBBBTTT A-PLBBBBBTTT A-PLBBBBTTT A-PLBBBTTT A-PLBBT
 *
 * @constructor
 * @param {Mixed} context The `this` value for every application we execute.
 * @param {Object} options Additional configuration.
 * @api public
 */
var Magicarp = Supply.extend({
  /**
   * Initialize the module.
   *
   * @param {Object} options
   * @api private
   */
  initialize: function initialize(options) {
    this.pathname = options.pathname || '/';
  },

  /**
   * Load in API endpoints from a given directory.
   *
   * @param {String} directory The directory we should search.
   * @returns {Magicarp}
   * @api public
   */
  from: function from(directory) {
    var magicarp = this;

    dollars.array.each(fs.readdirSync(directory), function each(filename) {
      if (
           '.js' !== path.extname(filename)
        && !fs.statSync(filename).isDirectory()
      ) return /* It's not something that can be required. */;

      var application = require(path.join(directory, filename));
      magicarp.use(application.run(magicarp));
    });

    return magicarp;
  },

  /**
   * Attempt to find a middleware layer which can handle the request.
   *
   * @param {Request} req Incoming HTTP request.
   * @param {Response} res Outgoing HTTP response.
   * @param {Function} next Completion callback.
   * @returns {Magicarp}
   * @api public
   */
  run: function run(req, res, next) {
    req.uri = req.uri || url.parse(req.url);
    req.paths = req.uri.pathname.split('/');

    //
    // Fast case, we're not matching the root of this request so we can bail out
    // directly. The rest of the matching will be done by the fragments.
    //
    if (this.pathname !== req.paths[0]) return next();

    return this.each(req, res, next);
  }
});

/**
 * Application interface we implement for routing purposes.
 *
 * @type {Application}
 * @private
 */
Magicarp.Application = Application;

/**
 *
 * @param {Object} module Module API we should expose the fragment upon.
 * @returns {Fragment}
 * @api public
 */
Magicarp.create = function create(module,) {
  return module.exports = new Application();
};

//
// Expose the API.
//
module.exports = Magicarp;
