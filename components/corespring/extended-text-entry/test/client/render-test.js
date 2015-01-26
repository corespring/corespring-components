describe('corespring', function() {

  var testModel, scope, element, container, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      console.log("REGISTERING ", id);
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      model: {
        "config": {
        }
      }
    },
    session: {
      answers: "Little test text"
    }
  };


  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('MathJaxService', function() {
      });
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-extended-text-entry-render id='1'></corespring-extended-text-entry-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;

    testModel = _.cloneDeep(testModelTemplate);
  }));


  describe('extended text entry', function() {

    it('constructs', function() {
      expect(element).toBeDefined();
    });

    it('answer in session renders in text area', function() {
      expect(container.elements['1']).toBeDefined();
      container.elements['1'].setDataAndSession(testModel);
      scope.$digest();
      var text = $(element).find('textarea').val();
      expect(text).toBe("Little test text");
    });
  });
});
