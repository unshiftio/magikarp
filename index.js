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
   * @param {Object} options Additional configuration.
   * @returns {Magikarp}
   * @api public
   */
  from: function from(directory, options) {
    var magikarp = this;

    options = options || {};
    options.nested = 'nested' in options ? options.nested : false;
    options.deep = 'deep' in options ? options.deep : true;

    fs.readdirSync(directory).forEach(function each(filename) {
      var app = path.join(directory, filename)
        , stat = fs.statSync(app)
        , dir = stat.isDirectory();

      if (dir) {
        if (options.nested) return magikarp.from(app, options);
        if (!options.deep) return;
      } else if ('.js' !== path.extname(app)) return;

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
    var pathname = req.url.slice(0, this.pathname.length)
      , url = req.url.slice(this.pathname.length);

    //
    // Fast case, we're not matching the root of this request so we can bail out
    // directly. The rest of the matching will be done by the fragments.
    //
    if (pathname !== this.pathname) {
      return next(), this;
    }

    req.originalUrl = req.url;
    req.url = url;

    this.each(req, res, function fourohfour(err, early) {
      req.url = req.originalUrl;

      next(err, early);
    });

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
