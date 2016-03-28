describe('cs-start-over-button-with-model', function() {

  var scope, element, timeout;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
    });
  });

  beforeEach(inject(function($rootScope, $compile, $timeout, CsUndoModel) {
    timeout = $timeout;
    scope = $rootScope.$new();

    element = $compile('<cs-start-over-button-with-model></cs-start-over-button-with-model>')(scope);
    scope = element.scope();
    scope.undoModel = new CsUndoModel();
  }));

  describe('ng-click', function() {
    it('triggers undoModel.startOver', function() {
      spyOn(scope.undoModel, 'startOver');
      $(element).click();
      expect(scope.undoModel.startOver).toHaveBeenCalled();
    });

    it('triggers startOver when it is declared in scope', function() {
      scope.startOver = jasmine.createSpy("startOver");
      spyOn(scope.undoModel, 'startOver');
      $(element).click();
      expect(scope.startOver).toHaveBeenCalled();
      expect(scope.undoModel.startOver).not.toHaveBeenCalled();
    });

  });


});
