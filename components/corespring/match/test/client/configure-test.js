describe('corespring:match:configure', function() {

  "use strict";

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
      componentType: "corespring-match",
      title: "Match component sample item",
      weight: 4,
      correctResponse: [
        {
          id: "row-1",
          matchSet: [true, false]
            },
        {
          id: "row-2",
          matchSet: [true, false]
            },
        {
          id: "row-3",
          matchSet: [true, false]
            },
        {
          id: "row-4",
          matchSet: [true, false]
            }
          ],
      allowPartialScoring: true,
      partialScoring: [
        {numberOfCorrect: 1, scorePercentage: 10},
        {numberOfCorrect: 2, scorePercentage: 20},
        {numberOfCorrect: 3, scorePercentage: 30},
        {numberOfCorrect: 4, scorePercentage: 40}
      ],
      feedback: {
        correctFeedbackType: "default",
        partialFeedbackType: "default",
        incorrectFeedbackType: "custom",
        incorrectFeedback: " <span mathjax=\"\">\\(\\frac12\\)</span> Everything is wrong !"
      },
      model: {
        columns: [
          {
            labelHtml: "Custom header"
              },
          {
            labelHtml: "Column 1"
              },
          {
            labelHtml: "Column 2"
              }
            ],
        rows: [
          {
            id: "row-1",
            labelHtml: "Question text 1"
              },
          {
            id: "row-2",
            labelHtml: "Question text 2"
              },
          {
            id: "row-3",
            labelHtml: "Question text 3"
              },
          {
            id: "row-4",
            labelHtml: "Question text 4"
              }
            ],
        config: {
          inputType: 'radiobutton',
          shuffle: false,
          layout: 'three-columns'
        }
      }
    };
  }

  beforeEach(angular.mock.module('test-app'));

  var MockServerLogic = {
    load: function() {
      return {
        defaults: {},
        keys: {}
      };
    }
  };

  function MockImageUtils() {}

  function MockWiggiMathJaxFeatureDef() {}

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ImageUtils', MockImageUtils);
      $provide.value('WiggiMathJaxFeatureDef', MockWiggiMathJaxFeatureDef);
      $provide.value('WiggiLinkFeatureDef', function(){});
      $provide.value('LogFactory', {
        getLogger: function() {
          return {
            trace: function() {},
            log: function() {},
            debug: function() {},
            warn: function() {},
            error: function() {},
            fatal: function() {},
            info: function() {}
          };
        }
      });
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
    element = $compile("<div navigator=''><corespring-match-configure id='1'></corespring-match-configure></div>")(scope);
    scope = element.scope().$$childHead.$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });

  it('component is being registered by the container', function() {
    expect(container.elements['1']).toBeDefined();
    expect(container.elements['2']).toBeUndefined();
  });

  describe('partialScoring', function() {
    it('should automatically remove additional partial scoring scenarios after removing a correct choice', function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      expect(scope.fullModel.partialScoring.length).toEqual(3);
      scope.removeRow(0);
      rootScope.$digest();
      expect(scope.fullModel.partialScoring.length).toEqual(2);
    });
  });

  describe('addRow', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });

    it('should have four rows initially', function() {
      expect(scope.model.rows.length).toEqual(4);
    });

    it('should have five rows after addRow', function() {
      scope.addRow();
      expect(scope.model.rows.length).toEqual(5);
    });

    it('an empty correctResponse for the new row should have been added', function() {
      scope.addRow();
      var row = _.last(scope.model.rows);
      var correctRow = _.find(scope.fullModel.correctResponse, {id:row.id});
      expect(correctRow).toBeDefined();
      var matchSet = correctRow.matchSet;
      expect(matchSet).toEqual([false,false]);
    });

  });

  describe('removeRow', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });

    it('should have four rows initially', function() {
      expect(scope.model.rows.length).toEqual(4);
    });

    it('should have three rows after removeRow', function() {
      scope.removeRow(0);
      expect(scope.model.rows.length).toEqual(3);
    });

    it('the correctResponse for this row should also be removed', function() {
      var rowOne = _.find(scope.fullModel.correctResponse, {id:'row-1'});
      expect(rowOne).toBeDefined();
      scope.removeRow(0);
      rowOne = _.find(scope.fullModel.correctResponse, {id:'row-1'});
      expect(rowOne).toBeUndefined();
    });

  });

});