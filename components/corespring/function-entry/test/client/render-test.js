describe('corespring', function() {

  describe('function-entry render', function() {

    var MockComponentRegister = function() {
      this.elements = {};
      this.registerComponent = function(id, bridge) {
        this.elements[id] = bridge;
      };
    };

    var MockMathJaxService = function() {
      this.parseDomForMath = function() {
      };
    };

    var element, scope, rootScope, container,testModel, testModelTemplate;

    testModelTemplate = {
      data: {
        model: {
          "choices": [
            {
              "label": "1",
              "value": "1"
            },
            {
              "label": "2",
              "value": "2"
            },
            {
              "label": "3",
              "value": "3"
            }
          ],
          "config": {
            "orientation": "vertical",
            "shuffle": true,
            "singleChoice": true
          }
        }
      }
    };

    beforeEach(angular.mock.module('test-app'));

    beforeEach(function() {
      module(function($provide) {
        testModel = _.cloneDeep(testModelTemplate);
        $provide.value('MathJaxService', MockMathJaxService);
      });
    });

    beforeEach(inject(function($compile, $rootScope) {
      container = new MockComponentRegister();

      $rootScope.$on('registerComponent', function(event, id, obj) {
        container.registerComponent(id, obj);
      });

      element = $compile("<corespring-function-entry-render id='1'></corespring-function-entry-render>")($rootScope.$new());
      scope = element.scope().$$childHead;
      rootScope = $rootScope;
    }));

    it('constructs', function() {
      expect(element).toNotBe(null);
    });

    it('sets model', function() {
      container.elements['1'].setDataAndSession({
        data: {model: {}},
        session:{answers:{}}
      });
      expect(scope.question).not.toBe(null);
      expect(scope.session).not.toBe(null);
      expect(scope.answer).not.toBe(null);
    });

    describe('tooltipText', function() {

      it('not empty if question is null', function () {
        scope.question = null;
        var result = scope.tooltipText();
        expect(result.length).not.toBe(0);
      });

      it('not empty if question.config is null', function () {
        scope.question = {config:null};
        var result = scope.tooltipText();
        expect(result.length).not.toBe(0);
      });

      it('not empty if question.config.showFormattingHelp is true', function () {
        scope.question = {config:{showFormattingHelp:true}};
        var result = scope.tooltipText();
        expect(result.length).not.toBe(0);
      });

      it('not empty if question.config.showFormattingHelp does not exist', function () {
        scope.question = {config:{}};
        var result = scope.tooltipText();
        expect(result.length).not.toBe(0);
      });

      it('empty if question.config.showFormattingHelp is false', function () {
        scope.question = {config:{showFormattingHelp:false}};
        var result = scope.tooltipText();
        expect(result.length).toBe(0);
      });
    });

  });
});
