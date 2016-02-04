var GoogleStrategy = require('../lib/strategy')
  , fs = require('fs');


describe('Strategy#userProfile', function() {
  
  describe('fetched from default endpoint', function() {
    var strategy = new GoogleStrategy({
      consumerKey: 'www.example.com',
      consumerSecret: 'secret'
    }, function verify(){});
    
    strategy._oauth.get = function(url, token, tokenSecret, callback) {
      if (url != 'https://www.google.com/m8/feeds/contacts/default/full?max-results=1&alt=json') { return callback(new Error('incorrect url argument')); }
      if (token != 'token') { return callback(new Error('incorrect token argument')); }
      if (tokenSecret != 'token-secret') { return callback(new Error('incorrect tokenSecret argument')); }
    
      var body = '{"version":"1.0","encoding":"UTF-8","feed":{"xmlns":"http://www.w3.org/2005/Atom","xmlns$openSearch":"http://a9.com/-/spec/opensearchrss/1.0/","xmlns$gContact":"http://schemas.google.com/contact/2008","xmlns$batch":"http://schemas.google.com/gdata/batch","xmlns$gd":"http://schemas.google.com/g/2005","id":{"$t":"example@gmail.com"},"updated":{"$t":"2012-01-10T19:21:31.537Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Jared Hanson\'s Contacts"},"link":[{"rel":"alternate","type":"text/html","href":"http://www.google.com/"},{"rel":"http://schemas.google.com/g/2005#feed","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/example%40gmail.com/full"},{"rel":"http://schemas.google.com/g/2005#post","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/example%40gmail.com/full"},{"rel":"http://schemas.google.com/g/2005#batch","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/example%40gmail.com/full/batch"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/example%40gmail.com/full?alt\\u003djson\\u0026max-results\\u003d1"},{"rel":"next","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/example%40gmail.com/full?alt\\u003djson\\u0026start-index\\u003d2\\u0026max-results\\u003d1"}],"author":[{"name":{"$t":"Jared Hanson"},"email":{"$t":"example@gmail.com"}}],"generator":{"version":"1.0","uri":"http://www.google.com/m8/feeds","$t":"Contacts"},"openSearch$totalResults":{"$t":"3"},"openSearch$startIndex":{"$t":"1"},"openSearch$itemsPerPage":{"$t":"1"},"entry":[{"id":{"$t":"http://www.google.com/m8/feeds/contacts/example%40gmail.com/base/0"},"updated":{"$t":"2009-09-30T01:58:35.769Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/example%40gmail.com/0/0XXxxXXxXxXxx0XX0xXxXx"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/example%40gmail.com/0"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/example%40gmail.com/full/0"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/example%40gmail.com/full/0/1111111111111000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"example+other@gmail.com","primary":"true"}]}]}}';
      var response = {headers:{'x-access-level': 'read'}};
      callback(null, body, response);
    }
    
    
    var profile;
  
    before(function(done) {
      strategy.userProfile('token', 'token-secret', { user_id: '6253282' }, function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });
  
    it('should parse profile', function() {
      expect(profile.provider).to.equal('google');
      expect(profile.id).to.equal('example@gmail.com');
      expect(profile.displayName).to.equal('Jared Hanson');
      expect(profile.emails[0].value).to.equal('example@gmail.com');
    });
  
    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });
  
    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  }); // fetched from default endpoint
  
  describe('error caused by malformed response', function() {
    var strategy = new GoogleStrategy({
      consumerKey: 'www.example.com',
      consumerSecret: 'secret'
    }, function verify(){});
    
    strategy._oauth.get = function(url, token, tokenSecret, callback) {
      var body = 'Hello, world.';
      callback(null, body, undefined);
    }
    
    
    var err, profile;
    
    before(function(done) {
      strategy.userProfile('token', 'token-secret', { user_id: '123' }, function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to parse user profile');
    });
    
    it('should not supply profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // error caused by malformed response
  
  describe('internal error', function() {
    var strategy = new GoogleStrategy({
      consumerKey: 'www.example.com',
      consumerSecret: 'secret'
    }, function verify(){});
    
    strategy._oauth.get = function(url, token, tokenSecret, callback) {
      return callback(new Error('something went wrong'));
    }
    
    
    var err, profile;
    before(function(done) {
      strategy.userProfile('token', 'token-secret', { user_id: '123' }, function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });
  
    it('should not supply profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // internal error
  
});
