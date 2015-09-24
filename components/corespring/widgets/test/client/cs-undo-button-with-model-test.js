describe('cs-undo-button-with-model', function() {

  var scope, element, timeout;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
    });
  });

  beforeEach(inject(function($rootScope, $compile, $timeout, CsUndoModel) {
    timeout = $timeout;
    scope = $rootScope.$new();

    element = $compile('<cs-undo-button-with-model></cs-undo-button-with-model>')(scope);
    scope = element.scope();
    scope.undoModel = new CsUndoModel();
  }));

  describe('ng-click', function() {
    it('triggers undoModel.undo', function() {
      spyOn(scope.undoModel, 'undo');
      $(element).click();
      expect(scope.undoModel.undo).toHaveBeenCalled();
    });

    it('triggers undo when it is declared in scope', function() {
      scope.undo = jasmine.createSpy('undo');
      spyOn(scope.undoModel, 'undo');
      $(element).click();
      expect(scope.undo).toHaveBeenCalled();
      expect(scope.undoModel.undo).not.toHaveBeenCalled();
    });

  });


});
