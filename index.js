'use strict';

var Application = require('./application')
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
  //
  // Required to make construction without `new` keyword possible.
  //
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
   * @param {Object} options Additional configuration
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

    fs.readdirSync(directory).forEach(function each(filename) {
      var app = path.join(directory, filename);

      if (
           '.js' !== path.extname(app)
        && !fs.statSync(app).isDirectory()
      ) return /* It's not something that can be required. */;

      magikarp.add(require(app));
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
    this.use(application.run(this.provider));
    return this;
  },

  /**
   * Create a new application that is added automatically to the magikarp
   * instance.
   *
   * @param {String} name The name/path/URI of the application.
   * @returns {Application}
   * @api public
   */
  path: function path(name) {
    var application = new Application(name);

    this.add(application);
    return application;
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
    //
    // Fast case, we're not matching the root of this request so we can bail out
    // directly. The rest of the matching will be done by the fragments.
    //
    if (req.url.indexOf(this.pathname) !== 0) {
      return next(), this;
    }

    this.each(req, res, next);
    return this;
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
 * Simple short hand to mount a new Application.
 *
 * @param {String} name The name/path/URI of the application.
 * @param {Object} module Module API we should expose the fragment upon.
 * @returns {Application}
 * @api public
 */
Magikarp.path = function path(name, module) {
  var app = new Application(name);

  if (!module) return app;

  module.exports = app;
  return app;
};

//
// Expose the API.
//
module.exports = Magikarp;
