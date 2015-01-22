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

  it('only parses when supplied with URL', function () {
    var route = new Roete();

    assume(route.path).is.a('null');
    route.parse('foo');
    assume(route.path).is.a('regexp');
  });

  it('contains the rest of URL', function () {
    var route = new Roete('foo')
      , res = route.match('foo/bar');

    assume(res.url).contains('bar');
    assume(res.url).does.not.contains('foo');
    assume(res.match).equals('/foo/');
  });

  it('only returns the match if we also match the supplied method', function () {
    var route = new Roete('foo')
      , res = route.match('foo/bar', 'GET');

    assume(res).is.undefined();

    route.methods.GET = {};
    res = route.match('foo/bar', 'GET');

    assume(res).is.instanceOf(Roete.Match);
    assume(res.method).equals(route.methods.GET);
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

describe('Application', function () {
  'use strict';

  var Application = require('./application')
    , Roete = require('./roete')
    , assume = require('assume')
    , Supply = require('supply')
    , app;

  beforeEach(function () {
    app = new Application('foo');
  });

  it('is exposed a function', function () {
    assume(Application).is.a('function');
  });

  it('can be constructed without `new` keyword', function () {
    var app = Application('foo');

    assume(app).is.instanceOf(Application);
    assume(app.optimize).is.a('function');
  });

  it('inherits from Roete', function () {
    assume(app).is.instanceOf(Roete);
  });

  describe('#get, #post, #put, #delete', function () {
    it('adds a #get method', function () {
      assume(app.methods.GET).is.undefined();

      assume(app.get).is.a('function');
      assume(app.get(function () {})).equals(app);

      assume(app.methods.GET).is.a('array');
      assume(app.methods.GET).has.length(1);
    });

    it('adds a #post method', function () {
      assume(app.methods.POST).is.undefined();

      assume(app.post).is.a('function');
      assume(app.post(function () {})).equals(app);

      assume(app.methods.POST).is.a('array');
      assume(app.methods.POST).has.length(1);
    });

    it('adds a #put method', function () {
      assume(app.methods.PUT).is.undefined();

      assume(app.put).is.a('function');
      assume(app.put(function () {})).equals(app);

      assume(app.methods.PUT).is.a('array');
      assume(app.methods.PUT).has.length(1);
    });

    it('adds a #delete method', function () {
      assume(app.methods.DELETE).is.undefined();

      assume(app.delete).is.a('function');
      assume(app.delete(function () {})).equals(app);

      assume(app.methods.DELETE).is.a('array');
      assume(app.methods.DELETE).has.length(1);
    });
  });

  describe('#optimize', function () {
    it('transforms all `route.methods` in to Supplies', function () {
      app.get(function (req, res, next) {});

      assume(app.methods.GET).is.a('array');

      app.optimize();
      assume(app.methods.GET).is.instanceOf(Supply);
      assume(app.methods.GET).has.length(1);
    });

    it('can be called multiple times without side effects', function () {
      app.get(function (req, res, next) {});
      app.post(function (req, res, next) {});
      app.delete(function (req, res, next) {});
      app.put(function (req, res, next) {});

      app.optimize();
      app.optimize();
      app.optimize();

      assume(app.methods.DELETE).is.instanceOf(Supply);
      assume(app.methods.POST).is.instanceOf(Supply);
      assume(app.methods.GET).is.instanceOf(Supply);
      assume(app.methods.PUT).is.instanceOf(Supply);
    });

    it('sets the given context as supply context', function (next) {
      var context = { foo: 'bar' };

      app.get(function (req, res, done) {
        assume(done).is.a('function');
        assume(this).equals(context);
        assume(req).equals('foo');
        assume(res).equals('bar');

        next();
      });

      app.optimize(context);
      app.which('/foo', 'GET').method.each('foo', 'bar');
    });
  });
});
