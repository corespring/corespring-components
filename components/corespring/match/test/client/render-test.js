describe('corespring', function() {

  describe('match render', function() {

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
              "id": "1",
              "labelHtml": "Question text 1"
            },
            {
              "id": "2",
              "labelHtml": "Question text 2"
            },
            {
              "id": "3",
              "labelHtml": "Question text 3"
            },
            {
              "id": "4",
              "labelHtml": "Question text 4"
            }
          ],
          "answerType": "YES_NO"
        }
      }
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
      scope = element.scope().$$childHead;
      rootScope = $rootScope;
    }));

    it('constructs', function() {
      expect(element).toNotBe(null);
    });

    it('sets model', function() {
      container.elements['1'].setDataAndSession(testModel);
      expect(scope.question).toNotBe(null);
      expect(scope.inputType).toBe('radiobutton');
    });

    it('uses the column header if available', function(){
      container.elements['1'].setDataAndSession(testModel);
      expect(scope.matchModel.columns[1].labelHtml).toEqual('Column 1');
      expect(scope.matchModel.columns[2].labelHtml).toEqual('Column 2');
    });

    it('uses the default header if column header is empty', function(){
      testModel.data.model.columns[1].labelHtml = null;
      testModel.data.model.columns[2].labelHtml = '';
      container.elements['1'].setDataAndSession(testModel);
      expect(scope.matchModel.columns[1].labelHtml).toEqual('Yes');
      expect(scope.matchModel.columns[2].labelHtml).toEqual('No');
    });

    it('uses the default header if column does not exist', function(){
      testModel.data.model.columns = [];
      container.elements['1'].setDataAndSession(testModel);
      expect(scope.matchModel.columns[1].labelHtml).toEqual('Yes');
      expect(scope.matchModel.columns[2].labelHtml).toEqual('No');
    });

    it('builds the table correctly', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      var table = $(element).find('table');
      expect(table.length).toBe(5);
      expect(table.find('td').length).toBe(20);
    });

    it('selects correctly radio buttons', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      var row = scope.matchModel.rows[0];
      var matchSet = row.matchSet;
      scope.onClickMatch(row,0);
      rootScope.$digest();
      expect(matchSet[0].value).toBe(true);
      expect(matchSet[1].value).toBe(false);

      row = scope.matchModel.rows[1];
      scope.onClickMatch(row,1);
      matchSet = row.matchSet;
      rootScope.$digest();
      expect(matchSet[0].value).toBe(false);
      expect(matchSet[1].value).toBe(true);
    });


    it('returns session correctly', function() {
      var component =  container.elements['1'];
      component.setDataAndSession(testModel);
      rootScope.$digest();

      var row = scope.matchModel.rows[0];
      scope.onClickMatch(row,0);
      rootScope.$digest();

      var session = component.getSession();

      expect(session.answers.length).toBe(testModel.data.model.rows.length);
      expect(session.answers[0].id).toBe(testModel.data.model.rows[0].id);
      expect(session.answers[0].matchSet[0]).toBe(true);
      expect(session.answers[0].matchSet[1]).toBe(false);
    });

    describe('config', function(){

      function setModel(answerType, config, columns){
        testModel.data.model.answerType = answerType;
        testModel.data.model.config = config;
        if(columns){
          testModel.data.model.columns = columns;
        }
        var component =  container.elements['1'];
        component.setDataAndSession(testModel);
      }

      describe("sets inputType radiobutton", function(){
        it('if answerType is "YES_NO"', function(){
          setModel('YES_NO');
          expect(scope.inputType).toBe('radiobutton');
        });
        it('if answerType is "TRUE_FALSE"', function(){
          setModel('TRUE_FALSE');
          expect(scope.inputType).toBe('radiobutton');
        });
        it('if answerType is undefined', function(){
          setModel(undefined);
          expect(scope.inputType).toBe('radiobutton');
        });
        it('if config.inputType is Radio', function(){
          setModel(undefined, {inputType:'Radio'});
          expect(scope.inputType).toBe('radiobutton');
        });
      });

      describe("sets inputType checkbox", function(){
        it('if answerType is "MULTIPLE"', function(){
          setModel('MULTIPLE');
          expect(scope.inputType).toBe('checkbox');
        });
        it('if config.inputType is Checkbox', function(){
          setModel(undefined, {inputType:'Checkbox'});
          expect(scope.inputType).toBe('checkbox');
        });
      });

      describe("sets layout three-columns", function(){
        it('if config is "3 Columns"', function(){
          setModel(undefined, {layout: '3 Columns'});
          expect(scope.layout).toBe('three-columns');
        });
        it('if model has three columns', function(){
          setModel(undefined, undefined, [{}, {}, {}]);
          expect(scope.layout).toBe('three-columns');
        });
        it('if model has less than three columns', function(){
          setModel(undefined, undefined, [{}]);
          expect(scope.layout).toBe('three-columns');
        });
      });

      describe("sets layout four-columns", function(){
        it('if config is "4 Columns"', function(){
          setModel(undefined, {layout: '4 Columns'});
          expect(scope.layout).toBe('four-columns');
        });
        it('if model has four columns', function(){
          setModel(undefined, undefined, [{}, {}, {}, {}]);
          expect(scope.layout).toBe('four-columns');
        });
      });

      describe("sets layout five-columns", function(){
        it('if config is "5 Columns"', function(){
          setModel(undefined, {layout: '5 Columns'});
          expect(scope.layout).toBe('five-columns');
        });
        it('if model has five columns', function(){
          setModel(undefined, undefined, [{}, {}, {}, {}, {}]);
          expect(scope.layout).toBe('five-columns');
        });
        it('if model has more than five columns', function(){
          setModel(undefined, undefined, [{}, {}, {}, {}, {}, {}]);
          expect(scope.layout).toBe('five-columns');
        });
      });

      describe("sets shuffle", function(){
        it('to false if config undefined', function(){
          setModel(undefined, undefined);
          expect(scope.shuffle).toBe(false);
        });
        it('to false if config is defined and config.shuffle is false', function(){
          setModel(undefined, {shuffle: false});
          expect(scope.shuffle).toBe(false);
        });
        it('to true if config is defined and config.shuffle is true', function(){
          setModel(undefined, {shuffle: true});
          expect(scope.shuffle).toBe(true);
        });
      });

    });

  });
});
