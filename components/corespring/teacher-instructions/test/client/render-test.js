describe("corespring", function() {

  var rootScope, element;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($compile, $rootScope) {
    element = $compile("<corespring-teacher-instructions id='1'></corespring-teacher-instructions>")($rootScope.$new());
    rootScope = $rootScope;
  }));

  it('renders nothing', function() {
    expect(element[0].innerHtml).toBe(undefined);
  });

});