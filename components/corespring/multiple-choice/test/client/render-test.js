describe('corespring:multiple-choice-render', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container, containerBridge;

  var testModel;

  var haveBeenCalledWith = [];

  var MockPopover = {
    fn: function(arg) {
      haveBeenCalledWith.push(arg);
      return MockPopover;
    },
    on: function(arg, callback) {
      callback();
      return MockPopover;
    }
  };

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
    $.fn.extend({
      popover: MockPopover.fn
    });

    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('ASSETS_PATH', '');
      $provide.value('MathJaxService', {
        parseDomForMath: jasmine.createSpy('parseDomForMath')
      });
    });
  });

  beforeEach(inject(function($compile, $rootScope, $httpBackend) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-multiple-choice-render id='1'></corespring-multiple-choice-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    spyOn(scope, '$emit').and.callThrough();
    rootScope = $rootScope;
    containerBridge = container.elements['1'];
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });

  it('sets model', function() {
    containerBridge.setDataAndSession(testModel);
    expect(scope.question).not.toBe(null);
    expect(scope.inputType).toBe('radio');
    expect(scope.choices).not.toBe(null);
    expect(scope.choices.length).toBe(3);
  });

  describe('shuffling', function() {

    beforeEach(function() {
      spyOn(scope, 'shuffle').and.callThrough();
      expect(testModel.data.model.config.shuffle).toBe(true);
    });

    it('shuffles when shuffle is true', function() {
      containerBridge.setDataAndSession(testModel);
      expect(scope.shuffle).toHaveBeenCalled();
    });

    it('shuffles every time when reset is called', function() {
      containerBridge.setDataAndSession(testModel);
      scope.shuffle.calls.reset();
      containerBridge.reset();
      containerBridge.reset();
      containerBridge.reset();
      expect(scope.shuffle.calls.count()).toEqual(3);
    });

    it('does not shuffle, when shuffle is false', function() {
      testModel.data.model.config.shuffle = false;
      containerBridge.setDataAndSession(testModel);
      expect(scope.shuffle).not.toHaveBeenCalled();
    });

    describe('stash', function(){

      it('does save order in session.stash', function() {
        containerBridge.setDataAndSession(testModel);
        var session = containerBridge.getSession();
        expect(_.isArray(session.stash.shuffledOrder)).toBe(true);
      });

      it('does emit saveStash', function() {
        containerBridge.setDataAndSession(testModel);
        expect(scope.$emit).toHaveBeenCalledWith("saveStash", "1", jasmine.any(Object));
      });

      it('does not shuffle, when session contains shuffledOrder', function(){
        testModel.session = {stash:{shuffledOrder:["3","2","1"]}};
        containerBridge.setDataAndSession(testModel);
        expect(scope.shuffle).not.toHaveBeenCalled();
      });

      it('does layout choices based on shuffledOrder', function(){
        testModel.session = {stash:{shuffledOrder:["3","2","1"]}};
        containerBridge.setDataAndSession(testModel);
        expect(_.map(scope.choices, _.property('value'))).toEqual(["3","2","1"]);
      });
    });
  });

  it('button is radio if choiceType is radio, checkbox if it is checkbox', function() {
    containerBridge.setDataAndSession(testModel);
    rootScope.$digest();
    expect($(element).find('div.radio-choice').length).toBe(3);
    testModel.data.model.config.choiceType = "checkbox";
    containerBridge.setDataAndSession(testModel);
    rootScope.$digest();
    expect($(element).find('div.checkbox-choice').length).toBe(3);
  });

  it('get answer returns selected answers', function() {
    containerBridge.setDataAndSession(testModel);
    scope.answer.choices['1'] = true;
    var answer = containerBridge.getSession();
    expect(answer.answers).toEqual(['1']);
  });

  it('setting answer updates the UI (single choice)', function() {

    testModel.session = {
      answers: ['1']
    };

    containerBridge.setDataAndSession(testModel);
    rootScope.$digest();

    expect($(element).find('div.radio-choice').length).toBe(3);
    expect($(element).find('.selected div.radio-choice').length).toBe(1);
  });

  it('setting answer updates the UI (multi choice)', function() {
    testModel.data.model.config.choiceType = "checkbox";

    testModel.session = {
      answers: ['1', '2']
    };

    containerBridge.setDataAndSession(testModel);
    rootScope.$digest();
    expect($(element).find('div.checkbox-choice').length).toBe(3);
    expect($(element).find('.selected div.checkbox-choice').length).toBe(2);
  });

  it('setting response shows correctness and feedback', function() {
    containerBridge.setDataAndSession(testModel);
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
    containerBridge.setResponse(response);
    rootScope.$digest();
    expect($(element).find(".choice-holder-background").length).toBe(3);
    expect($(element).find(".choice-holder-background.incorrect").length).toBe(1);
    expect($(element).find(".incorrect .choice-holder").length).toBe(1);
  });

  describe('instructor mode', function() {
    it('rationales are displayed if present', function() {
      containerBridge.setDataAndSession(testModel);
      containerBridge.setInstructorData(instructorData);
      expect(scope.rationales).toBeDefined();
      expect(scope.rationales.length).toEqual(3);
    });

    it('rationales are not displayed if not present', function() {
      var cloneInstructorData = _.cloneDeep(instructorData);
      delete cloneInstructorData.rationales;
      containerBridge.setDataAndSession(testModel);
      containerBridge.setInstructorData(cloneInstructorData);
      expect(scope.rationales).not.toBeDefined();
    });

    it('setting instructor data marks correct answers as correct in the model', function() {
      containerBridge.setDataAndSession(testModel);
      containerBridge.setInstructorData(instructorData);
      var correctChoice = _.find(scope.choices, function(c) {
        return c.value === '1';
      });
      expect(correctChoice.correct).toEqual(true);
      _(scope.choices).without(correctChoice).each(function(c) {
        expect(c.correct).not.toEqual(true);
      });
    });

    it('setting instructor data marks correct answers as correct in the view in instructor mode', function() {
      containerBridge.setDataAndSession(testModel);
      containerBridge.setMode('instructor');
      containerBridge.setInstructorData(instructorData);
      rootScope.$digest();
      expect($(element).find("[key='correct']").length).toBe(3);
      expect($(element).find("[key='correct'].ng-hide").length).toBe(2);
    });

    it('setting instructor data marks correct answers as correct in the view in instructor mode (other order)', function() {
      containerBridge.setDataAndSession(testModel);
      containerBridge.setInstructorData(instructorData);
      containerBridge.setMode('instructor');
      rootScope.$digest();
      expect($(element).find("[key='correct']").length).toBe(3);
      expect($(element).find("[key='correct'].ng-hide").length).toBe(2);
    });

  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      containerBridge.setDataAndSession(testModel);
      expect(containerBridge.isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: ['1']
      };
      containerBridge.setDataAndSession(testModel);
      rootScope.$digest();
      expect(containerBridge.isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      containerBridge.setDataAndSession(testModel);
      scope.answer.choices['1'] = true;
      expect(containerBridge.isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(containerBridge)).toBe('ok');
  });

  describe('answer change callback', function() {
    var changeHandlerCalled = false;

    beforeEach(function() {
      changeHandlerCalled = false;
      containerBridge.answerChangedHandler(function(c) {
        changeHandlerCalled = true;
      });
      containerBridge.setDataAndSession(testModel);
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

  describe('showCorrectAnswerButton', function() {
    beforeEach(function() {
      scope.answer = "anything";
      scope.question = {
        config: {}
      };
    });

    it('should be false initially', function() {
      expect(scope.showCorrectAnswerButton).toBe(false);
    });
    it('should be true when is correctness is incorrect"', function() {
      containerBridge.setResponse({
        correctness: 'incorrect',
        feedback: {}
      });
      expect(scope.showCorrectAnswerButton).toBe(true);
    });
    it('should be false when correctness is correct"', function() {
      containerBridge.setResponse({
        correctness: 'correct'
      });
      expect(scope.showCorrectAnswerButton).toBe(false);
    });
    it('should be false when response has warningClass "answer-expected"', function() {
      containerBridge.setResponse({
        correctness: 'incorrect',
        warningClass: 'answer-expected'
      });
      expect(scope.showCorrectAnswerButton).toBe(false);
    });
    it('should be false after reset"', function() {
      scope.showCorrectAnswerButton = true;
      containerBridge.reset();
      expect(scope.showCorrectAnswerButton).toBe(false);
    });
  });

  describe('letter', function() {
    beforeEach(function() {
      container.elements['1'].setDataAndSession(testModel);
    });
    it('should return a letter by default', function() {
      expect(scope.letter(1)).toBe('B');
    });
    it('should return a letter when choiceLabels is letters', function() {
      scope.question.config.choiceLabels = 'letters';
      expect(scope.letter(1)).toBe('B');
    });
    it('should return empty string when choiceLabels is none', function() {
      scope.question.config.choiceLabels = 'none';
      expect(scope.letter(1)).toBe('');
    });
    it('should return a number when choiceLabels is numbers', function() {
      scope.question.config.choiceLabels = 'numbers';
      expect(scope.letter(1)).toBe('2');
    });
  });
});