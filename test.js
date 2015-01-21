describe('Roete', function () {
  'use strict';

  var Roete = require('./roete')
    , assume = require('assume');

  it('is exported as function', function () {
    assume(Roete).is.a('function');
  });

  it('can be initialized without `new` keyword', function () {
    var route = Roete('foo')
      , res = route.match('foo');

    assume(res).is.instanceOf(Roete.Match);
  });

  it('contains the rest of URL', function () {
    var route = new Roete('foo')
      , res = route.match('foo/bar');

    assume(res.url).contains('bar');
    assume(res.url).does.not.contains('foo');
    assume(res.match).equals('/foo/');
  });

  [
    { url: '/foo', matches: '/foo/' },
    { url: '/{hello}/{world}/', matches: '/hello/mom/' },
    { url: '{hello}', matches: '/things/' },
    { url: 'hello', matches: '/hello/' },
    { url: 'hello', matches: 'hello' },
    { url: 'hello', matches: '/hello/world/' },
    { url: 'hello', matches: 'hello/world' }
  ].forEach(function each(spec) {
    it('matches '+ spec.url +' with '+ spec.matches, function () {
      var route = new Roete(spec.url)
        , res = route.match(spec.matches);

      assume(res).is.not.undefined();
    });
  });

  it('returns undefined when the route is not matched', function () {
    var route = new Roete('/hello/{world}/')
      , match = route.match('/hola/foo');

    assume(match).is.undefined();
  });

  it('defaults to the value in the path', function () {
    var route = new Roete('/hello/{world}/')
      , match = route.match('/hello/foo');

    assume(match.params.world).equals('foo');
  });

  describe('.param', function () {
    it('adds parsers that transform values', function () {
      var route = new Roete('/hello/{world}/');

      route.param('world', function (arg) {
        assume(arg).equals('foo');
        return 'bar';
      });

      var match = route.match('/hello/foo');
      assume(match.params.world).equals('bar');
    });
  });
});
