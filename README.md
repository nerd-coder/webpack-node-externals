Webpack node modules externals

==============================

> Easily exclude node modules in Webpack (with Zero-Config)

## Disclaimer

This lib is a forked version of _Liad Yosef's_ [webpack-node-externals](https://github.com/liady/webpack-node-externals) which do the same thing, but slightly difference usage.

```js
// Original plugin:
    externals: [nodeExternals()]

// This plugin
    plugins: [new NodeExternals()]
```

### Usage

```js
npm i -D @nerd-coder/webpack-node-externals
```

**You can use it in CLI (_zero config_)**

```sh
webpack -p --plugin @nerd-coder/webpack-node-externals
```

Or you can add it into your `webpack.config.js`

```js
const NodeExternals = require('@nerd-coder/webpack-node-externals')
...
module.exports = {
    ...
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    plugins: [new NodeExternals()], // in order to ignore all modules in node_modules folder
    ...
}
```

### Options

Please refer to the [original docs](https://github.com/liady/webpack-node-externals) for detailed available options
### 



## License
MIT
