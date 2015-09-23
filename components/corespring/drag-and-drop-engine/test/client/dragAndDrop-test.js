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

      //startOver does not call revertToUndoState, when there is are less than two states on the undo stack
      //below we are adding fake states to enable it
      var counter = 1;
      scope.undoModel.setGetState(function(){ return counter++; });
      scope.undoModel.init();
      scope.undoModel.remember();

      scope.startOver();
      scope.originalChoices =[];
      expect(scope.originalChoices).toBeDefined();
      expect(scope.$emit).toHaveBeenCalledWith('rerender-math', {delay: jasmine.any(Number), element: jasmine.any(Object)});
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
        expect(scope.$emit).toHaveBeenCalledWith('rerender-math', {delay: jasmine.any(Number), element: jasmine.any(Object)});
      });

      it('answer change handler does not get called initially', function() {
        var changeHandlerCalled = false;
        scope.containerBridge.answerChangedHandler(function(c) {
          changeHandlerCalled = true;
        });
        scope.$digest();
        expect(changeHandlerCalled).toBe(false);
      });

      it('answer change handler gets called when repsonse changes', function() {
        var changeHandlerCalled = false;
        scope.containerBridge.answerChangedHandler(function(c) {
          changeHandlerCalled = true;
        });
        scope.landingPlaceChoices = {'choice1': 'apple'};
        scope.$digest();
        scope.landingPlaceChoices.choice1 = 'pear';
        scope.$digest();
        expect(changeHandlerCalled).toBe(true);
      });
    });

  });

});
