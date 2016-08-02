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

  function MockWiggiMathJaxFeatureDef() {}

  function MockComponentDefaultData(){
    this.getDefaultData = function(){
      return {};
    };
  }

  beforeEach(function() {
    module(function($provide) {
      $provide.value('WiggiLinkFeatureDef', function() {});
      $provide.value('ComponentDefaultData', new MockComponentDefaultData());
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
    var link = $compile("<div navigator=''><corespring-line-configure id='1'></corespring-line-configure></div>");
    element = link(scope);
    element = element.find('.line-interaction-configuration');
    scope = element.scope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });


  describe('isValidFormula', function() {
    it('linear equation is valid', function() {
      expect(scope.isValidFormula('2x+3')).toEqual(true);
    });
    it('linear equation with - is valid', function() {
      expect(scope.isValidFormula('2x-3')).toEqual(true);
    });
    it('linear equation with y= prefix is valid', function() {
      expect(scope.isValidFormula('y=2x+3')).toEqual(true);
    });
    it('linear equation with decimals is valid', function() {
      expect(scope.isValidFormula('y=2.123x+3333.12')).toEqual(true);
    });
    it('linear equation without b is valid', function() {
      expect(scope.isValidFormula('y=2.123x')).toEqual(true);
    });
    it('linear equation without mx is valid', function() {
      expect(scope.isValidFormula('y=2.123')).toEqual(true);
    });
    it('linear equation with capital X is valid', function() {
      expect(scope.isValidFormula('y=2X+3')).toEqual(true);
    });
    it('linear equation with other letter than x is invalid', function() {
      expect(scope.isValidFormula('y=2a+3')).toEqual(false);
    });
    it('linear equation with no x is invalid', function() {
      expect(scope.isValidFormula('y=2+3')).toEqual(false);
    });
    it('linear equation with more than 2 parts is invalid', function() {
      expect(scope.isValidFormula('y=2x+3+2')).toEqual(false);
    });

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