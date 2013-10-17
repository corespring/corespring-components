describe('corespring', function () {

  describe('multiple-choice render', function () {

    var MockCorespringContainer = function () {
      this.elements = {};
      this.register = function (id, bridge) {
        this.elements[id] = bridge;
      }
    };

    var element, scope, rootScope, container;

    var testModel, testModelTemplate = {
      "choices": [
        {
          "label": "1",
          "value": "1"
        },
        {
          "label": "2",
          "value": "2"
        },
        {
          "label": "3",
          "value": "3"
        }
      ],
      "config": {
        "orientation": "vertical",
        "shuffle": true,
        "singleChoice": true
      },
      "prompt": "Add your question here..."
    };

    beforeEach(angular.mock.module('test-app'));

    beforeEach(function () {
      module(function ($provide) {
        $provide.value('CorespringContainer', new MockCorespringContainer());
        testModel = _.cloneDeep(testModelTemplate);
      });
    });

    beforeEach(inject(function ($compile, $rootScope, CorespringContainer) {
      element = $compile("<corespring-multiple-choice-render id='1'></corespring-multiple-choice-render>")($rootScope.$new());
      scope = element.scope();
      rootScope = $rootScope;
      container = CorespringContainer;
    }));

    it('constructs', function () {
      expect(element).toNotBe(null);
    });

    it('sets model', function () {
      container.elements['1'].setModel(testModel);
      expect(scope.question).toNotBe(null);
      expect(scope.inputType).toBe('radio');
      expect(scope.choices).not.toBe(null);
      expect(scope.choices.length).toBe(3);
    });

    it('shuffles is shuffle is true', function () {
      spyOn(_, 'shuffle');
      container.elements['1'].setModel(testModel);
      expect(_.shuffle).toHaveBeenCalled();
    });

    it('doesnt shuffle is shuffle is false', function () {
      spyOn(_, 'shuffle');
      testModel.config.shuffle = false;
      container.elements['1'].setModel(testModel);
      expect(_.shuffle).not.toHaveBeenCalled();
    });

    it('button is radio if singleChoice is true, checkbox if it is false', function () {
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      expect($(element).find('input[type="radio"]').length).toBe(3);
      testModel.config.singleChoice = false;
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      expect($(element).find('input[type="checkbox"]').length).toBe(3);
    });



  });

});
