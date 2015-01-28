describe('corespring', function() {

  var testModel, container, element, scope, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
    this.setDataAndSession = function(id, dataAndSession) {
      this.elements[id].setDataAndSession(dataAndSession);
    };
  };

  var testModelTemplate = {
    data: {
      model: {
        choices: [{
          label: "1",
          value: "1"
        }, {
          label: "2",
          value: "2"
        }, {
          label: "3",
          value: "3"
        }],
        config: {
          orientation: "vertical",
          shuffle: true,
          singleChoice: true
        }
      }
    }
  };


  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      var mockPopover = function() {
        return {
          on: function() {},
          popover: mockPopover
        };
      };
      $.fn.extend({
        popover: mockPopover
      });
      testModel = _.cloneDeep(testModelTemplate);

      $provide.value('MathJaxService', function() {});
    });

  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-inline-choice-render id='1'></corespring-inline-choice-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });

  describe('inline-choice correctResponse', function() {
    it("can deal with a string as correctResponse", function() {
      testModel.data.model.correctResponse = "2";
      container.setDataAndSession("1", testModel);
      rootScope.$digest();
      expect(scope.question.correctResponse).toEqual(["2"]);
    });
    it("can deal with an array as correctResponse", function() {
      testModel.data.model.correctResponse = ["1"];
      container.setDataAndSession("1", testModel);
      rootScope.$digest();
      expect(scope.question.correctResponse).toEqual(["1"]);
    });
  });


  describe('inline-choice render', function() {

    it('sets the session choice correctly', function() {

      testModel.session = {
        answers: '1'
      };

      container.setDataAndSession("1", testModel);
      rootScope.$digest();
      expect(_.pick(scope.selected, 'label', 'value')).toEqual({
        label: '1',
        value: '1'
      });
    });

    it('setting response shows correctness', function() {
      testModel.session = {
        answers: "1"
      };
      container.setDataAndSession("1", testModel);
      rootScope.$digest();

      var response = {
        "correctness": "incorrect",
        "score": 0,
        "feedback": {
          "1": {
            correct: false,
            feedback: "cccc"
          }
        }
      };
      container.elements['1'].setResponse(response);
      rootScope.$digest();

      var wrapper = $("<div/>");
      wrapper.append($(element));
      expect(wrapper.find(".incorrect").length).toBe(1);
    });

  });

});