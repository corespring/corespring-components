/* global com, afterEach*/
describe('component-image-service', function() {

  beforeEach(function() {
    angular.mock.module('test-app');
  });

  var utils;

  beforeEach(inject(function(ImageUtils) {
    utils = ImageUtils;
  }));

  describe('acceptableType', function() {

    it('returns an error', function(){
      var error = utils.acceptableType('blah', []); 
      expect(error.code).toEqual(utils.errors.UNACCEPTABLE_TYPE);
    });
    
    it('returns undefined for an acceptableType', function(){
      expect(utils.acceptableType('blah', ['blah'])).toBe(undefined);
    });
    
    it('throws an error if type is falsey', function(){
      expect( function(){
        utils.acceptableType(null, ['blah']); 
      }).toThrow(jasmine.any(Error));
    });
    
    it('throws an error if types is falsey', function(){
      expect( function(){
        utils.acceptableType('blah', null); 
      }).toThrow(jasmine.any(Error));
    });

  });
});