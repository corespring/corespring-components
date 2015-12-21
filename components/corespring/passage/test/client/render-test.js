describe('corespring', function() {

  describe('passage render', function() {

    var MockComponentRegister = function() {
      this.elements = {};
      this.registerComponent = function(id, bridge) {
        console.log('registering component');
        this.elements[id] = bridge;
      };
      this.setDataAndSession = function (id, dataAndSession) {
        this.elements[id].setDataAndSession(dataAndSession);
      };
    };

    var element, scope, rootScope, container;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(inject(function($compile, $rootScope) {
      container = new MockComponentRegister();

      $rootScope.$on('registerComponent', function(event, id, obj) {
        container.registerComponent(id, obj);
      });

      element = $compile("<corespring-passage id='1'></corespring-passage>")($rootScope.$new());
      scope = element.scope();
      rootScope = $rootScope;
    }));

    it('constructs', function() {
      var testModel = {
        model : {
          config : {
            display: true
          }
        }
      };
      container.elements['1'].setModel(testModel);
    });

  });
});
