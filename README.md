# magikarp

<p align="center">
  <img src="https://raw.githubusercontent.com/unshiftio/magikarp/master/magikarp.gif" alt="A PLBBBBTTT A-PLBBBBBTTT A-PLBBBBTTT A-PLBBBTTT A-PLBBT"/>
</p>

Magicarp is a library for building applications. Not normal applications, but
path (from URL's) based applications. It doesn't see URL's as routes but as
application. Every piece of the path is an individual application and these
applications can be shared, modulized and sliced up in any way you want.

## Installation

The module is released in the public npm registry and can be installed by
running:

```js
npm install --save magikarp
```

An application can take possession of one or multiple paths.

```
/appname/
appname
appname/{filename}.js
/appname/{filename}.css
```

You might have noticed the `{ .. }` placeholders in the URL. These tags will
extract what ever matches with a catch all regular expression and introduce the
said name as parameter in the request object. In the example above your request
will have a `params` object with the key filename with whatever filename it
should match.

## License

MIT
