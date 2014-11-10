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
          "answerType": "MULTIPLE"
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
      expect(scope.inputType).toBe('checkbox');
    });

  it('builds the table correctly', function() {
    container.elements['1'].setDataAndSession(testModel);
    rootScope.$digest();
    var table = $(element).find('table');
    expect(table.length).toBe(1);
    expect(table.find('td').length).toBe(12);

  });
  });
});
