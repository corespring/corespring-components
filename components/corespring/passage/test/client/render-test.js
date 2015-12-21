describe('corespring', function() {

  describe('passage render', function() {

    var testModel;
    var passageId = '5678065a67b47243f6087ee1:0';

    var MockComponentRegister = function() {
      this.elements = {};
      this.registerComponent = function(id, bridge) {
        this.elements[id] = bridge;
      };
    };

    var element, scope, rootScope, container;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(inject(function($compile, $rootScope) {
      container = new MockComponentRegister();

      $rootScope.$on('registerComponent', function(event, id, obj) {
        container.registerComponent(id, obj);
      });

      element = $compile("<corespring-passage-render id='1'></corespring-passage-render>")($rootScope.$new());
      scope = element.scope().$$childHead;
      rootScope = $rootScope;
    }));

    describe('passageRoute', function() {

      beforeEach(function() {
        testModel = {
          data: {
            id : passageId,
            model : {
              config : {
                displayed: true
              }
            }
          }
        };
        container.elements['1'].setDataAndSession(testModel);
      });

      it('is set to v2 passage endpoint containing passage id', function() {
        expect(scope.passageRoute.toString()).toEqual('/api/v2/passages/' + passageId);
      });

    });

    describe('displayed', function() {

      describe('set to true', function() {

        beforeEach(function() {
          testModel = {
            data: {
              id : passageId,
              model : {
                config : {
                  displayed: true
                }
              }
            }
          };
          container.elements['1'].setDataAndSession(testModel);
          scope.$digest();
        });

        it('renders passage iframe', function() {
          expect(element.find('iframe')[0]).toBeDefined();
        });

      });

      describe('set to false', function() {

        beforeEach(function() {
          testModel = {
            data: {
              id : passageId,
              model : {
                config : {
                  displayed: false
                }
              }
            }
          };
          container.elements['1'].setDataAndSession(testModel);
          scope.$digest();
        });

        it('does not render passage iframe', function() {
          expect(element.find('iframe')[0]).not.toBeDefined();
        });

      })

    });

  });
});
