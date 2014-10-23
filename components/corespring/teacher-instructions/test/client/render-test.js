describe("corespring", function() {

  var rootScope, element;

  function getHtml(who, deep){
    if(!who || !who.tagName) return '';
    var txt, ax, el= document.createElement("div");
    el.appendChild(who.cloneNode(false));
    txt= el.innerHTML;
    if(deep){
      ax= txt.indexOf('>')+1;
      txt= txt.substring(0, ax)+who.innerHTML+ txt.substring(ax);
    }
    el= null;
    return txt;
  }

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($compile, $rootScope) {
    element = $compile("<corespring-teacher-instructions id='1'></corespring-teacher-instructions>")($rootScope.$new());
    rootScope = $rootScope;
  }));

  it('renders nothing', function() {
    expect(element[0].innerHtml).toBe(undefined);
  });

});