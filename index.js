'use strict';

var Fragment = require('./fragment')
  , dollars = require('dollars')
  , Supply = require('supply')
  , path = require('path')
  , url = require('url')
  , fs = require('fs');

var Magicarp = Supply.extend({
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

      var fragment = require(path.join(directory, filename));
      magicarp.use(fragment.matches());
    });

    return magicarp;
  },

  /**
   * @param {Request} req Incoming HTTP request.
   * @param {Response} res Outgoing HTTP response.
   * @param {Function} next Completion callback.
   * @returns {Magicarp}
   * @api public
   */
  run: function run(req, res, next) {
    req.uri = req.uri || url.parse(req.url);

    return this.each(req, res, next);
  }
});

/**
 * Fragment interface we implement for routing purposes.
 *
 * @type {Fragment}
 * @private
 */
Magicarp.Fragment = Fragment;

/**
 *
 * @param {Object} module Module API we should expose the fragment upon.
 * @returns {Fragment}
 * @api public
 */
Magicarp.splash = function splash(module) {
  return module.exports = new Fragment();
};

//
// Expose the API.
//
module.exports = Magicarp;
