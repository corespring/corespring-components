describe('dragAndDropController', function() {

  var scope, element;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('$modal', function() {});
    });
  });

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.local = { choices: [] };
    scope.session = {
      stash: {}
    };
    scope.rawModel = {
      config: {
        shuffle: false
      }
    };
    element = $compile('<div drag-and-drop-controller=""></div>')(scope);
    scope = element.scope();
  }));

  describe('startOver', function() {

    it('should be defined', function() {
      expect(scope.startOver).toBeDefined();
    });

    it('should $emit a rerender-math event', function() {
      spyOn(scope, "$emit");
      scope.startOver();
      expect(scope.$emit).toHaveBeenCalledWith('rerender-math', {delay: 1});
    });

  });


  describe('containerBridge', function() {

    it('should be defined', function() {
      expect(scope.containerBridge).toBeDefined();
    });

    describe('reset', function() {
      it('should be defined', function() {
        expect(scope.containerBridge.reset).toBeDefined();
      });

      it('should $emit a rerender-math event', function() {
        spyOn(scope, "$emit");
        scope.containerBridge.reset();
        expect(scope.$emit).toHaveBeenCalledWith('rerender-math', {delay: 1});
      });

    });

  });

});
