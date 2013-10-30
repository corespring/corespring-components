describe('corespring', function () {



  var MockComponentRegister = function () {
      this.elements = {};
      this.registerComponent = function (id, bridge) {
        this.elements[id] = bridge;
      }
    };

  var testModelTemplate = {
      data: {
        model : {
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
    }
  }
  };


  beforeEach(angular.mock.module('test-app'));

  beforeEach(function () {
    module(function ($provide) {
      testModel = _.cloneDeep(testModelTemplate);
    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj){
      container.registerComponent(id,obj);
    });

    element = $compile("<corespring-inline-choice-render id='1'></corespring-inline-choice-render>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
  }));

  it('constructs', function () {
    expect(element).toNotBe(null);
  });


  describe('inline-choice render', function () {

    it('sets the session choice correctly', function(){

      testModel.session = {
        answer :  '1'
      };

      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(scope.answer.choice).toEqual({label: '1', value: '1'});

    });
  });

});
