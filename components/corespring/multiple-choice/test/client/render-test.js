describe('corespring', function() {

  describe('multiple-choice render', function() {

    var MockComponentRegister = function() {
      this.elements = {};
      this.registerComponent = function(id, bridge) {
        this.elements[id] = bridge;
      };
    };

    var element, scope, rootScope, container;

    var testModel;

    var testModelTemplate = {
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
            "choiceType": "radio"
          }
        }
      }
    };

    beforeEach(angular.mock.module('test-app'));

    beforeEach(function() {
      module(function($provide) {
        testModel = _.cloneDeep(testModelTemplate);
      });
    });

    beforeEach(inject(function($compile, $rootScope) {
      container = new MockComponentRegister();

      $rootScope.$on('registerComponent', function(event, id, obj) {
        container.registerComponent(id, obj);
      });

      element = $compile("<corespring-multiple-choice-render id='1'></corespring-multiple-choice-render>")($rootScope.$new());
      scope = element.scope().$$childHead;
      rootScope = $rootScope;
    }));

    it('constructs', function() {
      expect(element).toNotBe(null);
    });

    it('sets model', function() {
      container.elements['1'].setDataAndSession(testModel);
      expect(scope.question).toNotBe(null);
      expect(scope.inputType).toBe('radio');
      expect(scope.choices).not.toBe(null);
      expect(scope.choices.length).toBe(3);
    });

    it('shuffles is shuffle is true', function() {
      spyOn(_, 'shuffle');
      container.elements['1'].setDataAndSession(testModel);
      expect(_.shuffle).toHaveBeenCalled();
    });

    it('doesnt shuffle is shuffle is false', function() {
      spyOn(_, 'shuffle');
      testModel.data.model.config.shuffle = false;
      container.elements['1'].setDataAndSession(testModel);
      expect(_.shuffle).not.toHaveBeenCalled();
    });

    it('button is radio if choiceType is radio, checkbox if it is checkbox', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect($(element).find('div.radio-choice').length).toBe(6);
      testModel.data.model.config.choiceType = "checkbox";
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect($(element).find('div.checkbox-choice').length).toBe(6);
    });

    it('get answer returns selected answers', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.answer.choices['1'] = true;
      var answer = container.elements['1'].getSession();

      expect(answer.answers).toEqual(['1']);
    });

    it('setting answer updates the UI (single choice)', function() {

      testModel.session = {
        answers: ['1']
      };

      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();

      expect($(element).find('div.radio-choice').length).toBe(6);
      expect($(element).find('.selected div.radio-choice').length).toBe(1);
    });

    it('setting answer updates the UI (multi choice)', function() {
      testModel.data.model.config.choiceType = "checkbox";

      testModel.session = {
        answers: ['1', '2']
      };

      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect($(element).find('div.checkbox-choice').length).toBe(6);
      expect($(element).find('.selected div.checkbox-choice').length).toBe(2);
    });

    it('setting response shows correctness and feedback', function() {
      container.elements['1'].setDataAndSession(testModel);
      var response = {
        "correctness": "correct",
        "score": 1,
        "feedback": [
          {
            "value": "1",
            "feedback": "yup",
            "correct": true
          },
          {
            "value": "2",
            "correct": true
          },
          {
            "value": "3",
            "correct": false
          }
        ]
      };
      container.elements['1'].setResponse(response);
      rootScope.$digest();
      expect($(element).find(".choice-holder.correct").length).toBe(2);
      expect($(element).find(".incorrect .choice-holder").length).toBe(1);
    });

  });
});
