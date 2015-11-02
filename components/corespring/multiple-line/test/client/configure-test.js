describe('corespring:multiple-line:configure', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null,
    container = null,
    scope, rootScope;

  function createTestModel() {
    return {
      "title": "Graph Multiple Lines",
      "componentType" : "corespring-multiple-line",
      "weight" : 1,
      "minimumWidth": 500,
      "correctResponse": [],
      "allowPartialScoring": false,
      "partialScoring" : [
        {}
      ],
      "feedback" :  {
        "correctFeedbackType": "default",
        "partialFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "model" : {
        "config": {
          "graphTitle": "",
          "graphWidth": 500,
          "graphHeight": 500,
          "sigfigs": -1,
          "showCoordinates": true,
          "showInputs": true,
          "showAxisLabels": true,
          "showFeedback": true,
          "exhibitOnly": false,
          "domainLabel": "",
          "domainMin": -10,
          "domainMax": 10,
          "domainStepValue": 1,
          "domainSnapValue": 1,
          "domainLabelFrequency": 1,
          "domainGraphPadding": 50,
          "rangeLabel": "",
          "rangeMin": -10,
          "rangeMax": 10,
          "rangeStepValue": 1,
          "rangeSnapValue": 1,
          "rangeLabelFrequency": 1,
          "rangeGraphPadding": 50,
          "lines": [{ "id": 1, "equation": "", "intialLine": "", "label": "", "colorIndex": 0 }]
        }
      }
    };
  }

  function MockComponentDefaultData(){
    this.getDefaultData = function(){
      return {};
    };
  }

  var MockServerLogic = {
    load: function() {
      return {
        defaults: {},
        keys: {}
      };
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ComponentDefaultData', new MockComponentDefaultData());
      $provide.value('ServerLogic', MockServerLogic);
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    scope = $rootScope.$new();
    container = new MockComponentRegister();

    $rootScope.$on('registerConfigPanel', function(ev, id, b) {
      container.registerConfigPanel(id, b);
    });

    $rootScope.registerConfigPanel = function(id, b) {
      container.registerConfigPanel(id, b);
    };

    var link  = $compile("<div navigator=''><corespring-multiple-line-configure id='1'></corespring-multiple-line-configure></div>");
    element = link(scope);
    element = element.find('.multiple-line-interaction-configuration');
    scope = element.scope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });

  it('should add new lines', function() {
    var testModel = createTestModel();
    container.elements['1'].setModel(testModel);
    rootScope.$digest();

    scope.addNewLine();
    expect(scope.fullModel.model.config.lines.length).toBe(2);
  });

  it('should remove existing lines', function() {
    var testModel = createTestModel();
    container.elements['1'].setModel(testModel);
    rootScope.$digest();

    scope.removeLine(1);
    expect(scope.fullModel.model.config.lines.length).toBe(0);
  });

  it('should reset graph properties', function() {
    var testModel = createTestModel();
    container.elements['1'].setModel(testModel);
    rootScope.$digest();

    scope.resetCanvasGraphAttributes = jasmine.createSpy();
    scope.resetCanvasDisplayAttributes = jasmine.createSpy();

    scope.resetDefaults();
    expect(scope.resetCanvasGraphAttributes).toHaveBeenCalled();
    expect(scope.resetCanvasDisplayAttributes).toHaveBeenCalled();
  });

});
