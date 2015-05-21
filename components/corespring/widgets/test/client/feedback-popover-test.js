describe('feedback popover', function() {

  var scope, element, timeout;

  beforeEach(angular.mock.module('test-app'));

  var haveBeenCalledWith = [];

  function resetSpy() {
    haveBeenCalledWith = [];
  }

  var MockPopover = {
    fn: function(arg) {
      haveBeenCalledWith.push(arg);
      return MockPopover;
    },
    on: function(arg, callback) {
      callback();
      return MockPopover;
    }
  };


  var findPopoverCall = function() {
    return _.find(haveBeenCalledWith, function(item) {
      return item !== "destroy";
    });
  };

  beforeEach(function() {
    $.fn.extend({
      popover: MockPopover.fn
    });
  });

  beforeEach(function() {
    module(function($provide) {
      $provide.value('MathJaxService', {
        parseDomForMath: function() {
        }
      });
    });
  });

  beforeEach(inject(function($rootScope, $compile, $timeout) {
    timeout = $timeout;
    scope = $rootScope.$new();

    element = $compile('<div feedback-popover="response" viewport="body"></div>')(scope);
    scope = element.scope();
    scope.$apply();
    haveBeenCalledWith = [];
  }));

  describe('renders', function() {
    it('popover is shown when response is set', function() {
      scope.response = {
        feedback: "Hello"
      };
      scope.$digest();
      expect(element).toBeDefined();
      var popoverCall = findPopoverCall();
      expect(popoverCall).toBeDefined();
    });

    it('message is correct', function() {
      scope.response = {
        feedback: "Hello",
        correctness: "correct"
      };
      scope.$digest();
      expect(element).toBeDefined();
      var popoverCall = findPopoverCall();
      expect(popoverCall.content).toBe("Hello");
      resetSpy();

      scope.response = {
        correctness: "warning"
      };
      scope.$digest();
      expect(element).toBeDefined();
      popoverCall = findPopoverCall();
      expect(popoverCall.content).toBe("You did not enter a response.");
    });

    it('popover class is according to correctness', function() {
      scope.response = {
        feedback: "Hello",
        correctness: "correct"
      };
      scope.$digest();
      expect(element).toBeDefined();
      var popoverCall = findPopoverCall();
      expect(popoverCall.template).toMatch(/popover-correct/);
      resetSpy();

      scope.response = {
        feedback: "Hello",
        correctness: "incorrect"
      };
      scope.$digest();
      popoverCall = findPopoverCall();
      expect(popoverCall.template).toMatch(/popover-incorrect/);
      resetSpy();

      scope.response = {
        feedback: "Hello",
        correctness: "warning"
      };
      scope.$digest();
      popoverCall = findPopoverCall();
      expect(popoverCall.template).toMatch(/popover-warning/);
    });

  });


});
