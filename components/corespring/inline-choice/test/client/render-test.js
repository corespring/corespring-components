describe('corespring:inline-choice', function() {

  var testModel, container, element, scope, rootScope;

  var MockComponentRegister = function () {
    this.elements = {};
    this.registerComponent = function (id, bridge) {
      this.elements[id] = bridge;
    };
    this.setDataAndSession = function (id, dataAndSession) {
      this.elements[id].setDataAndSession(dataAndSession);
    };

    this.setOutcomes = function (outcomes) {
      this.elements['1'].setResponse(outcomes['1']);
    };
  };

  var testModelTemplate = {
    data: {
      model: {
        choices: [
          {
            label: "1",
            value: "mc_1"
          },
          {
            label: "2",
            value: "mc_2"
          },
          {
            label: "3",
            value: "mc_3"
          }
        ],
        config: {
          orientation: "vertical",
          shuffle: true,
          singleChoice: true
        }
      }
    }
  };

  var instructorData = {
    correctResponse: "mc_1",
    rationales: [
      {
        choice: "mc_1",
        rationale: "rationale1"
      },
      {
        choice: "mc_2",
        rationale: "rationale2"
      },
      {
        choice: "mc_3",
        rationale: "rationale3"
      }
    ]
  };


  beforeEach(angular.mock.module('test-app'));

  beforeEach(function () {
    module(function ($provide) {
      var mockPopover = function () {
        return {
          on: function () {
            return this;
          },
          popover: mockPopover
        };
      };
      $.fn.extend({
        popover: mockPopover
      });
      testModel = _.cloneDeep(testModelTemplate);

      var mockMathJax = {
        on: function () {

        },
        parseDomForMath: function () {
        }
      };

      $provide.value('MathJaxService', mockMathJax);
    });

  });

  beforeEach(inject(function ($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function (event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-inline-choice-render id='1'></corespring-inline-choice-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function () {
    expect(element).not.toBe(null);
  });


  describe('inline-choice render', function () {
    it('sets the session choice correctly', function () {

      testModel.session = {
        answers: 'mc_1'
      };

      container.setDataAndSession("1", testModel);
      rootScope.$digest();
      expect(_.pick(scope.selected, 'label', 'value')).toEqual({
        label: '1',
        value: 'mc_1'
      });
    });

    it('setting response shows correctness', function () {
      testModel.session = {
        answers: "mc_1"
      };
      container.setDataAndSession("1", testModel);
      rootScope.$digest();

      var response = {
        "correctness": "incorrect",
        "score": 0,
        "feedback": {
          "mc_1": {
            correct: false,
            feedback: "cccc"
          }
        }
      };
      container.elements['1'].setResponse(response);
      rootScope.$digest();

      var wrapper = $("<div/>");
      wrapper.append($(element));
      expect(wrapper.find(".feedback-icon .incorrect").length).toBe(1);
    });


  });

  describe('isAnswerEmpty', function () {
    it('should return true initially', function () {
      container.elements['1'].setDataAndSession(testModel);
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function () {
      testModel.session = {
        answers: 'mc_1'
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function () {
      container.elements['1'].setDataAndSession(testModel);
      scope.selected = testModel.data.model.choices['1'];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('shuffle', function () {
    it('should shuffle options if shuffle is true', function () {
      spyOn(_, 'shuffle');
      container.elements['1'].setDataAndSession(testModel);
      expect(_.shuffle).toHaveBeenCalled();
    });

    it('shouldnt shuffle options if shuffle is false', function () {
      spyOn(_, 'shuffle');
      testModel.data.model.config.shuffle = false;
      container.elements['1'].setDataAndSession(testModel);
      expect(_.shuffle).not.toHaveBeenCalled();
    });

    it('should shuffle options if shuffle is true and the player is reset', function () {
      spyOn(_, 'shuffle');
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].reset();
      expect(_.shuffle).toHaveBeenCalled();
    });
  });

  describe('instructor mode', function() {
    it('setting instructor data selects correct answer and sets correctness to correct', function() {
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setInstructorData(instructorData);
      var correctChoice = _.find(scope.choices, function(c) { return c.value === 'mc_1';});
      expect(scope.selected).toEqual(correctChoice);
      expect(scope.response.correctness).toEqual('correct');
      expect(scope.instructorResponse.correctness).toEqual('instructor');
      expect(scope.instructorResponse.feedback).toContain('rationale1');
      expect(scope.instructorResponse.feedback).toContain('rationale2');
      expect(scope.instructorResponse.feedback).toContain('rationale3');
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  describe('feedback', function () {

    it('sets the correctness class on the directive', function () {
      container.setDataAndSession('1', testModel);
      scope.select(testModel.data.model.choices[0]);
      container.setOutcomes({
        '1': {
          correctness: 'correct'
        }
      });
      rootScope.$digest();
      expect(element.attr('class').indexOf('correct') !== -1).toBe(true);
      expect(element.find('.feedback-icon').size()).toBe(1);

    });

    describe('answer change callback', function () {
      var changeHandlerCalled = false;

      beforeEach(function () {
        changeHandlerCalled = false;
        container.elements['1'].answerChangedHandler(function (c) {
          changeHandlerCalled = true;
        });
        container.elements['1'].setDataAndSession(testModel);
        scope.$digest();
        scope.graphCallback = null; //avoid accessing the canvas
      });

      it('does not get called initially', function () {
        expect(changeHandlerCalled).toBe(false);
      });

      it('does get called when a point is selected', function () {
        scope.selected = testModel.data.model.choices['1'];
        scope.$digest();
        expect(changeHandlerCalled).toBe(true);
      });

    });

  });

  describe('order of setMode/setResponse', function() {
    var response;

    beforeEach(function() {
      container.elements['1'].setDataAndSession(_.cloneDeep(testModel));
      rootScope.$digest();

      response = {
        "correctness": "incorrect",
        "score": 0,
        "feedback": {
          "mc_1": {
            correct: false,
            feedback: "cccc"
          }
        }
      };
    });

    function assertFeedback() {
      rootScope.$digest();
      expect(_.find(scope.choices, {value:'mc_1'}).feedback).toBe('cccc');
    }

    it('should work when setMode is called before setResponse', function() {
      container.elements['1'].setMode('evaluate');
      container.elements['1'].setResponse(response);
      assertFeedback();
    });

    it('should work when setMode is called after setResponse', function() {
      container.elements['1'].setResponse(response);
      container.elements['1'].setMode('evaluate');
      assertFeedback();
    });
  });
});