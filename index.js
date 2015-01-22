'use strict';

var Application = require('./application')
  , dollars = require('dollars')
  , Supply = require('supply')
  , path = require('path')
  , url = require('url')
  , fs = require('fs');

/**
 * Magikarp: A PLBBBBTTT A-PLBBBBBTTT A-PLBBBBTTT A-PLBBBTTT A-PLBBT
 *
 * @constructor
 * @param {Mixed} context The `this` value for every application we execute.
 * @param {Object} options Additional configuration.
 * @api public
 */
var Magikarp = Supply.extend({
  constructor: function constr(context, options) {
    if (!this) return new Magikarp(context, options);

    //
    // Initialize supply.
    //
    Supply.prototype.constructor.apply(this, arguments);
  },

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
   * @returns {Magikarp}
   * @api public
   */
  from: function from(directory) {
    var magikarp = this;

    dollars.each(fs.readdirSync(directory), function each(filename) {
      if (
           '.js' !== path.extname(filename)
        && !fs.statSync(filename).isDirectory()
      ) return /* It's not something that can be required. */;

      magikarp.add(require(path.join(directory, filename)));
    });

    return magikarp;
  },

  /**
   * Add a new application that still needs to be initialized.
   *
   * @param {Application} application The application we want to use.
   * @param {Magikarp}
   * @api public
   */
  add: function add(application) {
    return this.use(application.run(this));
  },

  /**
   * Attempt to find a middleware layer which can handle the request.
   *
   * @param {Request} req Incoming HTTP request.
   * @param {Response} res Outgoing HTTP response.
   * @param {Function} next Completion callback.
   * @returns {Magikarp}
   * @api public
   */
  run: function run(req, res, next) {
    req.uri = req.uri || url.parse(req.url);

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
 * @public
 */
Magikarp.Application = Application;

/**
 * Simple short hand to create a new Application.
 *
 * @param {String} name The name/path/URI of the application.
 * @param {Object} module Module API we should expose the fragment upon.
 * @returns {Application}
 * @api public
 */
Magikarp.create = function create(name, module) {
  if (module) return module.exports = new Application(name);
  return new Application(name);
};

//
// Expose the API.
//
module.exports = Magikarp;
