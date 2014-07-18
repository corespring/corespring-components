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

    var testModel = {
      "componentType": "corespring-multiple-choice",
      "correctResponse": {
        "value": [
          "2"
        ]
      },
      "feedback": [
        {
          "feedback": "Huh?",
          "feedbackType": "custom",
          "value": "1"
        },
        {
          "feedback": "4 to the floor",
          "feedbackType": "custom",
          "value": "2"
        },
        {
          "feedbackType": "default",
          "value": "3"
        }
      ],
      "scoreMapping": {
        "1": 0,
        "2": 1,
        "3": -1
      },
      "model": {
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
    };

    beforeEach(angular.mock.module('test-app'));

    function MockImageUtils() {}
    function MockWiggiMathJaxFeatureDef() {}

    beforeEach(function() {
      module(function($provide) {
        $provide.value('ImageUtils', MockImageUtils);
        $provide.value('WiggiMathJaxFeatureDef', MockWiggiMathJaxFeatureDef);
      });
    });


    beforeEach(inject(function($compile, $rootScope) {
      scope = $rootScope.$new();
      container = new MockComponentRegister();

      $rootScope.$on('registerConfigPanel', function(ev, id, b) {
        container.registerConfigPanel(id, b);
      });

      $rootScope.registerConfigPanel = function(id, b) {
        container.registerConfigPanel(id, b);
      };
      element = $compile("<corespring-multiple-choice-configure id='1'></corespring-multiple-choice-configure>")(scope);
      scope = element.scope();
    }));

    it('constructs', function() {
      expect(element).toNotBe(null);
    });

    it('component is being registered by the container', function() {
      expect(container.elements['1']).toNotBe(undefined);
      expect(container.elements['2']).toBeUndefined();
    });

    it('component builds its internal model', function() {
      container.elements['1'].setModel(testModel);
      expect(scope.model.choices.length).toBe(3);
      expect(scope.feedback['1'].feedbackType).toBe('custom');
      expect(scope.feedback['1'].feedback).toBe('Huh?');
      expect(scope.feedback['2'].feedbackType).toBe('custom');
      expect(scope.feedback['2'].feedback).toBe('4 to the floor');
      expect(scope.feedback['3'].feedbackType).toBe('default');
      expect(scope.scoreMapping).toEqual({
        '1': '0',
        '2': '1',
        '3': '-1'
      });
    });

    it('component serializes model backwards', function() {
      container.elements['1'].setModel(testModel);
      var model = container.elements['1'].getModel();
      expect(model).not.toBe(null);
      expect(model.scoreMapping).not.toBe(null);
      expect(model.scoreMapping).toEqual({
        '1': 0,
        '2': 1,
        '3': -1
      });
      expect(model.feedback).not.toBe(null);
      expect(model.model).not.toBe(null);
    });


  });
});
