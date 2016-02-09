var chai = require('chai')
  , GoogleStrategy = require('../lib/strategy');


describe('Strategy', function() {
  
  describe('constructed', function() {
    var strategy = new GoogleStrategy({
      consumerKey: 'www.example.com',
      consumerSecret: 'secret'
    }, function(){});
    
    it('should be named google', function() {
      expect(strategy.name).to.equal('google');
    });
  })
  
  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new GoogleStrategy(undefined, function(){});
      }).to.throw(Error);
    });
  })
  
  describe('authorization request with scope parameter as string', function() {
    var strategy = new GoogleStrategy({
      consumerKey: 'www.example.com',
      consumerSecret: 'secret'
    }, function(){});
    
    strategy._oauth.getOAuthRequestToken = function(extraParams, callback) {
      if (extraParams.scope != 'x') { return callback(new Error('incorrect scope parameter')); }
      
      callback(null, 'hh5s93j4hdidpola', 'hdhd0244k9j7ao03', {});
    }
    
    
    var url;
  
    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
          req.session = {};
        })
        .authenticate({ scope: 'x' });
    });
  
    it('should be redirected', function() {
      expect(url).to.equal('https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token=hh5s93j4hdidpola');
    });
  });
  
  describe('authorization request with scope parameter as array', function() {
    var strategy = new GoogleStrategy({
      consumerKey: 'www.example.com',
      consumerSecret: 'secret'
    }, function(){});
    
    strategy._oauth.getOAuthRequestToken = function(extraParams, callback) {
      if (extraParams.scope != 'x y') { return callback(new Error('incorrect scope parameter')); }
      
      callback(null, 'hh5s93j4hdidpola', 'hdhd0244k9j7ao03', {});
    }
    
    
    var url;
  
    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
          req.session = {};
        })
        .authenticate({ scope: ['x', 'y'] });
    });
  
    it('should be redirected', function() {
      expect(url).to.equal('https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token=hh5s93j4hdidpola');
    });
  });
  
});
