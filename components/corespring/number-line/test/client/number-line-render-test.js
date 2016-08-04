describe('corespring:number-line:render', function() {

  var testModel, scope, element, container, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  function MockGraphHelper(){
    this.updateOptions = function(){};
    this.addHorizontalAxis = function(){};
    this.addVerticalAxis = function(){};
    this.clear = function(){};
    this.addMovablePoint = function(){};
    this.addMovableLineSegment = function(){};
    this.addMovableRay = function(){};
    this.redraw = function(){};
  }

  var testModelTemplate = {
    data: {
      "model": {
        "config": {
          "domain": [0, 20],
          "maxNumberOfPoints": 3,
          "tickFrequency": 20,
          "snapPerTick": 2,
          "showMinorTicks": true,
          "initialType": "PF",
          "exhibitOnly": false,
          "availableTypes": {
            "PF": true,
            "LEE": true,
            "LEF": true,
            "LFE": true,
            "LFF": true,
            "REP": true,
            "REN": true,
            "RFP": true,
            "RFN": true
          },
          "initialElements": [
            {
              "type": "point",
              "pointType": "full",
              "domainPosition": 3,
              "rangePosition": 0
            },
            {
              "type": "line",
              "domainPosition": 2,
              "rangePosition": 1,
              "size": 2,
              "leftPoint": "full",
              "rightPoint": "empty"
            },
            {
              "type": "ray",
              "domainPosition": 2,
              "rangePosition": 2,
              "pointType": "empty",
              "direction": "positive"
            }
          ]
        }
      }
    }
  };

  window.Raphael = function() {
    var mockRaphaelObject = function() {
      var that = {
        attr: function() {
          return that;
        },
        drag: function() {
          return that;
        },
        click: function() {
          return that;
        },
        mousedown: function() {
          return that;
        }
      };
      return that;
    };

    return {
      rect: mockRaphaelObject,
      circle: mockRaphaelObject,
      clear: function() {},
      path: mockRaphaelObject,
      text: mockRaphaelObject
    };
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', function() {});
      $provide.value('GraphHelper', MockGraphHelper);
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-number-line-render id='1'></corespring-number-line-render>")($rootScope.$new());
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });

  describe('answer changed handler', function() {
    var changeHandlerCalled = false;

    beforeEach(function(){
      changeHandlerCalled = false;
      container.elements['1'].answerChangedHandler(function (c) {
        changeHandlerCalled = true;
      });
      container.elements['1'].setDataAndSession(testModel);
      scope.$digest();
    });

    it('does not get called initially', function () {
      expect(changeHandlerCalled).toBe(false);
    });

    it('is called when new response gets added', function () {
      scope.response.push('resp');
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

    it('is called when response gets removed', function () {
      scope.response = _.initial(scope.response);
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });
  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: [{ type : 'point', pointType : 'full', domainPosition : 3, rangePosition : 0 }]
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.response = [{ type : 'point', pointType : 'full', domainPosition : 3, rangePosition : 0 }];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('instructor data', function() {
    it('should set up number line with correct answer', function() {
      container.elements['1'].setDataAndSession(testModel);
      spyOn(container.elements['1'],'setResponse');
      spyOn(container.elements['1'],'editable');
      container.elements['1'].setInstructorData({correctResponse: [{}, {}]});
      expect(container.elements['1'].editable).toHaveBeenCalledWith(false);
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({
        correctness: 'correct',
        feedback: {elements: [{isCorrect: true}, {isCorrect: true}]}
      });
    });
  });

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  describe('order of setMode/setResponse', function() {
    var response;

    beforeEach(function() {
      container.elements['1'].setDataAndSession(_.cloneDeep(testModel));
      rootScope.$digest();

      response = {correctness: 'correct', correctResponse: []};
    });

    function assertFeedback() {
      rootScope.$digest();
      expect(scope.serverResponse).toBeTruthy();
      expect(scope.correctModelDummyResponse).toBeTruthy();
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