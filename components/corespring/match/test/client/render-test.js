describe('corespring:match:render', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container;

  var testModel;

  var testModelTemplate = {
    data: {
      "model": {
        "columns": [
          {
            "labelHtml": "Custom header"
            },
          {
            "labelHtml": "Column 1"
            },
          {
            "labelHtml": "Column 2"
            }
          ],
        "rows": [
          {
            "id": "row-1",
            "labelHtml": "Question text 1"
            },
          {
            "id": "row-2",
            "labelHtml": "Question text 2"
            },
          {
            "id": "row-3",
            "labelHtml": "Question text 3"
            },
          {
            "id": "row-4",
            "labelHtml": "Question text 4"
            }
          ],
        "answerType": "YES_NO"
      }
    }
  };

  var instructorData = {
    "correctResponse": [
      {
        "id": "row-1",
        "matchSet": [
          false,
          true
        ]
      },
      {
        "id": "row-2",
        "matchSet": [
          true,
          false
        ]
      },
      {
        "id": "row-3",
        "matchSet": [
          false,
          true
        ]
      },
      {
        "id": "row-4",
        "matchSet": [
          false,
          true
        ]
      }
    ]
  };


  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      console.log('registerComponent');
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-match-render id='1'></corespring-match-render>")($rootScope.$new());
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });

  it('sets model', function() {
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.question).not.toBe(null);
    expect(scope.inputType).toBe('radiobutton');
  });

  it('uses the column header if available', function() {
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.matchModel.columns[1].labelHtml).toEqual('');
    expect(scope.matchModel.columns[2].labelHtml).toEqual('');
  });

  it('uses the default header if column header is empty', function() {
    testModel.data.model.columns[1].labelHtml = null;
    testModel.data.model.columns[2].labelHtml = '';
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.matchModel.columns[1].labelHtml).toEqual('Yes');
    expect(scope.matchModel.columns[2].labelHtml).toEqual('No');
  });

  it('uses the default header if column does not exist', function() {
    testModel.data.model.columns = [];
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.matchModel.columns[1].labelHtml).toEqual('Yes');
    expect(scope.matchModel.columns[2].labelHtml).toEqual('No');
  });

  it('uses not show the header if its the default', function() {
    testModel.data.model.columns[0].labelHtml = 'Custom header';
    testModel.data.model.columns[1].labelHtml = 'Column 1';
    testModel.data.model.columns[2].labelHtml = 'Column 2';
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.matchModel.columns[0].labelHtml).toEqual('');
    expect(scope.matchModel.columns[1].labelHtml).toEqual('');
    expect(scope.matchModel.columns[2].labelHtml).toEqual('');
  });

  it('builds the table correctly', function() {
    container.elements['1'].setDataAndSession(testModel);
    rootScope.$digest();
    var table = $(element).find('table');
    expect(table.length).toBe(1);
    expect(table.find('td').length).toBe(16);
  });

  it('selects correctly radio buttons', function() {
    container.elements['1'].setDataAndSession(testModel);
    rootScope.$digest();
    var row = scope.matchModel.rows[0];
    var matchSet = row.matchSet;
    scope.onClickMatch(row, 0);
    rootScope.$digest();
    expect(matchSet[0].value).toBe(true);
    expect(matchSet[1].value).toBe(false);

    row = scope.matchModel.rows[1];
    scope.onClickMatch(row, 1);
    matchSet = row.matchSet;
    rootScope.$digest();
    expect(matchSet[0].value).toBe(false);
    expect(matchSet[1].value).toBe(true);
  });

  describe('tag filtering for labels', function() {
    it('removes size settings', function() {
      testModel.data.model.rows[0].labelHtml = '<div width="1px" height="2px" min-width="3px" min-height="4px" style="width:5px; min-width:6px; height:7px; min-height:8px; ">some text</div>';
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      var row = scope.matchModel.rows[0];
      expect(row.labelHtml).toEqual('<div style="">some text</div>');
    });

    it('does not remove other settings', function() {
      testModel.data.model.rows[0].labelHtml = '<div class="someClass" style="border:none;">some text</div>';
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      var row = scope.matchModel.rows[0];
      expect(row.labelHtml).toEqual('<div class="someClass" style="border:none;">some text</div>');
    });
  });

  it('returns session correctly', function() {
    var component = container.elements['1'];
    component.setDataAndSession(testModel);
    rootScope.$digest();

    var row = scope.matchModel.rows[0];
    scope.onClickMatch(row, 0);
    rootScope.$digest();

    var session = component.getSession();

    expect(session.answers.length).toBe(testModel.data.model.rows.length);
    expect(session.answers[0].id).toBe(testModel.data.model.rows[0].id);
    expect(session.answers[0].matchSet[0]).toBe(true);
    expect(session.answers[0].matchSet[1]).toBe(false);
  });

  describe('instructor mode', function() {
    it('setting instructor data marks correct answers as correct in the model', function() {
      spyOn(container.elements['1'], 'setResponse');
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setInstructorData(instructorData);
      var mappedCorrectResponse = _.cloneDeep(instructorData.correctResponse);
      _.each(mappedCorrectResponse, function(r) {
        r.matchSet = _.map(r.matchSet, function(m) {
          return {
            correctness: m ? 'correct' : '',
            value: m
          };
        });
      });

      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({
        correctness: 'correct',
        correctClass: 'correct',
        score: 1,
        feedback: undefined,
        correctnessMatrix: mappedCorrectResponse
      });
    });

  });

  describe('config', function() {

    function setModel(answerType, config, columns) {
      testModel.data.model.answerType = answerType;
      testModel.data.model.config = config;
      if (columns) {
        testModel.data.model.columns = columns;
      }
      var component = container.elements['1'];
      component.setDataAndSession(testModel);
    }

    describe("sets inputType radiobutton", function() {
      it('if answerType is "YES_NO"', function() {
        setModel('YES_NO');
        expect(scope.inputType).toBe('radiobutton');
      });
      it('if answerType is "TRUE_FALSE"', function() {
        setModel('TRUE_FALSE');
        expect(scope.inputType).toBe('radiobutton');
      });
      it('if answerType is undefined', function() {
        setModel(undefined);
        expect(scope.inputType).toBe('radiobutton');
      });
      it('if config.inputType is Radio', function() {
        setModel(undefined, {
          inputType: 'Radio'
        });
        expect(scope.inputType).toBe('radiobutton');
      });
    });

    describe("sets inputType checkbox", function() {
      it('if answerType is "MULTIPLE"', function() {
        setModel('MULTIPLE');
        expect(scope.inputType).toBe('checkbox');
      });
      it('if config.inputType is Checkbox', function() {
        setModel(undefined, {
          inputType: 'Checkbox'
        });
        expect(scope.inputType).toBe('checkbox');
      });
    });

    describe("sets layout three-columns", function() {
      it('if config is "3 Columns"', function() {
        setModel(undefined, {
          layout: '3 Columns'
        });
        expect(scope.layout).toBe('three-columns');
      });
      it('if model has three columns', function() {
        setModel(undefined, undefined, [{}, {}, {}]);
        expect(scope.layout).toBe('three-columns');
      });
      it('if model has less than three columns', function() {
        setModel(undefined, undefined, [{}]);
        expect(scope.layout).toBe('three-columns');
      });
    });

    describe("sets layout four-columns", function() {
      it('if config is "4 Columns"', function() {
        setModel(undefined, {
          layout: '4 Columns'
        });
        expect(scope.layout).toBe('four-columns');
      });
      it('if model has four columns', function() {
        setModel(undefined, undefined, [{}, {}, {}, {}]);
        expect(scope.layout).toBe('four-columns');
      });
    });

    describe("sets layout five-columns", function() {
      it('if config is "5 Columns"', function() {
        setModel(undefined, {
          layout: '5 Columns'
        });
        expect(scope.layout).toBe('five-columns');
      });
      it('if model has five columns', function() {
        setModel(undefined, undefined, [{}, {}, {}, {}, {}]);
        expect(scope.layout).toBe('five-columns');
      });
      it('if model has more than five columns', function() {
        setModel(undefined, undefined, [{}, {}, {}, {}, {}, {}]);
        expect(scope.layout).toBe('five-columns');
      });
    });

    describe('sets shuffle', function() {
      it('to false if config undefined', function() {
        setModel(undefined, undefined);
        expect(scope.shuffle).toBe(false);
      });
      it('to false if config is defined and config.shuffle is false', function() {
        setModel(undefined, {
          shuffle: false
        });
        expect(scope.shuffle).toBe(false);
      });
      it('to true if config is defined and config.shuffle is true', function() {
        setModel(undefined, {
          shuffle: true
        });
        expect(scope.shuffle).toBe(true);
      });
    });

  });

  describe('classForChoice', function() {

    function assert(editable, inputType, selected, correct, expected) {
      container.elements['1'].setDataAndSession(testModel);

      scope.editable = editable;
      scope.inputType = inputType;
      scope.matchModel.rows[0].matchSet[0].value = selected;
      scope.matchModel.rows[0].matchSet[0].correct = correct;

      expect(scope.classForChoice(scope.matchModel.rows[0], 0)).toEqual(expected);
    }

    describe('if editable is true', function() {
      it('should return inputs', function() {
        assert(true, 'radiobutton', false, false, 'match-radiobutton input');
        assert(true, 'radiobutton', true, false, 'match-radiobutton input selected');
        assert(true, 'checkbox', false, false, 'match-checkbox input');
        assert(true, 'checkbox', true, false, 'match-checkbox input selected');
      });
    });

    describe('if editable is false', function() {
      it('should return evaluated inputs', function() {
        assert(false, 'radiobutton', false, 'correct', 'match-radiobutton correct checked');
        assert(false, 'radiobutton', true, 'correct', 'match-radiobutton correct checked');
        assert(false, 'radiobutton', false, 'incorrect', 'match-radiobutton incorrect');
        assert(false, 'radiobutton', true, 'incorrect', 'match-radiobutton incorrect');
        assert(false, 'radiobutton', false, 'something', 'match-radiobutton unknown');
        assert(false, 'radiobutton', true, 'unknown', 'match-radiobutton unknown');

        assert(false, 'checkbox', false, 'correct', 'match-checkbox correct checked');
        assert(false, 'checkbox', true, 'correct', 'match-checkbox correct checked');
        assert(false, 'checkbox', false, 'incorrect', 'match-checkbox incorrect');
        assert(false, 'checkbox', true, 'incorrect', 'match-checkbox incorrect');
        assert(false, 'checkbox', false, 'something', 'match-checkbox unknown');
        assert(false, 'checkbox', true, 'unknown', 'match-checkbox unknown');
      });
    });
  });

  describe('classForSolution', function() {

    function assert(inputType, selected, expected) {
      container.elements['1'].setDataAndSession(testModel);

      scope.editable = false;
      scope.inputType = inputType;
      scope.matchModel.rows[0].matchSet[0].value = selected;

      expect(scope.classForSolution(scope.matchModel.rows[0], 0)).toEqual(expected);
    }

    it('should return nothing before response is set', function() {
      assert('radiobutton', false, '');
    });

    it('should return checked if user has selected the correct answer', function() {
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setResponse({
        correctResponse: [{
          id: 'row-1',
          matchSet: [true, false]
        }]
      });
      assert('radiobutton', true, 'match-radiobutton correct checked');
      assert('checkbox', true, 'match-checkbox correct checked');
    });

    it('should return no checked if user has not selected the correct answer', function() {
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setResponse({
        correctResponse: [{
          id: 'row-1',
          matchSet: [true, false]
        }]
      });
      assert('radiobutton', false, 'match-radiobutton correct');
      assert('checkbox', false, 'match-checkbox correct');
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
        answers: [
          {
            id: "row-1",
            matchSet: [true, false]
          },
          {
            id: "row-2",
            matchSet: [false, false]
          },
          {
            id: "row-3",
            matchSet: [false, false]
          },
          {
            id: "row-4",
            matchSet: [false, false]
          }
        ]
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      scope.matchModel.rows[0].matchSet[0].value = true;
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

});