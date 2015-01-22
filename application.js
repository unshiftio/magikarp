'use strict';

var dollars = require('dollars')
  , Roete = require('./roete')
  , Supply = require('supply');

/**
 *
 * @constructor
 * @param {String} name The pathname/namespace/URL that we should mount upon.
 * @api public
 */
function Application(name) {
  if (!this) return new Application(name);

  Roete.call(this, name);         // Inherit from route.
  this.sub = [];                  // Extra applications.
}

Application.prototype = new Roete();
Application.prototype.constructor = Application;

/**
 * Add a new method/function which will be called for the application.
 *
 * @param {Function} fn Callback function.
 * @returns {Fragment}
 * @api public
 */
dollars.each('GET POST PUT DELETE'.split(' '), function each(method) {
  var application = Application.prototype;

  application[method] = application[method.toLowerCase()] = function proxy(fn) {
    this.methods.push({
      method: method,
      fn: fn
    });

    return this;
  };
});

/**
 * Directly pass in an existing Application instance and use that.
 *
 * @api public
 */
Application.prototype.use = function use(application) {
  this.sub.push(application);
  return application;
};

/**
 * Register a `sub` endpoint on the application.
 *
 * @param {String} name The pathname/namespace/URL you want to mount upon.
 * @returns {Application} The newly created Application
 * @api public
 */
Application.prototype.endpoint = function endpoint(name) {
  var application = new Application(name);
  return this.use(application);
};

/**
 * Check if we are or have a matching application that can handle the given URL.
 *
 * @param {String} url Incoming pathname.
 * @param {String} method HTTP method.
 * @returns {Application}
 * @api public
 */
Application.prototype.which = function which(url, method) {
  var match = this.match(url, method)
    , application
    , matching;

  if (!match) return;

  //
  // If we have a match but have sub-applications we need to check them first to
  // see if they are matching.
  //
  for (var i = 0; i < this.sub.length; i++) {
    application = this.sub[i];
    matching = application.match(match.url, method);

    if (matching) return matching;
  }

  return match;
};

/**
 * Optimize the application structure.
 *
 * @param {Mixed} context The `this` value for the http methods.
 * @returns {Application}
 * @api public
 */
Application.prototype.optimize = function optimize(context) {
  var app = this;

  dollars.map(app.methods, function assign(handles, method) {
    if (handles instanceof Supply) return handles;

    var supply = new Supply(context);

    dollars.each(handles, function each(fn) {
      supply.use(fn);
    });

    return supply;
  });

  return this;
};

/**
 * Return a middleware layer which an handle the application.
 *
 * @param {Mixed} context The `this` value for the http methods.
 * @returns {Function} Middleware function.
 * @api public
 */
Application.prototype.run = function run(context) {
  var app = this.optimize(context);

  return function middleware(req, res, next) {
    var application = app.which(req.url, req.method);

    if (!application) return next();

    req.params = application.params;
    application.method.each(req, res, next);
  };
};

//
// Expose the Application interface.
//
module.exports = Application;
