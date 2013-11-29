describe('corespring', function () {

  describe('feedback-block render', function () {

    var MockComponentRegister = function () {
      this.elements = {};
      this.registerComponent = function (id, bridge) {
        this.elements[id] = bridge;
      }
    };

    var element, scope, rootScope, container;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(inject(function ($compile, $rootScope) {
      container = new MockComponentRegister();

      $rootScope.$on('registerComponent', function(event, id, obj){
        container.registerComponent(id,obj);
      });

      element = $compile("<corespring-feedback-block-render id='1'></corespring-feedback-block-render>")($rootScope.$new());
      scope = element.scope();
      rootScope = $rootScope;
    }));

    it('constructs', function () {
      expect(element).toNotBe(null);
    });

    it('shows feedback', function () {
      container.elements['1'].setResponse({feedback: "sampleFeedback", correctness: "correct"});
      expect(scope.feedback).toBe('sampleFeedback');
      expect(scope.correctClass).toBe('correct');
    });

    it('only shows feedback if present', function () {
      rootScope.$digest();
      expect($(element).attr('class')).toContain("ng-hide");
      container.elements['1'].setResponse({feedback: "sampleFeedback", correctness: "correct"});
      rootScope.$digest();
      expect($(element).attr('class')).not.toContain("ng-hide");
    });

  });
});
