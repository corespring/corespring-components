describe('corespring:line:configure', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  function createTestModel() {
    return {};
  }

  var element = null,
    scope, container = null,
    rootScope;

  beforeEach(angular.mock.module('test-app'));

  function MockImageUtils() {}

  function MockWiggiMathJaxFeatureDef() {}

  beforeEach(function() {
    module(function($provide) {
      $provide.value('WiggiLinkFeatureDef', function() {});
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
    scope.data = {
      defaultData: {
        model: {
          config: {}
        }
      }
    };
    element = $compile("<div navigator=''><corespring-line-configure id='1'></corespring-line-configure></div>")(scope);
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });

  describe('removeYEqualsPrefix', function() {

    it('should strip y= from beginning of a string', function() {
      expect(scope.removeYEqualsPrefix("y=2x+3")).toEqual("2x+3");
      expect(scope.removeYEqualsPrefix("y = 2x+3")).toEqual("2x+3");
    });

    it('should do nothing to a string not beginning with y=', function() {
      expect(scope.removeYEqualsPrefix("3x+2")).toEqual("3x+2");
    });

  });

  describe('prefixWithYEquals', function() {

    it('should add y= to the beginning of a string without y=', function() {
      expect(scope.prefixWithYEquals("4x+2")).toEqual("y=4x+2");
    });

    it('should not add y= to a string beginning with y=', function() {
      expect(scope.prefixWithYEquals("y=3x+6")).toEqual("y=3x+6");
      expect(scope.prefixWithYEquals("y = 3x+6")).toEqual("y = 3x+6");
    });

  });

});