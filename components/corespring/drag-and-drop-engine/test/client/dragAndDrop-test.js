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
      expect(scope.undoModel.startOver).toBeDefined();
    });

    it('should $emit a rerender-math event', function() {
      spyOn(scope, "$emit");
      //won't startOver unless two states are on the undo stack
      scope.undoModel.pushState({one:'1'});
      scope.undoModel.pushState({two:'2'});
      scope.undoModel.startOver();
      expect(scope.$emit).toHaveBeenCalledWith('rerender-math', {delay: jasmine.any(Number), element: jasmine.any(Object)});
    });

  });


  describe('containerBridge', function() {

    it('should be defined', function() {
      expect(scope.containerBridge).toBeDefined();
    });

    describe('reset', function() {
      it('should be defined', function () {
        expect(scope.containerBridge.reset).toBeDefined();
      });

      it('should $emit a rerender-math event', function () {
        spyOn(scope, "$emit");
        scope.containerBridge.reset();
        expect(scope.$emit).toHaveBeenCalledWith('rerender-math', {
          delay: jasmine.any(Number),
          element: jasmine.any(Object)
        });
      });
    });

    describe('answer change handler', function() {
      it('does not get called initially', function() {
        var changeHandlerCalled = false;
        scope.containerBridge.answerChangedHandler(function(c) {
          changeHandlerCalled = true;
        });
        scope.landingPlaceChoices = {'choice1': 'apple'};
        scope.$digest();
        expect(changeHandlerCalled).toBe(false);
      });

      it('gets called when response changes', function() {
        scope.landingPlaceChoices = {'choice1': 'apple'};
        scope.$digest();

        var changeHandlerCalled = false;
        scope.containerBridge.answerChangedHandler(function(c) {
          changeHandlerCalled = true;
        });

        scope.landingPlaceChoices.choice1 = 'pear';
        scope.$digest();
        expect(changeHandlerCalled).toBe(true);
      });
    });

  });

});
