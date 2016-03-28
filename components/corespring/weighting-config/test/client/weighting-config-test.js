describe('corespring', function() {

  describe('weighting config', function() {

    var element, scope, rootScope, container;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(function() {
      module(function($provide) {});
    });

    beforeEach(inject(function($compile, $rootScope) {

      var $scope = $rootScope.$new();

      $scope.weightings = [
        {id:'aa_1', weight: 1},
        {id:'aa_2', weight: 1}
      ];
      $scope.categories = [
            {
              id: 'aa_1'
            },
            {
              id: 'aa_2'
            }
          ];
      $scope.allowWeighting = true;

      element = $compile([
        '<corespring-weighting-config ' +
        '   model="weightings"',
        '   categories="categories"',
        '   allow-weighting="allowWeighting"',
        '></corespring-weighting-config>'
      ].join(''))($scope);
      scope = element.isolateScope();
      rootScope = $rootScope;
      scope.$digest();
    }));

    it('scope', function() {
      expect(scope).toBeDefined();
    });

    describe('toggleWeighting', function() {
      it('should exist', function() {
        expect(scope.toggleWeighting).toBeDefined();
      });
      it('should toggle allowWeighting', function() {
        scope.allowWeighting = false;
        scope.toggleWeighting();
        scope.$digest();
        expect(scope.allowWeighting).toBe(true);
      });
      it('should not allow toggling weighting, if number of categories is 1 or less', function() {
        scope.categories.pop();
        scope.$digest();
        scope.allowWeighting = false;
        scope.toggleWeighting();
        scope.$digest();
        expect(scope.allowWeighting).toBe(false);
      });
    });
  });
});