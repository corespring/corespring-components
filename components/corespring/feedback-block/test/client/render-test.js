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

      scope = $rootScope.$new();
      element = $compile("<corespring-feedback-block-render id='1'></corespring-feedback-block-render>")(scope);
      rootScope = $rootScope;
    }));

    it('constructs', function() {
      expect(element).not.toBe(null);
    });

    it('shows feedback', function() {
      container.elements['1'].setResponse({
        feedback: "sampleFeedback",
        correctness: "correct"
      });
      expect(scope.$$childHead.feedback).toBe('sampleFeedback');
      expect(scope.$$childHead.correctClass).toBe('correct');
    });

    it('Shows feedback if present and the item is not editable', function() {
      rootScope.$digest();
      expect($(element).attr('class')).toContain("ng-hide");
      container.elements['1'].setResponse({
        feedback: "sampleFeedback",
        correctness: "correct"
      });
      container.elements['1'].editable(false);
      rootScope.$digest();
      expect($(element).attr('class')).not.toContain("ng-hide");

    });

    it('Does not show feedback if present and the item is editable', function() {
      rootScope.$digest();
      expect($(element).attr('class')).toContain("ng-hide");
      container.elements['1'].setResponse({
        feedback: "sampleFeedback",
        correctness: "correct"
      });
      container.elements['1'].editable(true);
      rootScope.$digest();
      expect($(element).attr('class')).toContain("ng-hide");
    });
  });
});
