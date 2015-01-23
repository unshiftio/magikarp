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

## Usage

In the following snippets and API examples we assume that you've already created
a new `Magikarp` instance. If you have not yet, please copy the following
example:

```js
var Magikarp = require('magikarp');
```

### Application

#### Routes

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
