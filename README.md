# magikarp

<p align="center">
  <img src="https://raw.githubusercontent.com/unshiftio/magikarp/master/magikarp.gif" alt="A PLBBBBTTT A-PLBBBBBTTT A-PLBBBBTTT A-PLBBBTTT A-PLBBT"/>
</p>

[![Made by unshift][made-by]](http://unshift.io)[![Version npm][version]](http://browsenpm.org/package/magikarp)[![Build Status][build]](https://travis-ci.org/unshiftio/magikarp)[![Dependencies][david]](https://david-dm.org/unshiftio/magikarp)[![Coverage Status][cover]](https://coveralls.io/r/unshiftio/magikarp?branch=master)[![IRC channel][irc]](http://webchat.freenode.net/?channels=unshift)

[made-by]: https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square
[version]: https://img.shields.io/npm/v/magikarp.svg?style=flat-square
[build]: https://img.shields.io/travis/unshiftio/magikarp/master.svg?style=flat-square
[david]: https://img.shields.io/david/unshiftio/magikarp.svg?style=flat-square
[cover]: https://img.shields.io/coveralls/unshiftio/magikarp/master.svg?style=flat-square
[irc]: https://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square

Magikarp is a library for building applications. Not normal applications, but
path (from URL's) based applications. It doesn't see URL's as routes but as
application. Every section of a patch can be an individual application. These
applications can be shared and installed from npm, modulized, re-used and sliced
up in any way imaginable.

Just like Magikarp, you can evolve something as small as route to a really
powerful beast.

## Installation

The module is released in the public npm registry and can be installed by
running:

```js
npm install --save magikarp
```

The `--save` flag tells `npm` to add the installed version of the module as
dependency in your `package.json` file.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [magikarp.from](#magikarpfrom)
  - [magikarp.add](#magikarpadd)
  - [magikarp.path](#magikarppath)
  - [magikarp.use](#magikarpuse)
  - [magikarp.before](#magikarpbefore)
  - [magikarp.run](#magikarprun)
- [Application](#application)
  - [API](#api)
    - [get, post, put, delete](#get-post-put-delete)
    - [path](#path)
    - [prev, previous](#prev-previous)
    - [mount](#mount)
    - [optimize](#optimize)
    - [run](#run)
  - [Sharing](#sharing)
  - [Routes](#routes)
- [License](#license)

## Usage

In the following snippets and API examples we assume that you've already created
a new `Magikarp` instance. If you have not yet, please copy the following
example:

```js
var Magikarp = require('magikarp')
  , magikarp = new Magikarp(/* null, { options } */)
```

When constructing a new `Magikarp` instance all arguments are optional but they
might be useful for your use case. The constructor accepts 2 arguments:

1. An object which would be used as the `this` value for all your routes. If
   nothing is supplied it will default to your constructed Magikarp instance.
2. Options object which allows you to configure:
   - `pathname` The base path from which we should start looking for
      applications, defaults to `/`.

Now that you've created your first instance we can look at the methods that we
expose:

### magikarp.from

Read the Applications from a directory. This directory can be one level deep and
folders that are in the given directory should have an `index.js` file which
exposes an [Application](#application) instance. All none `.js` files in the
directory it self will be ignored automatically.

The method accepts 2 arguments:

- **directory** The absolute path to the directory which contains the various of
  applications.
- **options** An object which allows you to configure how the directory is read:
  - `deep` Allow one folder within the directory.
  - `nested` Deeply spider the given directory for js files.

```js
magikarp.from(require('path').join(__dirname, 'fixtures'));
```

This method returns it self so you can chain it, if that's how you roll.

### magikarp.add

Add new application instance to your Magikarp. We will automatically call the
`run`/`optimize` method of the application and pass in the `this` value that
you've set when constructing your Magikarp instance.

The method requires 1 argument:

- **application** The application that we should run.

```js
magikarp.add(new Magikarp.Application('foo/bar/{baz}.js'));
```

As you might have guessed, this method is also chainable.

### magikarp.path

Create a new application instance that will automatically be added in to
magikarp so it can be requested.

```js
var app = magikarp.path('foo');

app.get(function (req, res, next) {
  res.end('hello from foo');
});
```

### magikarp.use

Add new middleware layer to the stack. This middleware layer will be run for
every application and HTTP method. Please do note that `.from`,`.add` and
`.path` also introduce middleware layers to the stack. So if you want to have
your middleware for every application, besure to add them before calling any of
those methods. This actually quite powerful as you can gracefully add more
layers. 

See [Supply.use](https://github.com/bigpipe/supply#use) for more detailed
information on how this method works. One thing that might be worth noting is
that Magikarp is actually a full Supply instance so every method that is on
Supply should also work for Magikarp. 

```js
magikarp.use(require('serve-static')(__dirname + '/static/dir'));
```

### magikarp.before

Same as the [`magikarp.use`](#magikarpuse) method, but it adds the middleware
layers at the beginnging of the stack instead of at the end.

```js
magikarp.before('favicon', require('serve-favicon')());
```

### magikarp.run

This is where the magic happens and we actually start handling the HTTP request.

The method requires 3 arguments:

- **req** The incoming HTTP request.
- **res** The outgoing HTTP response.
- **next** Error first continuation callback for when we have no matching
  routes.

```js
var http = require('http').createServer(function (req, res) {
  magikarp.run(req, res, function aww(err) {
    res.statusCode = err ? 500 : 404;
    res.end('awww');
  });
});
```

## Application

Applications are the things that run the matching part of the path name has been
accessed. In the all following examples we assume that you've already created an
application, if you have not yet, please follow one of the following examples:

If you haven't required `Magikarp` yet:

```js
var app = require('magikarp').path(route);
```

If you've already required `Magikarp`:

```js
var app = new Magikarp.Application(route);
```

If you already have a `Magikarp` instance:

```js
var app = magikarp.path(route);
```

So there are different ways to create your first Application. The `route` that
we use in the examples above should a string that matches one or multiple
sections of the path name. See [routes](#routes) for more detailed information
about the various of routes and patterns that you can create and use here.

### API

The following methods are exposed on your Application instance:

##### get, post, put, delete

Add a request handler for the given method. You can also use these methods to
add middleware layers before the request as they follow same identical argument
pattern. The handlers require a function which accepts 3 argument:

1. **req** Reference to the incoming HTTP request.
2. **res** Reference to the outgoing HTTP response.
3. **next** Error first continuation callback. If there was an error which made
   it impossible to process the request it can be supplied as first argument.
   Also if you do not wish to handle the request you can simply call the
   callback without any argument and we will try to find another function that
   can.

```js
var app = magikarp.path('/amazing/{path}/name/');

app
.get(function (req, res, next) {
  res.end('handled');
});

app
.post(require('buffer-post')())
.post(function (req, res, next) {
  if (!req.body) return next();

  res.write(req.param.path);
});
```

Please note that the functions or middleware layers you add only apply to
requests that match your path and http method.

##### path

Create create, add, and returns a new Application instance. The instance that is
created is added as "sub" application so in order to access it needs to have the
same path as application it was created upon.

The method requires one argument:

- **name** The name, URL, or path that the application should respond to.

```js
var app = magikarp.path('foo')
  , sub = app.path('bar');

app.get(function () { .. });
app.get(function () { .. });
```

In the example above, the `sub` application can only be accessed using the
`/foo/bar/` URL as it's created from the `foo` application. See
[routes](#routes) for more details about the paths/routes/URL syntax that we
allow.

##### prev, previous

If you've created a sub application using the `path` method you might want to
get the reference back to the application it was created upon. The `prev` or
`previous` method returns this reference:

```js
var app = magikarp.path('foo')
  , sub = app.path('bar');

console.log(sub.prev() === app); // true
```

##### mount

Mount allows you to directly pass in applications as `sub` application without
the need to create one first. This is super useful when you want to modulize
your code base re-use applications.

The method accepts 1 argument:

- **application** The application that needs to be added as sub application.

```js
var app = new magikarp.Application('foo')
  , root = magikarp.path('hello');

root.mount(app);
```

Please note that the `mount` method returns the added application. See the
[sharing](#sharing) section for more information about re-using and mounting
applications.

##### optimize

Transforms the old internals that power the API sugar to a sophisticated
middleware system that automatically handles all the request and middleware
processing for us. This method is automatically called when you trigger the
[run](#run) method for the generation of a middleware layer.

The optimize method accepts one argument:

- **context** The `this` value for all the http/middleware methods.

```js
var app = magikarp.path('foo');

app.get(function () { .. });
app.get(function () { .. });

app.optimize(magikarp.provider);
```

It's not hurtful to call the optimize method multiple times and it can be useful
if you wish to force a custom `this` value for the applications. 

##### run

Transform the application in a middleware layer which will trigger based on the
supplied route and path.

The method accepts one argument:

- **context** The `this` value for all the http/middleware methods.

```js
var app = magikarp.path('foo');

app.get(function () { .. });
app.get(function () { .. });

var middleware = app.run(magikarp.provider);
```

### Sharing

One of the amazing aspects about these applications is that they can just be
exported as separate files and there for also published as npm modules. Here's a
small example on how you could share a dashboard application:

```js
var app = require('magikarp').path('/dashboard/{id}/')
  , fs = require('fs');

app
.get(require('static-server')(__dirname +'/static'));
.get(function (req, res, next) {
  var file = __dirname +'/+ req.param.id +'.html';

  fs.exists(file, function (exists) {
    if (!exists) return next();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    fs.createReadStream(file).pipe(res);
  });
});

//
// Expose the admin interface on the `module.exports` so return valued of a
// require references the application.
//
module.exports = app;
```

After installing this (fake) module using `npm install` you can use it directly
in your application. The only thing you need to do is `mount` it:

```js
var app = require('magikarp').path('admin', module);

app
.mount(require('magikarp-dashboard'))
.get(function (req, res, next) {
  res.statusCode = 404;
  res.end('I handle the apps 404s');
});
```

So now when you navigate to `/admin/dashboard/index` it will serve the
`index.html` from the `magikarp-dashboard` module.

### Routes

An application can be mounted on one or multiple paths. The supplied path should
be a string that can optionally be pre and suffixed with a `/`. When you omit
those we will automatically add them back internally.

- `/appname/` would match `/appname/`
- `appname` would match `/appname/`
- `/appname` would match `/appname/`
- `/appname/foo` would match `/appname/foo/`

In order to capture data or "params" from paths you can use special `{ .. }`
placeholders in the pathnames. These pathnames will be automatically replaced
with an cat all Regular Expression and introduces the supplied name within the
curly braces as key with the path value in the `req.param` object.

- `{foo}.js` would match `/hello.js`, `/bar.js` etc.
- `/static/{type}/{filename}.{ext}` would match `/static/css/file.js`.

The combinations are endless.

## License

MIT
