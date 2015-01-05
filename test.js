describe('magicarp', function () {
  'use strict';

  var Magicarp = require('./')
    , assume = require('assume');

  it('is exported as function', function () {
    assume(Magicarp).is.a('function');
  });

  it('exposes the .Fragment constructor', function () {
    assume(Magicarp.Fragment).is.a('function');
  });
});
