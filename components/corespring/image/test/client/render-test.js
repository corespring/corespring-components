describe('corespring', function() {

  describe('feedback-block render', function() {

    var MockComponentRegister = function() {
      this.elements = {};
      this.registerComponent = function(id, bridge) {
        this.elements[id] = bridge;
      };
    };

    var element, scope, rootScope, container;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(inject(function($compile, $rootScope) {
      container = new MockComponentRegister();

      $rootScope.$on('registerComponent', function(event, id, obj) {
        container.registerComponent(id, obj);
      });

      element = $compile("<corespring-image-render id='1'></corespring-image-render>")($rootScope.$new());
      scope = element.scope();
      rootScope = $rootScope;
    }));

    it('constructs', function() {
      expect(element).not.toBe(null);
    });

  });
});
