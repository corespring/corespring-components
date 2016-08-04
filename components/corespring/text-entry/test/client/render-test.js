describe('corespring:text-entry:render', function() {

  var testModel, scope, element, container, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      model: {}
    }
  };


  beforeEach(angular.mock.module('test-app'));
  /*
  function(){
    var module = angular.mock.module('test-app');
    module.config(['$provide', function($provide) {
      $provide.decorator('feedbackPopover', ['$delegate', function($delegate) {
        // drop the feedbackPopover directive all together
        $delegate[0].compile = function(){return angular.noop};
        return $delegate;
      }]);
    }]);
    return module;
  });
  */

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', {
        parseDomForMath: function() {}
      });
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-text-entry-render id='1'></corespring-text-entry-render>")($rootScope.$new());
    $.fn.popover = function() {};
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });


  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: "Hi"
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is set', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.answer = "Ho";
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('input restriction', function() {
    beforeEach(function() {
      scope.showInputWarning = jasmine.createSpy('showInputWarning');
      scope.hideInputWarning = jasmine.createSpy('hideInputWarning');
    });
    it('doesnt insert anything apart from numbers when allowIntegersOnly is set and shows warning when non-number is inserted', function() {
      var tm = _.merge(testModel, {
        data: {
          model: {
            allowIntegersOnly: true
          }
        }
      });
      container.elements['1'].setDataAndSession(tm);
      rootScope.$digest();
      element.find('input').val('a!@#$%^&*(123');
      element.find('input').trigger('change');
      rootScope.$digest();
      expect(scope.answer).toEqual('123');
      expect(scope.showInputWarning).toHaveBeenCalled();
    });
    it('allows - when allowNegative is true and allowIntegersOnly is set', function() {
      var tm = _.merge(testModel, {
        data: {
          model: {
            allowIntegersOnly: true,
            allowNegative: true
          }
        }
      });
      container.elements['1'].setDataAndSession(tm);
      rootScope.$digest();
      element.find('input').val('-123');
      element.find('input').trigger('change');
      rootScope.$digest();
      expect(scope.answer).toEqual('-123');
      expect(scope.showInputWarning).not.toHaveBeenCalled();
    });
    it('allows . when allowDecimal is true and allowIntegersOnly is set', function() {
      var tm = _.merge(testModel, {
        data: {
          model: {
            allowIntegersOnly: true,
            allowDecimal: true
          }
        }
      });
      container.elements['1'].setDataAndSession(tm);
      rootScope.$digest();
      element.find('input').val('12.3');
      element.find('input').trigger('change');
      rootScope.$digest();
      expect(scope.answer).toEqual('12.3');
      expect(scope.showInputWarning).not.toHaveBeenCalled();
    });
    it('allows , when allowSeparator is true and allowIntegersOnly is set', function() {
      var tm = _.merge(testModel, {
        data: {
          model: {
            allowIntegersOnly: true,
            allowSeparator: true
          }
        }
      });
      container.elements['1'].setDataAndSession(tm);
      rootScope.$digest();
      element.find('input').val('12,3');
      element.find('input').trigger('change');
      rootScope.$digest();
      expect(scope.answer).toEqual('12,3');
      expect(scope.showInputWarning).not.toHaveBeenCalled();
    });

  });

  describe('instructor data', function() {
    it('sets up popup with additional correct answer', function() {
      container.elements['1'].setDataAndSession(testModel);
      spyOn(container.elements['1'], 'setResponse');
      container.elements['1'].setInstructorData({
        correctResponses: {
          values: ["apple", "pear"]
        }
      });
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({
        feedback: {
          correctness: 'instructor',
          message: "<span class='answers-header'>Additional correct answers</span><ul class='additional-correct-answers'><li> <div class='cs-text-entry__response'>pear</div> </li></ul>"
        }
      });
    });
    it('should not crash when partialResponse.values is not an array', function() {
      container.elements['1'].setDataAndSession(testModel);
      spyOn(container.elements['1'], 'setResponse');
      container.elements['1'].setInstructorData({
        correctResponses: {
          values: ["apple", "pear"]
        },
        partialResponses: {}
      });
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({
        feedback: {
          correctness: 'instructor',
          message: "<span class='answers-header'>Additional correct answers</span><ul class='additional-correct-answers'><li> <div class='cs-text-entry__response'>pear</div> </li></ul>"
        }
      });
    });
    it('sets up popup with partially correct answers', function() {
      container.elements['1'].setDataAndSession(testModel);
      spyOn(container.elements['1'], 'setResponse');
      container.elements['1'].setInstructorData({
        correctResponses: {
          values: ["apple"]
        },
        partialResponses: {
          values: ["pear"]
        }
      });
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({
        feedback: {
          correctness: 'instructor',
          message: "<span class='answers-header'>Partially correct answers</span><ul class='partially-correct-answers'><li> <div class='cs-text-entry__response'>pear</div> </li></ul>"
        }
      });
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

    it('does get called when the answer is changed', function() {
      scope.answer = "Ho";
      rootScope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

  });

  describe('order of setMode/setResponse', function() {
    var response;

    beforeEach(function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();

      response = {
        correctness: 'incorrect',
        feedback: 'not good'
      };
    });

    function assertFeedback() {
      rootScope.$digest();
      expect(scope.feedback).toEqual('not good');
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

  describe('isInstructorResponse', function() {
    beforeEach(function() {
      container.elements['1'].setDataAndSession(testModel);
    });
    it('should return true when instructorResponse is set', function() {
      container.elements['1'].setInstructorData({
        correctResponses: {
          values: ["apple", "pear"]
        }
      });
      expect(scope.isInstructorResponse()).toBeTruthy();
    });
    it('should return false when instructorResponse is not set', function() {
      expect(scope.isInstructorResponse()).toBeFalsy();
    });
    it('should return false when feedback is not set', function() {
      container.elements['1'].setInstructorData({
        correctResponses: {
          values: ["apple", "pear"]
        }
      });
      scope.response.feedback = null;
      expect(scope.isInstructorResponse()).toBeFalsy();
    });
  });

});