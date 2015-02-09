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
    return {
      rect: function() {
      },
      circle: function() {
        return {drag: function() {}, click: function() {}, attr: function() {}};
      },
      clear: function() {
      },
      path: function() {
        var that ={
          attr: function() { return that; },
          drag: function() {},
          click: function() {},
          mousedown: function() {}
        };
        return that;
      },
      text: function() {
      }
    };
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

    element = $compile("<corespring-number-line-render id='1'></corespring-number-line-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });


  describe('number line', function() {

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
  });

});
