var _ = require('lodash');

function JWT (secret, options) {
  this.jwt = require('jsonwebtoken');

  var defaultSigningOptions = {
    algorithm: 'RS256',
    expiresInSeconds: 2592000, // 1 month
    issuer: 'ch:server',
    subject: 'ch:login',
    audience: 'ch:client'
  };

  var options = options || {};
 
  this._signingOptions = _.extend({}, defaultSigningOptions, options);
  this.secret = secret;
  _.extend(this, this._signingOptions);

  if (!this.secret) {
    this._noKey = true;
  }
  else {
    if (!isValidPrivateKey(this.secret)) {
      throw new Error('Invalid private key given: "' + this.secret + '".');
    }
  }
}

JWT.prototype = {
  sign: function (payload) {
    if (this._noKey) {
      throw new Error('No private key given. Please provide a valid RSA private key.')
      return false;
    }

    var reservedKeys = ['iss', 'aud', 'sub', 'exp', 'iat'];
    var keys = includedKeys(payload, reservedKeys);

    if (keys.length > 0) {
      throw new Error('Payload includes one or more reserved keys: ' + keys);
    }

    return this.jwt.sign(_.extend({}, payload), this.secret, this._signingOptions);
  },

  verify: function (token, cert) {
    var result;
    
    if (!token) {
      throw new Error('No token given.');
    }

    if (!cert) {
      throw new Error('No public key given.');
    }
    
    if (!isValidPublicKey(cert)) {
      throw new Error('Invalid public key: "' + cert + '"');
    }

    try {
      // We wrap this in a try-catch because we only want
      // to raise an exception if there is a programming
      // error (as opposed to a missing piece of data).
      result = this.jwt.verify(token, cert, this._signingOptions);
      result.valid = true;
    }
    catch (err) {
      result = {valid: false, reason: err.message};
    }
    
    return result;
  },

  decode: function (token) {
    var bits, decodedBits, tokenData;

    if (!token) {
      throw new Error('No token provided.');
    }

    if (!token.split) {
      throw new Error('Invalid token provided: ' + token);
    }

    bits = token.split('.');
    
    if (bits.length !== 3) {
      throw new Error('Malformed token provided: ' + token);
    }

    decodedBits = bits.map(decodeBit);
    tokenData = decodedBits[1];

    return JSON.parse(tokenData);
  }
};

module.exports = JWT;

function warnPrivateKey () {
  console.log('Warning: no private key given. You will not be able to sign payloads with this instance. However, you can still verify tokens.');
}

function isValidPrivateKey (secret) {
  return secret.toString('utf8').indexOf('-----BEGIN RSA PRIVATE KEY-----') === 0;
}

function isValidPublicKey (cert) {
  var certStr = cert.toString('utf8');
  return certStr.indexOf('-----BEGIN PUBLIC KEY-----') === 0 || certStr.indexOf('-----BEGIN CERTIFICATE-----') === 0;
}

function includedKeys(obj, keys) {
  return keys.filter(function (key) {
    return obj.hasOwnProperty(key);
  });
}

function decodeBit (encoded) {
  return new Buffer(encoded, 'base64').toString();
}
