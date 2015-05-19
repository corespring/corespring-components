describe('corespring', function() {

  var testModel, scope, element, container, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      "componentType": "corespring-graphic-gap-match",
      "title": "",
      "correctResponse": [
        {"id": "c1", "hotspot": "h1"},
        {"id": "c2", "hotspot": "h2"}
      ],
      "feedback": {
        "correctFeedbackType": "default",
        "partialFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "allowPartialScoring": true,
      "partialScoring" : [],
      "model": {
        "choices": [
          {
            "label": "C1",
            "id": "c1",
            "matchMax": 0
          },
          {
            "label": "Choice 2<br/>Choice 2<br/>Choice 2<br/>Choice 2<br/>Choice 2<br/>Choice 2<br/>Choice 2<br/>Choice 2<br/>Choice 2<br/>",
            "id": "c2",
            "matchMax": 1
          },
          {
            "label": "<img src='http://www.mattress-factory.co.uk/eCommerce/ProductImages/Small/CKS12060-02.jpg' />",
            "id": "c3",
            "matchMax": 2
          }
        ],
        "hotspots": [
          {
            "id": "h1",
            "shape": "rect",
            "coords": {
              "left": 20,
              "top":  20,
              "width": 100,
              "height": 100
            }
          },
          {
            "id": "h2",
            "shape": "rect",
            "coords": {
              "left": 20,
              "top":  140,
              "width": 100,
              "height": 100
            }
          }
        ],
        "config": {
          "backgroundImage": "map.png",
          "shuffle": true,
          "choiceAreaPosition": "top",
          "showHotspots": true
        }
      },
      "weight": 1
    }
  };


  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', function() {
      });
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-graphic-gap-match-render id='1'></corespring-graphic-gap-match-render>")($rootScope.$new());
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });


  describe('graphic gap match', function() {

    it('answer change handler does not get called initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      var changeHandlerCalled = false;
      container.elements['1'].answerChangedHandler(function(c) {
        changeHandlerCalled = true;
      });

      scope.$digest();
      expect(changeHandlerCalled).toBe(false);
    });

    describe('dragging choices', function() {

      var cloneChoice = function(choice) {
        return _.extend(_.cloneDeep(choice), {$$hashKey: undefined});
      };

      it('choice remains available to drag  any number of times if matchMax is 0', function() {
        container.elements['1'].setDataAndSession(testModel);
        scope.$digest();

        scope.dropChoice(scope.choices[0], cloneChoice(scope.choices[0]));
        scope.$digest();

        expect(scope.choices.length).toEqual(3);

        scope.dropChoice(scope.choices[0], cloneChoice(scope.choices[0]));
        scope.$digest();

        expect(scope.choices.length).toEqual(3);

        scope.dropChoice(scope.choices[0], cloneChoice(scope.choices[0]));
        scope.$digest();

        expect(scope.choices.length).toEqual(3);
      });

      it('if matchMax is 1 choice can be dragged exactly once', function() {
        container.elements['1'].setDataAndSession(testModel);
        scope.$digest();

        var choiceToDrag = scope.choices[1];
        scope.dropChoice(choiceToDrag, cloneChoice(choiceToDrag));
        scope.$digest();

        expect(scope.choices.length).toEqual(2);
        expect(_.contains(scope.choices, choiceToDrag)).toEqual(false);
      });

      it('if matchMax is 2 choice can be dragged exactly twice', function() {
        container.elements['1'].setDataAndSession(testModel);
        scope.$digest();

        var choiceToDrag = scope.choices[2];
        scope.dropChoice(choiceToDrag, cloneChoice(choiceToDrag));
        scope.$digest();
        expect(scope.choices.length).toEqual(3);
        expect(_.contains(_.pluck(scope.choices, 'id'), choiceToDrag.id)).toEqual(true);

        scope.dropChoice(choiceToDrag, cloneChoice(choiceToDrag));
        scope.$digest();
        expect(scope.choices.length).toEqual(2);
        expect(_.contains(_.pluck(scope.choices, 'id'), choiceToDrag.id)).toEqual(false);
      });
    });

    describe('undo / start over', function() {
      it('undo undoes move between choice area and image', function() {
        container.elements['1'].setDataAndSession(testModel);
        scope.$digest();
        var originalChoices = _.cloneDeep(scope.choices);
        var originalDroppedChoices = _.cloneDeep(scope.droppedChoices);
        scope.droppedChoices.push(scope.choices.pop());
        scope.$digest();
        scope.droppedChoices.push(scope.choices.pop());
        scope.$digest();

        scope.undo();
        scope.undo();

        expect(_.pluck(scope.choices, 'id')).toEqual(_.pluck(originalChoices, 'id'));
        expect(_.pluck(scope.droppedChoices, 'id')).toEqual(_.pluck(originalDroppedChoices, 'id'));
      });

      it('undo undoes move on the image', function() {
        container.elements['1'].setDataAndSession(testModel);
        scope.$digest();
        scope.droppedChoices.push(_.extend(scope.choices.pop(), {left: 100, top: 100}));
        scope.$digest();
        scope.droppedChoices[0].left = 150;
        scope.$digest();

        scope.undo();
        scope.$digest();

        expect(scope.droppedChoices[0].left).toEqual(100);
      });

      it('start over goes back to initial state', function() {
        container.elements['1'].setDataAndSession(testModel);
        scope.$digest();
        var originalChoices = _.cloneDeep(scope.choices);
        var originalDroppedChoices = _.cloneDeep(scope.droppedChoices);
        scope.droppedChoices.push(scope.choices.pop());
        scope.$digest();
        scope.droppedChoices.push(scope.choices.pop());
        scope.$digest();
        scope.startOver();
        scope.$digest();
        expect(_.pluck(scope.choices, 'id')).toEqual(_.pluck(originalChoices, 'id'));
        expect(_.pluck(scope.droppedChoices, 'id')).toEqual(_.pluck(originalDroppedChoices, 'id'));
      });
    });

  });

});
