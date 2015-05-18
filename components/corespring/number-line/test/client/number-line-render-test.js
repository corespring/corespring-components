describe('corespring:number-line:render', function() {

  var testModel, scope, element, container, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

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
              "rangePosition": 1
            },
            {
              "type": "line",
              "domainPosition": 2,
              "rangePosition": 2,
              "size": 2,
              "leftPoint": "full",
              "rightPoint": "empty"
            },
            {
              "type": "ray",
              "domainPosition": 2,
              "rangePosition": 3,
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
    expect(element).toNotBe(null);
  });


  it('answer change handler does not get called initially', function() {
    container.elements['1'].setDataAndSession(testModel);
    var changeHandlerCalled = false;
    container.elements['1'].answerChangedHandler(function(c) {
      changeHandlerCalled = true;
    });

    scope.$digest();
    expect(changeHandlerCalled).toBe(false);
  });

  it('answer change handler gets called when new response gets added', function() {
    container.elements['1'].setDataAndSession(testModel);
    var changeHandlerCalled = false;
    container.elements['1'].answerChangedHandler(function(c) {
      changeHandlerCalled = true;
    });
    scope.$digest();
    scope.response.push('resp');
    scope.$digest();
    expect(changeHandlerCalled).toBe(true);
  });

  it('answer change handler gets called when response gets removed', function() {
    container.elements['1'].setDataAndSession(testModel);
    var changeHandlerCalled = false;
    container.elements['1'].answerChangedHandler(function(c) {
      changeHandlerCalled = true;
    });
    scope.$digest();
    scope.response = _.initial(scope.response);
    scope.$digest();
    expect(changeHandlerCalled).toBe(true);
  });

  describe('isAnswerEmpty', function() {
    xit('should return true initially', function() {
      //It is not clear what an empty answer should look like
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].getSession()).toBe(true);
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

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });
});