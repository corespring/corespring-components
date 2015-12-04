describe('removeAfterPlacing', function() {

  var scope, element;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div remove-after-placing=""></div>')(scope);
    scope = element.scope();
  }));

  function choices() {
    return [
      { moveOnDrag: false }, { moveOnDrag: true }, { moveOnDrag: false }
    ];
  }

  beforeEach(function() {
    scope.fullModel = {
      model: {
        choices: choices()
      }
    }
    scope.$digest();
  });

  describe('config.removeAllAfterPlacing', function() {

    it('should be false', function() {
      expect(scope.config.removeAllAfterPlacing).toBe(false);
    });

    describe('when all choices have moveOnDrag = true', function() {
      beforeEach(function() {
        _.each(scope.fullModel.model.choices, function(choice) {
          choice.moveOnDrag = true;
          scope.$digest();
        });
      });

      it('should be true', function() {
        expect(scope.config.removeAllAfterPlacing).toBe(true);
      });

    });

    describe('when all choices have moveOnDrag = false', function() {
      beforeEach(function() {
        _.each(scope.fullModel.model.choices, function(choice) {
          choice.moveOnDrag = false;
          scope.$digest();
        });
      });

      it('should be true', function() {
        expect(scope.config.removeAllAfterPlacing).toBe(false);
      });


    });

  });

  describe('choices', function() {

    describe('config.removeAllAfterPlacing set to true', function() {

      beforeEach(function() {
        scope.config.removeAllAfterPlacing = true;
        scope.$digest();
      });

      it('should have moveOnDrag = true for all choices', function() {
        _.each(scope.fullModel.model.choices, function(choice) {
          expect(choice.moveOnDrag).toBe(true);
        });
      });

    });

    describe('config.removeAllAfterPlacing set to false', function() {

      beforeEach(function() {
        scope.config.removeAllAfterPlacing = false;
        scope.$digest();
      });

      it('should have moveOnDrag = false for all choices', function() {
        _.each(scope.fullModel.model.choices, function(choice) {
          expect(choice.moveOnDrag).toBe(false);
        });
      });

    });

  });


});
