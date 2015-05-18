describe('corespring:inline-choice', function() {

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
        choices: [
          {
            label: "1",
            value: "mc_1"
          },
          {
            label: "2",
            value: "mc_2"
          },
          {
            label: "3",
            value: "mc_3"
          }
        ],
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

  describe('inline-choice render', function() {
    it('sets the session choice correctly', function() {

      testModel.session = {
        answers: 'mc_1'
      };

      container.setDataAndSession("1", testModel);
      rootScope.$digest();
      expect(_.pick(scope.selected, 'label', 'value')).toEqual({
        label: '1',
        value: 'mc_1'
      });
    });

    it('setting response shows correctness', function() {
      testModel.session = {
        answers: "mc_1"
      };
      container.setDataAndSession("1", testModel);
      rootScope.$digest();

      var response = {
        "correctness": "incorrect",
        "score": 0,
        "feedback": {
          "mc_1": {
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

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: 'mc_1'
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.selected = testModel.data.model.choices['1'];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

});