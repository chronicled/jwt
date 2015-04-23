# Chronicled JWT

A simplified wrapper around [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken).

Defaults:
 - Token expiry: 1 month
 - Algorithm: RSA (`'RS256'`)
 - Issuer: `'ch:server'`
 - Audience: `'ch:client'`
 - Subject: `'ch:login'`

## What/why

JSON Web Tokens are a simple way to encode information into a bearer token to avoid database lookups when authenticating API requests.
Basically, it's all the convenience of cookies but without the headaches that come with trying to use cookies for a public API (e.g. CORS).
Read more about JWTs [here](http://jwt.io/).

## Usage

First, we initialize a JWT processor.
This takes the contents of our RSA private key file as a string (or Buffer).

```js
var jwt = new JWT(privateKey);
```

Let's generate a token. This is a plain Javascript object that should contain the user, their permissions, etc.

```js
var payload = {
  user: {
    nickname: 'duncan',
    name: 'Duncan Smith',
    email: 'duncan@chronicled.com',
    roles: ['admin', 'user']
  }
};

var token = jwt.sign(payload);
```

Now that we have the token, we send it back to the client so they can use it to authenticate all requests from here on out.

Later on (most likely in a middleware), we'll want to verify the token (to make sure it hasn't been tampered with), and decode it (so that we can use the inforation contained within). We'll need to pass in the public key information as well (again, as a string or Buffer).

```js
var verifiedToken = jwt.verify(token, publicKey);

if (verifiedToken.valid) {
  console.log(verifiedToken.user); // => {nickame: 'duncan', name: 'Duncan Smith', email: 'duncan@chronicled.com', roles: ['admin', 'user']}
}
```

If the token is invalid (malformed, expired, etc), we can check the `reason` property to find out why:

```js
console.log(invalidToken.reason); // => 'Token is expired.'
```

**Protip: to generate a public/private key pair:**

```sh
openssl genrsa -out key.pem 2048 # Generate a private key
openssl rsa -in key.pem -pubout >> key.pub # Generate a public key from the private key
```

## Hacking

Tests are written with Mocha and Should.js.

Run tests with `npm test`.

Run tests continuously with `npm run tests:watch`.

## TODO

Make isomorphic. Currently only works in Node.js due to dependency on `jsonwebtoken` (above).
The main challenge in making it isomorphic is the reliance on native crypto libraries.
