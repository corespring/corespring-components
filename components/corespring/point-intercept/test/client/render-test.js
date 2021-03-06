describe('point-intercept', function() {

  var testModel, scope, rootScope, container, element;

  function Point() {
    this.on = jasmine.createSpy('on');
    this.X = jasmine.createSpy('x').and.returnValue(1);
    this.Y = jasmine.createSpy('y').and.returnValue(1);
    this.setAttribute = jasmine.createSpy('setAttribute');
  }

  window.JXG = {
    JSXGraph: {
      initBoard: function() {
        return {
          create: jasmine.createSpy('create').and.returnValue(new Point()),
          on: jasmine.createSpy('on').and.returnValue({})
        };
      }
    },
    Coords: function() {
      return {
        scrCoords: [0, 0],
        usrCoords: [0, 0]
      };
    }
  };

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      componentType: "corespring-point-intercept",
      title: "Point interaction sample",
      weight: 1,
      correctResponse: [
        "0,6",
        "-3,0"
      ],
      feedback: {
        correctFeedbackType: "default",
        incorrectFeedbackType: "default",
        partialFeedbackType: "default"
      },
      model: {
        config: {
          graphWidth: "300px",
          graphHeight: "300px",
          maxPoints: 2,
          pointLabels: [
            "label1",
            "label2"
          ],
          domainLabel: "domain",
          rangeLabel: "range"
        }
      }
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('$modal', {});
    })
  );

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-point-intercept-render id='1'></corespring-point-intercept-render>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });


  describe('setDataAndSession', function() {

    it('sets pointResponse', function() {
      var m = _.cloneDeep(testModel);
      m.session = {
        answers: ['1,0', '2,0']
      };
      container.elements[1].setDataAndSession(m);
      scope.$digest();
      expect(container.elements[1].getSession()).toEqual({
        answers: ['1,0', '2,0']
      });
    });
  });

  describe('feedback', function() {
    it('shows feedback by default', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      container.elements[1].setResponse({
        correctness: 'incorrect',
        feedback: 'not good'
      });
      scope.$digest();
      expect(scope.feedback).toEqual('not good');
      expect(element.find('.feedback-holder').hasClass('ng-hide')).toBe(false);
    });

    it('does not show feedback if showFeedback is false', function() {
      testModel.data.model.config.showFeedback = false;
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      container.elements[1].setResponse({
        correctness: 'incorrect',
        feedback: 'not good'
      });
      scope.$digest();
      expect(scope.feedback).toEqual('not good');
      expect(element.find('.feedback-holder').hasClass('ng-hide')).toBe(true);
    });

    it('graph outline has incorrect color if incorrect answer is submitted', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({
        correctness: 'incorrect',
        feedback: 'not good'
      });
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({
        graphStyle: {
          borderColor: '#EC971F',
          borderWidth: '2px'
        },
        pointsStyle: []
      });
    });

    it('graph outline has correct color if correct answer is submitted', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({
        correctness: 'correct',
        feedback: 'good'
      });
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({
        graphStyle: {
          borderColor: '#3c763d',
          borderWidth: '2px'
        },
        pointsStyle: '#3c763d'
      });
    });

    it('graph outline has warning color if no answer is submitted', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({
        correctness: 'warning',
        feedback: 'good'
      });
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({
        graphStyle: {
          borderColor: '#999',
          borderWidth: '2px'
        },
        pointsStyle: []
      });
    });
  });

  describe('pointsStyle', function() {
    it('graphs incorrect colors for incorrect response', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({
        correctness: 'warning',
        feedback: 'good',
        studentResponse: ['1,1'],
        correctResponse: ['1,2']
      });
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({
        graphStyle: {
          borderColor: '#999',
          borderWidth: '2px'
        },
        pointsStyle: ['#EC971F']
      });
    });

    it('graphs correct colors for correct response', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({
        correctness: 'warning',
        feedback: 'good',
        studentResponse: ['1,1'],
        correctResponse: ['1,1']
      });
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({
        graphStyle: {
          borderColor: '#999',
          borderWidth: '2px'
        },
        pointsStyle: ['#3c763d']
      });
    });

    it('graphs some correct/incorrect colors for mixed response', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({
        correctness: 'warning',
        feedback: 'good',
        studentResponse: ['1,1', '2,2'],
        correctResponse: ['0,0', '1,1']
      });
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({
        graphStyle: {
          borderColor: '#999',
          borderWidth: '2px'
        },
        pointsStyle: ['#3c763d', '#EC971F']
      });
    });

    it('graphs correct colors for order-independent correct response', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({
        correctness: 'warning',
        feedback: 'good',
        studentResponse: ['1,1', '0,0'],
        correctResponse: ['0,0', '1,1']
      });
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({
        graphStyle: {
          borderColor: '#999',
          borderWidth: '2px'
        },
        pointsStyle: ['#3c763d', '#3c763d']
      });
    });

    describe('config.orderMatters = true', function() {
      it('graphs incorrect colors for order-independent correct response', function() {
        container.elements[1].setDataAndSession(testModel);
        scope.config.orderMatters = true;
        scope.$digest();
        spyOn(scope, 'graphCallback');
        container.elements[1].setResponse({
          correctness: 'warning',
          feedback: 'good',
          studentResponse: ['1,1', '0,0'],
          correctResponse: ['0,0', '1,1']
        });
        scope.$digest();
        expect(scope.graphCallback).toHaveBeenCalledWith({
          graphStyle: {
            borderColor: '#999',
            borderWidth: '2px'
          },
          pointsStyle: ['#EC971F', '#EC971F']
        });
      });
    });

  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    xit('should return false if answer is set initially', function() {
      //Not sure how to set an initial value that
      //makes the component.isAnswerEmpty to return false
      testModel.session = {
        answers: ["0.1,0.6"]
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.pointResponse = ["0.1,0.6"];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('set instructor data', function() {
    it('set correct response in the graph and lock it', function() {
      spyOn(scope, "renewResponse");
      spyOn(scope, "lockGraph");
      spyOn(container.elements['1'], "setResponse");
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setInstructorData({
        correctResponse: ["0,0", "1,1"]
      });
      expect(scope.renewResponse).toHaveBeenCalledWith(['0,0', '1,1']);
      expect(scope.lockGraph).toHaveBeenCalled();
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({
        correctness: 'correct'
      });
    });
  });

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  describe('answer change callback', function() {
    var handler;

    beforeEach(function() {
      var model = _.cloneDeep(testModel);

      model.session = {
        answers: ['0,1', '0.2']
      };

      handler = jasmine.createSpy('handler');
      container.elements['1'].answerChangedHandler(handler);
      container.elements['1'].setDataAndSession(model);
      scope.$digest();
    });

    it('does not get called initially', function() {
      expect(handler).not.toHaveBeenCalled();
    });

    it('does get called when the answer is changed', function() {
      scope.pointResponse = ["0.1,0.6"];
      rootScope.$digest();
      expect(handler).toHaveBeenCalled();
    });

  });

  describe('undo', function() {
    /**
     * With every user interaction a point is added to the points array
     * This method simulates it by calling interactionCallback multiple times
     * eg addPoints(a,b,c) calls
     * interactionCallback(a);
     * interactionCallback(a, b);
     * interactionCallback(a, b, c);
     * @param points
     */
    function addPoints(points) {
      for (var i = 1; i <= points.length; i++) {
        scope.interactionCallback({
          points: points.slice(0, i)
        });
      }
    }

    beforeEach(function() {
      scope.graphCallback = jasmine.createSpy('graphCallback');
    });

    it('should be disabled initially', function() {
      expect(scope.undoModel.undoDisabled).toBe(true);
    });
    describe('one point', function() {
      beforeEach(function() {
        addPoints([{
          x: 1,
          y: 2
        }]);
      });
      it('should be enabled', function() {
        expect(scope.undoModel.undoDisabled).toBe(false);
      });
      it('should be disabled after undo', function() {
        scope.undoModel.undo();
        expect(scope.undoModel.undoDisabled).toBe(true);
      });
      it('should be disabled after startOver', function() {
        scope.undoModel.startOver();
        expect(scope.undoModel.undoDisabled).toBe(true);
      });
    });

    describe('multiple points', function() {
      beforeEach(function() {
        addPoints([{
          x: 1,
          y: 2
          }, {
          x: 3,
          y: 4
          }, {
          x: 5,
          y: 6
          }]);
      });
      it('should be enabled', function() {
        expect(scope.undoModel.undoDisabled).toBe(false);
      });
      it('should be enabled after one undo', function() {
        scope.undoModel.undo();
        expect(scope.undoModel.undoDisabled).toBe(false);
      });
      it('should be disabled after three undo', function() {
        scope.undoModel.undo();
        scope.undoModel.undo();
        scope.undoModel.undo();
        expect(scope.undoModel.undoDisabled).toBe(true);
      });
      it('should be disabled after startOver', function() {
        scope.undoModel.startOver();
        expect(scope.undoModel.undoDisabled).toBe(true);
      });
    });

    describe('model changes', function() {
      beforeEach(function() {
        addPoints([{
          x: 1,
          y: 2
          }, {
          x: 3,
          y: 4
          }]);
      });
      it('model should have two points initially', function() {
        expect(scope.points).toEqual([{
          x: 1,
          y: 2
        }, {
          x: 3,
          y: 4
        }]);
      });

      describe('undo', function() {
        it('should remove last point from scope.points', function() {
          scope.undoModel.undo();
          expect(scope.points).toEqual([{
            x: 1,
            y: 2
          }]);
        });

        it('should remove last point from scope.pointResponse', function() {
          scope.undoModel.undo();
          expect(scope.pointResponse).toEqual(['1,2']);
        });
      });

      describe('startOver', function() {
        it('should remove all points from scope.points', function() {
          scope.undoModel.startOver();
          expect(scope.points).toEqual({});
        });

        it('should remove all points from scope.pointResponse', function() {
          scope.undoModel.startOver();
          expect(scope.pointResponse).toEqual([]);
        });
      });
    });
  });

  describe('order of setMode/setResponse', function() {
    var response;

    beforeEach(function() {
      container.elements['1'].setDataAndSession(_.cloneDeep(testModel));
      rootScope.$digest();

      response = {correctness: 'incorrect', feedback: 'not good'};
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
});