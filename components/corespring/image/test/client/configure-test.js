describe('corespring', function() {

  describe('multiple-choice configure', function() {

    var MockComponentRegister = function() {
      this.elements = {};
      this.registerConfigPanel = function(id, bridge) {
        this.elements[id] = bridge;
      };
    };

    var element = null,
      scope, container = null;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(inject(function($compile, $rootScope) {
      scope = $rootScope.$new();
      container = new MockComponentRegister();
      $rootScope.registerConfigPanel = function(id, b) {
        container.registerConfigPanel(id, b);
      };
      element = $compile("<corespring-image-configure id='1'></corespring-image-configure>")(scope);
      scope = element.scope();
    }));

    it('constructs', function() {
      expect(element).not.toBe(null);
    });

  });
});
