describe('feedback selector', function() {

  var scope, element;

  function MockWiggiMathJaxFeatureDef() {
  }

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('MathJaxService', {});
      $provide.value('WiggiMathJaxFeatureDef', MockWiggiMathJaxFeatureDef);
      $provide.value('WiggiLinkFeatureDef', function() {});
    });
  });

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div feedback-selector=""></div>')(scope);
    scope = element.isolateScope();
    scope.$apply();
  }));

  describe('initialization', function() {
    it('mini wiggi has mathjax enabled', function() {
      expect(scope.extraFeaturesForFeedback.definitions.length).toEqual(1);
      expect(scope.extraFeaturesForFeedback.definitions[0] instanceof MockWiggiMathJaxFeatureDef).toEqual(true);
    });
  });
});
