# Chronicled JWT

A simplified wrapper around [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken).

Defaults:
 - Token expiry: 1 month
 - Algorithm: RSA (`'RS256'`)
 - Issuer: `'ch:server'`
 - Audience: `'ch:client'`
 - Subject: `'ch:login'`

## Usage

```js
  var fs = require('fs');
  var privateKey = fs.readFileSync('./path/to/private.key');
  var publicKey = fs.readFileSync('./path/to/public.key');

  var jwt = new JWT(privateKey);
  var token = jwt.sign({my: 'payload'});
  var verifiedToken = jwt.verify(token, publicKey);
```

## Hacking

Tests are written with Mocha and Should.js.

Run tests with `npm test`.

Run tests continuously with `npm run tests:watch`.

## TODO

Make isomorphic. Currently only works in Node.js due to dependency on `jsonwebtoken` (above).
The main challenge in making it isomorphic is the reliance on native crypto libraries.
