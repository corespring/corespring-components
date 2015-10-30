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
    
    it('returns an error if type is falsey', function(){
      var error = utils.acceptableType(undefined, []); 
      expect(error.code).toEqual(utils.errors.UNACCEPTABLE_TYPE);
    });
    
    it('returns an error if acceptableTypes is falsey', function(){
      var error = utils.acceptableType('blah', undefined); 
      expect(error.code).toEqual(utils.errors.UNACCEPTABLE_TYPE);
    });

  });
});