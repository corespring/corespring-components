describe('corespring:multiple-choice-render', function() {

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

  var instructorData = {
    "correctResponse": {
      "value": "1"
    },
    rationales: [
      {
        choice: "1",
        rationale: "rationale1"
      },
      {
        choice: "2",
        rationale: "rationale2"
      },
      {
        choice: "3",
        rationale: "rationale3"
      }
    ]

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
    expect(element).not.toBe(null);
  });

  it('sets model', function() {
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.question).not.toBe(null);
    expect(scope.inputType).toBe('radio');
    expect(scope.choices).not.toBe(null);
    expect(scope.choices.length).toBe(3);
  });

  it('shuffles when shuffle is true', function() {
    spyOn(scope, 'shuffle');
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.shuffle).toHaveBeenCalled();
  });

  it('shuffles every time when reset is called', function() {
    container.elements['1'].setDataAndSession(testModel);
    spyOn(scope, 'shuffle');
    container.elements['1'].reset();
    container.elements['1'].reset();
    container.elements['1'].reset();
    expect(scope.shuffle).toHaveBeenCalledTimes(3);
  });

  it('stashes shuffledOrder', function() {
    var saveStashCallElementId;
    var saveStashCallData;
    scope.$on('saveStash', function(evt, id, data) {
      saveStashCallElementId = id;
      saveStashCallData = data;
    });
    container.elements['1'].setDataAndSession(testModel);
    expect(saveStashCallElementId).toEqual('1');
    expect(saveStashCallData.shuffledOrder).toContain('1');
    expect(saveStashCallData.shuffledOrder).toContain('2');
    expect(saveStashCallData.shuffledOrder).toContain('3');
  });

  it('does not shuffle when session contains stashOrder', function() {
    spyOn(scope, 'shuffle');
    testModel.session = {
      stash: {
        shuffledOrder: ["1", "2", "3"]
      }
    };
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.shuffle).not.toHaveBeenCalled();
  });

  it('does apply stashOrder to choices', function() {
    testModel.session = {
      stash: {
        shuffledOrder: ["3", "1", "2"]
      }
    };
    container.elements['1'].setDataAndSession(testModel);
    expect(_.map(scope.choices, _.property('value'))).toEqual(["3", "1", "2"]);
  });

  it('does not shuffle if shuffle is false', function() {
    spyOn(scope, 'shuffle');
    testModel.data.model.config.shuffle = false;
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.shuffle).not.toHaveBeenCalled();
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

  describe('instructor mode', function() {
    it('rationales are displayed if present', function() {
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setInstructorData(instructorData);
      expect(scope.rationales).toBeDefined();
      expect(scope.rationales.length).toEqual(3);
    });

    it('rationales are not displayed if not present', function() {
      var cloneInstructorData = _.cloneDeep(instructorData);
      delete cloneInstructorData.rationales;
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setInstructorData(cloneInstructorData);
      expect(scope.rationales).not.toBeDefined();
    });

    it('setting instructor data marks correct answers as correct in the model', function() {
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setInstructorData(instructorData);
      var correctChoice = _.find(scope.choices, function(c) {
        return c.value === '1';
      });
      expect(correctChoice.correct).toEqual(true);
      _(scope.choices).without(correctChoice).each(function(c) {
        expect(c.correct).not.toEqual(true);
      });
    });

    it('setting instructor data marks correct answers as correct in the view in instructor mdoe', function() {
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setInstructorData(instructorData);
      container.elements['1'].setMode('instructor');
      rootScope.$digest();
      expect($(element).find(".correct .choice-holder").length).toBe(2);
    });

  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: ['1']
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.answer.choices['1'] = true;
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  describe('answer change callback', function() {
    var changeHandlerCalled = false;

    beforeEach(function() {
      changeHandlerCalled = false;
      container.elements['1'].answerChangedHandler(function(c) {
        changeHandlerCalled = true;
      });
      container.elements['1'].setDataAndSession(testModel);
      scope.$digest();
    });

    it('does not get called initially', function() {
      expect(changeHandlerCalled).toBe(false);
    });

    it('does get called when a choice is selected', function() {
      scope.answer.choices['1'] = true;
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

  });
});