describe('corespring', function () {

  describe('multiple-choice configure', function () {

    var MockCorespringContainer = function () {
      this.elements = {};
      this.registerConfigPanel = function (id, bridge) {
        console.info("Registering ", id, " => ", bridge);
        this.elements[id] = bridge;
      }
    };

    var element = null, scope;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(function () {
      module(function ($provide) {
        $provide.value('CorespringContainer', new MockCorespringContainer());
      });
    });

    beforeEach(inject(function ($compile, $rootScope) {
      scope = $rootScope.$new();
      element = $compile("<corespring-multiple-choice-configure id='1'></corespring-multiple-choice-configure>")(scope);
      scope = element.scope();
    }));

    it('constructs', function () {
      expect(element).toNotBe(null);
    });

    it('component is being registered by the container', function () {
      inject(function (CorespringContainer) {
        expect(CorespringContainer.elements['1']).toNotBe(undefined);
        expect(CorespringContainer.elements['2']).toBeUndefined();
      });
    });

    it('sets model', function () {
      inject(function (CorespringContainer) {
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
              "value": "1"
            },
            {
              "feedback": "4 to the floor",
              "value": "2"
            }
          ],
          "model": {
            "choices": [
              {
                "label": "1",
                "value": "1"
              },
              {
                "label": "2",
                "value": "2"
              }
            ],
            "config": {
              "orientation": "vertical",
              "shuffle": true,
              "singleChoice": true
            },
            "prompt": "Add your question here..."
          }
        };
        CorespringContainer.elements['1'].setModel(testModel);
        expect(scope.model.choices.length).toBe(2);

      });
    });


  });
});
