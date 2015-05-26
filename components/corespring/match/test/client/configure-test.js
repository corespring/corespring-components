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
        {
          numberOfCorrect: 1,
          scorePercentage: 10
        },
        {
          numberOfCorrect: 2,
          scorePercentage: 20
        },
        {
          numberOfCorrect: 3,
          scorePercentage: 30
        },
        {
          numberOfCorrect: 4,
          scorePercentage: 40
        }
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

  function fakeEvent() {
    return {
      stopPropagation: function() {},
      preventDefault: function() {}
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

  function MockImageUtils() {}

  function MockWiggiMathJaxFeatureDef() {}

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ImageUtils', MockImageUtils);
      $provide.value('WiggiMathJaxFeatureDef', MockWiggiMathJaxFeatureDef);
      $provide.value('WiggiLinkFeatureDef', function() {});
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
    element = element.find('.config-corespring-match');
    scope = element.scope().$$childHead;
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
      var correctRow = _.find(scope.fullModel.correctResponse, {
        id: row.id
      });
      expect(correctRow).toBeDefined();
      var matchSet = correctRow.matchSet;
      expect(matchSet).toEqual([false, false]);
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
      var rowOne = _.find(scope.fullModel.correctResponse, {
        id: 'row-1'
      });
      expect(rowOne).toBeDefined();
      scope.removeRow(0);
      rowOne = _.find(scope.fullModel.correctResponse, {
        id: 'row-1'
      });
      expect(rowOne).toBeUndefined();
    });

  });

  describe('activate', function() {
    it("activates the editor with the given id", function() {
      scope.activate(fakeEvent(), 4);
      expect(scope.active[4]).toBeTruthy();
    });

    it("deactivates the editor that was active before", function() {
      scope.activate(fakeEvent(), 4);
      expect(scope.active[4]).toBeTruthy();
      scope.activate(fakeEvent(), 5);
      expect(scope.active[4]).toBeFalsy();
    });
  });

  describe('onClickEdit', function() {
    it("activates the editor with the given id", function() {
      scope.onClickEdit(fakeEvent(), 4);
      expect(scope.active[4]).toBeTruthy();
    });
  });

  describe('deactivate', function() {
    it("deactivates the editor that is active", function() {
      scope.activate(fakeEvent(), 4);
      expect(scope.active[4]).toBeTruthy();
      scope.deactivate(fakeEvent());
      expect(scope.active[4]).toBeFalsy();
    });
  });

  describe('classForChoice', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });

    function assert(inputType, selected, expected) {
      scope.config.inputType = inputType;
      scope.matchModel.rows[0].matchSet[0].value = selected;
      var value = scope.classForChoice(scope.matchModel.rows[0], 0);
      expect(value).toEqual(expected, "for inputType,selected:" + [inputType, selected]);
    }

    it("returns correct classes", function() {
      assert("radiobutton", false, 'match-radiobutton input');
      assert("radiobutton", true, 'match-radiobutton input selected');
      assert("checkbox", false, 'match-checkbox input');
      assert("checkbox", true, 'match-checkbox input selected');
    });
  });

  describe('columnLabelUpdated', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });

    it('assigns label to model', function() {
      scope.matchModel.columns[0].labelHtml = 'Eins Zwei Drei';
      scope.columnLabelUpdated(0);
      expect(scope.model.columns[0].labelHtml).toEqual('Eins Zwei Drei');
    });

    it('removes size settings', function() {
      scope.matchModel.columns[0].labelHtml = '<div width="1px" height="2px" min-width="3px" min-height="4px" style="width:5px; min-width:6px; height:7px; min-height:8px; ">some text</div>';
      scope.columnLabelUpdated(0);
      expect(scope.model.columns[0].labelHtml).toEqual('<div style="">some text</div>');
    });

    it('does not remove other settings', function() {
      scope.matchModel.columns[0].labelHtml = '<div class="someClass" style="border:none;">some text</div>';
      scope.columnLabelUpdated(0);
      expect(scope.model.columns[0].labelHtml).toEqual('<div class="someClass" style="border:none;">some text</div>');
    });
  });

  describe('rowLabelUpdated', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });

    it('assigns label to model', function() {
      scope.matchModel.rows[0].labelHtml = 'Eins Zwei Drei';
      scope.rowLabelUpdated(0);
      expect(scope.model.rows[0].labelHtml).toEqual('Eins Zwei Drei');
    });

    it('removes size settings', function() {
      scope.matchModel.rows[0].labelHtml = '<div width="1px" height="2px" min-width="3px" min-height="4px" style="width:5px; min-width:6px; height:7px; min-height:8px; ">some text</div>';
      scope.rowLabelUpdated(0);
      expect(scope.model.rows[0].labelHtml).toEqual('<div style="">some text</div>');
    });

    it('does not remove other settings', function() {
      scope.matchModel.rows[0].labelHtml = '<div class="someClass" style="border:none;">some text</div>';
      scope.rowLabelUpdated(0);
      expect(scope.model.rows[0].labelHtml).toEqual('<div class="someClass" style="border:none;">some text</div>');
    });
  });

  describe('isRadioButton', function() {
    it('returns true if inputType is radiobutton', function() {
      expect(scope.isRadioButton('radiobutton')).toBeTruthy();
    });
    it('returns false if inputType is not radiobutton', function() {
      expect(scope.isRadioButton('something else')).toBeFalsy();
    });
  });

  describe('isCheckBox', function() {
    it('returns true if inputType is checkbox', function() {
      expect(scope.isCheckBox('checkbox')).toBeTruthy();
    });
    it('returns false if inputType is not checkbox', function() {
      expect(scope.isCheckBox('something else')).toBeFalsy();
    });
  });

  describe('onClickMatch', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });

    function row() {
      //the matchModel is updated after onClickMatch
      //so we cannot keep a referrence to the row but
      //need to get the row from there directly
      return scope.matchModel.rows[0];
    }

    describe('input type radio', function() {
      beforeEach(function() {
        scope.config.inputType = 'radiobutton';
      });
      it('selects one value if inputType is radio', function() {
        row().matchSet[0].value = false;
        row().matchSet[1].value = false;
        scope.onClickMatch(row(), 0);
        expect(_.pluck(row().matchSet, 'value')).toEqual([true, false]);
        scope.onClickMatch(row(), 1);
        expect(_.pluck(row().matchSet, 'value')).toEqual([false, true]);
      });

      it('selects corresponding values in correctResponse', function() {
        row().matchSet[0].value = false;
        row().matchSet[1].value = false;
        scope.onClickMatch(row(), 1);
        expect(_.pluck(row().matchSet, 'value')).toEqual([false, true]);
        expect(scope.fullModel.correctResponse[0].matchSet).toEqual([false, true]);
      });

    });

    describe('input type checkbox', function() {
      beforeEach(function() {
        scope.config.inputType = 'checkbox';
      });
      it('selects multiple values if inputType is checkbox', function() {
        row().matchSet[0].value = false;
        row().matchSet[1].value = false;
        scope.onClickMatch(row(), 0);
        expect(_.pluck(row().matchSet, 'value')).toEqual([true, false]);
        scope.onClickMatch(row(), 1);
        expect(_.pluck(row().matchSet, 'value')).toEqual([true, true]);
      });

      it('selects corresponding values in correctResponse', function() {
        row().matchSet[0].value = false;
        row().matchSet[1].value = false;
        scope.onClickMatch(row(), 0);
        scope.onClickMatch(row(), 1);
        expect(_.pluck(row().matchSet, 'value')).toEqual([true, true], 'in matchModel');
        expect(scope.fullModel.correctResponse[0].matchSet).toEqual([true, true], 'in correct response');
      });

    });
  });

  describe('setModel', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });
    it('sets fullModel', function() {
      expect(scope.fullModel).toBeDefined();
    });
    it('sets model', function() {
      expect(scope.model).toBeDefined();
      expect(scope.model).toBe(scope.fullModel.model);
    });
    it('sets config', function() {
      expect(scope.config).toBeDefined();
      expect(scope.config).toBe(scope.model.config);
    });

    it('creates matchModel', function() {
      expect(scope.matchModel).toBeDefined();
      expect(scope.matchModel.rows).toBeDefined();
      expect(scope.matchModel.rows.length).toEqual(4);
      expect(scope.matchModel.columns).toBeDefined();
      expect(scope.matchModel.columns.length).toEqual(3);
    });

    it('updates numberOfCorrectResponses', function() {
      expect(scope.numberOfCorrectResponses).toEqual(4);
    });
  });

  describe('config', function() {
    it('uses config if defined in  in model', function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      expect(scope.config).toEqual(testModel.model.config);
    });
    describe('if config not defined', function(){
      var testModel;
      beforeEach(function(){
        testModel = createTestModel();
        delete testModel.model.config;
      });
      describe('model updates', function(){
        it('removes answerType', function(){
          testModel.model.answerType = 'MULTIPLE';
          container.elements['1'].setModel(testModel);
          expect(scope.model.answerType).toBeUndefined();
        });
      });
      describe('config.inputType', function(){
        it('sets inputType radio if answerType is not defined', function() {
          container.elements['1'].setModel(testModel);
          expect(scope.config.inputType).toEqual('radiobutton');
        });
        it('sets inputType radio if answerType is anything else', function() {
          testModel.model.answerType = 'anything else';
          container.elements['1'].setModel(testModel);
          expect(scope.config.inputType).toEqual('radiobutton');
        });
        it('sets inputType checkbox if answerType is MULTIPLE', function() {
          testModel.model.answerType = 'MULTIPLE';
          container.elements['1'].setModel(testModel);
          expect(scope.config.inputType).toEqual('checkbox');
        });
      });
      describe('config.layout', function() {
        it('sets layout to three-columns if model has 3 columns', function () {
          expect(testModel.model.columns.length).toEqual(3);
          container.elements['1'].setModel(testModel);
          expect(scope.config.layout).toEqual('three-columns');
        });
        it('sets layout to three-columns if model has less than 3 columns', function () {
          testModel.model.columns.splice(0, 1);
          expect(testModel.model.columns.length).toEqual(2);
          container.elements['1'].setModel(testModel);
          expect(scope.config.layout).toEqual('three-columns');
        });
        it('sets layout to four-columns if model has 4 columns', function () {
          testModel.model.columns.push(testModel.model.columns[0]);
          expect(testModel.model.columns.length).toEqual(4);
          container.elements['1'].setModel(testModel);
          expect(scope.config.layout).toEqual('four-columns');
        });
        it('sets layout to five-columns if model has 5 columns', function () {
          testModel.model.columns.push(testModel.model.columns[0]);
          testModel.model.columns.push(testModel.model.columns[0]);
          expect(testModel.model.columns.length).toEqual(5);
          container.elements['1'].setModel(testModel);
          expect(scope.config.layout).toEqual('five-columns');
        });
        it('sets layout to five-columns if model has more than 5 columns', function () {
          testModel.model.columns.push(testModel.model.columns[0]);
          testModel.model.columns.push(testModel.model.columns[0]);
          expect(testModel.model.columns.length).toEqual(5);
          container.elements['1'].setModel(testModel);
          expect(scope.config.layout).toEqual('five-columns');
        });
      });
      describe('config.shuffle', function(){
        it('sets shuffle to false', function(){
          container.elements['1'].setModel(testModel);
          expect(scope.config.shuffle).toBe(false);
        });
      });
    });
  });

  describe('onChangeInputType', function(){
    it('setting inputType radio removes the correctAnswers but the first', function(){
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      scope.config.inputType = "checkbox";
      scope.fullModel.correctResponse[0].matchSet[0] = true;
      scope.fullModel.correctResponse[0].matchSet[1] = true;
      expect(scope.fullModel.correctResponse[0].matchSet[0]).toBe(true);
      expect(scope.fullModel.correctResponse[0].matchSet[1]).toBe(true);
      scope.onChangeInputType("radiobutton");
      rootScope.$digest();
      expect(scope.fullModel.correctResponse[0].matchSet[0]).toBe(true);
      expect(scope.fullModel.correctResponse[0].matchSet[1]).toBe(false);
    });
  });

  describe('onChangeLayout', function(){
    beforeEach(function(){
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });
    it('adds columns when switching from three to four', function(){
      expect(scope.matchModel.columns.length).toEqual(3);
      scope.onChangeLayout('four-columns');
      expect(scope.matchModel.columns.length).toEqual(4);
    });
    it('adds columns when switching from three to five', function(){
      expect(scope.matchModel.columns.length).toEqual(3);
      scope.onChangeLayout('five-columns');
      expect(scope.matchModel.columns.length).toEqual(5);
    });
    it('removes columns when switching from five to four', function(){
      scope.onChangeLayout('five-columns');
      expect(scope.matchModel.columns.length).toEqual(5);
      scope.onChangeLayout('four-columns');
      expect(scope.matchModel.columns.length).toEqual(4);
    });
    it('removes columns when switching from five to three', function(){
      scope.onChangeLayout('five-columns');
      expect(scope.matchModel.columns.length).toEqual(5);
      scope.onChangeLayout('three-columns');
      expect(scope.matchModel.columns.length).toEqual(3);
    });

  });

});