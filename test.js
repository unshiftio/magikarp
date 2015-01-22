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

/* istanbul ignore next */
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

    it('should also optimize all subs', function () {
      var sub = app.endpoint('sub')
        , subb = sub.endpoint('subb')
        , subbb = sub.endpoint('subbb');

      subbb.get(function () {});
      subb.get(function () {});
      sub.get(function () {});
      app.get(function () {});

      app.optimize();

      assume(subbb.methods.GET).is.instanceOf(Supply);
      assume(subb.methods.GET).is.instanceOf(Supply);
      assume(sub.methods.GET).is.instanceOf(Supply);
      assume(app.methods.GET).is.instanceOf(Supply);
    });
  });

  describe('#use', function () {
    var sub = new Application('/bar/');

    it('adds new sub application', function () {
      assume(app.use(sub)).equals(sub);
      assume(app.sub[0]).equals(sub);
    });
  });

  describe('#endpoint', function () {
    it('registers a new endpoint', function () {
      var res = app.endpoint('bar');

      assume(res).does.not.equals(app);
      assume(res).is.instanceOf(Application);
      assume(res).equals(app.sub[0]);

      assume(!!res.match('/bar/')).is.true();
    });
  });

  describe('#which', function () {
    var bar, baz, foo;

    beforeEach(function () {
      bar = app.endpoint('bar/{banana}/claw');
      baz = app.endpoint('baz');
      foo = baz.endpoint('foo');

      bar.get(function () {});
      bar.post(function () {});
      baz.get(function () {});
      foo.get(function () {});

      app.optimize();
    });

    it('finds routes based upon the given url and method', function () {
      var found = app.which('/foo/baz', 'GET');

      assume(found).is.not.undefined();
      assume(found).instanceOf(Roete.Match);
      assume(found.method).equals(baz.methods.GET);
    });

    it('returns undefined for non matches', function () {
      app.get(function () {});

      assume(app.which('lol', 'GET')).is.undefined();
      assume(app.which('/foo/unknown', 'GET')).is.undefined();
      assume(app.which('/foo/bar', 'GET')).is.undefined();
      assume(app.which('/foo', 'POST')).is.undefined();
      assume(app.which('/foo', 'GET')).is.not.undefined();
      assume(app.which('/foo/bar/something/claw', 'GET')).is.not.undefined();
      assume(app.which('/foo/bar/something/claw', 'POST')).is.not.undefined();
      assume(app.which('/foo/bar/something/claw', 'DELETE')).is.undefined();
    });
  });

  describe('#run', function () {
    it('optimizes the endpoints', function () {
      var sub = app.endpoint('sub')
        , subb = sub.endpoint('subb')
        , subbb = sub.endpoint('subbb');

      subbb.get(function () {});
      subb.get(function () {});
      sub.get(function () {});
      app.get(function () {});

      app.run();

      assume(subbb.methods.GET).is.instanceOf(Supply);
      assume(subb.methods.GET).is.instanceOf(Supply);
      assume(sub.methods.GET).is.instanceOf(Supply);
      assume(app.methods.GET).is.instanceOf(Supply);
    });

    it('returns a middleware function', function () {
      assume(app.run()).is.a('function');
      assume(app.run()).has.length(3);
    });

    it('calls the callback if nothing matches', function (next) {
      app.get(function () { });

      var middle = app.run();

      middle({ url: '/foo/bar', method: 'GET' }, {}, next);
    });

    it('calls the route with req/res', function (next) {
      next = assume.plan(2, next);

      app.get(function (req, res, next) {
        assume(req).equals(request);
        assume(res).equals(response);

        next();
      });

      var request = { url: '/foo', method: 'GET' }
        , middle = app.run()
        , response = {};

      middle(request, response, next);
    });

    it('extracts the params and introduces them on the req', function (next) {
      next = assume.plan(3, next);

      app.endpoint('{bar}/{foo}/another').get(function (req, res, next) {
        assume(req.params).is.a('object');
        assume(req.params.foo).equals('world');
        assume(req.params.bar).equals('hello');

        next();
      });

      var request = { url: '/foo/hello/world/another', method: 'GET' }
        , middle = app.run()
        , response = {};

      middle(request, response, next);
    });
  });
});
