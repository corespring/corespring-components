describe('checkbox', function() {


  function printNode(node) {
    expect($('<div>').append(node.clone()).html()).toBe(undefined);
  }

  function printString(string) {
    expect(string).toBe(undefined);
  }

  var compile, rootScope;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($compile, $rootScope) {
    compile = $compile;
    rootScope = $rootScope
  }));

  describe('initial rendering', function() {

    it('replaces <radio/> with <div class="radio-input"/>', function() {
      var element = compile("<radio></radio>")(rootScope.$new());
      expect(element.prop('tagName').toLowerCase()).toEqual('div');
      expect(element.hasClass('radio-input')).toBe(true);
    });

    it('renders a toggle', function() {
      var element = compile("<radio></radio>")(rootScope.$new());
      var toggle = $('.radio-toggle', element);
      expect(toggle.length).toBe(1);
    });

    it('transcludes contents of node into label', function() {
      var label = "this should be inside the node";
      var element = compile("<radio>" + label + "</radio>")(rootScope.$new());
      expect($('.label-text', element).text().trim()).toEqual(label);
    });

    it('preserves name attribute from initial <radio/>', function() {
      var name = "radio-group";
      var element = compile("<radio name='" + name + "'></radio>")(rootScope.$new());
      expect(element.attr('name')).toBe(name);
    });

  });

});