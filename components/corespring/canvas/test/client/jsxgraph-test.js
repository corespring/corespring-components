describe('corespring:canvas:jsxgraph', function() {

  var scope, element;
  var $compile,
      $rootScope;

  var JXG = {
    JSXGraph: {
      initBoard: function() {
        return {
          currentId: 1,
          create: function(elementType, parents, attributes) {
            if(elementType === 'point'){
              return {
                id: this.currentId,
                name: String.fromCharCode(64 + this.currentId++)
              };
            }
            return {};
          },
          removeObject: function() {},
          on: function() {}
        };
      }
    },
    Coords: function() { return {scrCoords: [1,0,0], usrCoords: [1,0,0]}; }
  };

  beforeEach(module(function($provide) {
    $provide.value('JXG', JXG);
    window.JXG = JXG;
  }));

  var config = {
    "graphTitle": "Custom",
    "graphWidth": 400,
    "graphHeight": 400,
    "sigfigs": 0,
    "showCoordinates": false,
    "showInputs": false,
    "showAxisLabels": false,
    "showFeedback": false,
    "exhibitOnly": true,
    "domainLabel": "Custom",
    "domainMin": -5,
    "domainMax": 5,
    "domainStepValue": 2,
    "domainSnapValue": 2,
    "domainLabelFrequency": 2,
    "domainGraphPadding": 25,
    "rangeLabel": "Custom",
    "rangeMin": -5,
    "rangeMax": 5,
    "rangeStepValue": 2,
    "rangeSnapValue": 2,
    "rangeLabelFrequency": 2,
    "rangeGraphPadding": 25
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, $compile, CanvasRenderScopeExtension) {
    scope = $rootScope.$new();
    new CanvasRenderScopeExtension().postLink(scope);
    var graphAttrs = scope.createGraphAttributes(config, 2);
    element = angular.element("<div id='graph-container' class='row-fluid graph-container'></div>");

    var graphContainer = element.find('.graph-container');
    graphContainer.attr(graphAttrs);
    element = $compile(graphContainer)(scope);
    scope.$digest();
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });
});