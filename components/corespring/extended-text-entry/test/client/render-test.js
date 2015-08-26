describe('corespring', function() {

  var testModel, scope, element, container, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
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
    scope = element.isolateScope();
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

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      testModel.session = {
        answers: ""
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: "Hi"
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is set', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.answer = "Ho";
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('instructor view', function() {
    it('set instructor data should show message', function() {
      container.elements['1'].setDataAndSession(testModel);
      container.elements['1'].setInstructorData({});
      rootScope.$digest();
      expect(scope.received).toEqual(true);
      expect(scope.answer).toEqual("Open Ended Answers are not automatically scored, no correct answer is defined.");
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });
});

