var should = require('should');
var fs = require('fs');
var JWT = require('./jwt');
var privateKey = fs.readFileSync('./fixtures/key.pem');
var publicKey = fs.readFileSync('./fixtures/key.pub');
var wrongPublicKey = fs.readFileSync('./fixtures/badkey.pub');

describe('The JSON Web Token helper', function () {

  describe('comes with reasonable defaults. It', function () {
    var jwt = new JWT(privateKey);

    it('has a default algorithm of "RS256"', function () {
      jwt.algorithm.should.equal('RS256');
    });

    it('has a default expiry time of 1 month', function () {
      jwt.expiresInSeconds.should.equal(2592000);
    });

    it('has a default issuer of "ch:server"', function () {
      jwt.issuer.should.equal('ch:server');
    });

    it('has a default subject of "ch:login"', function () {
      jwt.subject.should.equal('ch:login');
    });

    it('has a default audience of "ch:client"', function () {
      jwt.audience.should.equal('ch:client');
    });
  });

  describe('has a constructor, which', function () {
    throwsIf('the given secret is not a valid RSA private key', function () {
      var jwt = new JWT('badsecret');
    });

    it('warns if no private key was given', function () {
      var log = console.log;
      var called = false;
      var spy = new Spy(console, 'log');
      var jwt = new JWT();
      spy.called.should.be.true;
    })
  });

  describe('has a `sign` method, which', function () {
    var jwt = new JWT(privateKey);
    var jwtNoKey = new JWT();
    var payload = {my: 'payload'};
    var badPayload = {iss: 'whatever'};

    it('returns a token (String)', function () {
      var token = jwt.sign(payload);
      token.should.be.a.String;
    });

    throwsIf('no private key was given', function () {
      jwtNoKey.sign(payload);
    });

    throwsIf('no payload was given', function () {
      jwt.sign();
    });

    throwsIf('the payload contains reserved keys', function () {
      jwt.sign(badPayload);
    });
  });


  describe('has a `verify` method, which', function () {
    var jwt = new JWT(privateKey);
    var payload = {my: 'payload'};
    var token = jwt.sign(payload);
    var goodResult = jwt.verify(token, publicKey);
    var badResult = jwt.verify(token, wrongPublicKey);

    throwsIf('no token is given', function () {
      jwt.verify(undefined, publicKey);
    });

    throwsIf('no public key is given', function () {
      jwt.verify(token, undefined);
    });

    throwsIf('the public key is invalid', function () {
      jwt.verify(token, 'totallyNotLegit');
    });

    describe('returns a result, which', function () {
      it('indicates a valid token', function () {
        goodResult.valid.should.be.true;
      });
      
      it('indicates an invalid token', function () {
        badResult.valid.should.be.false;
      });

      it('indicates why an invalid token was invalid', function () {
        // This might be because the token is malformed, expired, etc
        badResult.reason.should.be.a.String;
      });

      it('contains the JWT token metadata', function () {
        goodResult.iss.should.be.a.String;
        goodResult.aud.should.be.a.String;
        goodResult.sub.should.be.a.String;
        goodResult.exp.should.be.a.Number;
        goodResult.iat.should.be.a.Number;
      });

      it('contains the payload', function () {
        for (var key in payload) {
          goodResult[key].should.equal(payload[key]);
        } 
      });
    });
  });

  describe('has a method called `decode`, which', function () {
    var jwt = new JWT(privateKey);
    var token = jwt.sign({my: 'payload'});

    throwsIf('the token is not provided', function () {
      jwt.decode(undefined);
    });

    throwsIf('the token is not a string', function () {
      jwt.decode(24);
    });

    throwsIf('the token is malformed', function () {
      jwt.decode('totallyNotLegit');
    });

    it('returns the token data as an object', function () {
      var data = jwt.decode(token);
      data.my.should.equal('payload');
      data.iss.should.be.a.String;
    });
  });
});

function throwsIf(desc, fn) {
  it('throws if ' + desc, function () {
    should.throws(fn, Error);
  });
}

function Spy (object, methodName) {
  var old = object[methodName];
  this.called = false;
  var _this = this;

  object[methodName] = function () {
    _this.called = true;
    object[methodName] = old;
  }
}
