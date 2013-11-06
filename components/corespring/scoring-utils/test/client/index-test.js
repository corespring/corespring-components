describe('corespring', function () {

  var utils = null;

  describe('multiple-choice configure', function () {

    beforeEach(angular.mock.module('test-app'));

    beforeEach(inject(function ($rootScope, ScoringUtils) {
      utils = ScoringUtils;
    }));

    it('should work', function(){
      expect(utils.sayHello("?")).toEqual("!!?");
    });

  });

});
