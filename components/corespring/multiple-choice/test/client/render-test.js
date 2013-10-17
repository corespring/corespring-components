describe('corespring', function(){

  describe('multiple-choice render', function(){

    var MockCorespringContainer = function () {

      this.register = function(){
        console.log("Register", arguments);
      };
    };

    var element = null;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(function () {
      module(function ($provide) {
        $provide.value('CorespringContainer', new MockCorespringContainer());
      });
    });

    beforeEach(inject(function ($compile, $rootScope ) {
      scope = $rootScope.$new();
      element = $compile("<corespring-multiple-choice-render id='1'></corespring-multiple-choice-render>")($rootScope);
    }));

    it('constructs', function(){
      expect(element).toNotBe(null);
    });
  });

  });
