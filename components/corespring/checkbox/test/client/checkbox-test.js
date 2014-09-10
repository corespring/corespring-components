describe('checkbox', function() {

  var compile, rootScope;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($compile, $rootScope) {
    compile = $compile;
    rootScope = $rootScope
  }));

  describe('initial rendering', function() {

    it('replaces <checkbox/> with <div class="checkbox-input"/>', function() {
      var element = compile("<checkbox></checkbox>")(rootScope.$new());
      expect(element.prop('tagName').toLowerCase()).toEqual('div');
      expect(element.hasClass('checkbox-input')).toBe(true);
    });

    it('renders a toggle', function() {
      var element = compile("<checkbox></checkbox>")(rootScope.$new());
      var toggle = $('.checkbox-toggle', element);
      expect(toggle.length).toBe(1);
    });

    it('transcludes contents of node into label', function() {
      var label = "this should be inside the node";
      var element = compile("<checkbox>" + label + "</checkbox>")(rootScope.$new());
      expect($('.label-text', element).text().trim()).toEqual(label);
    });

    xit('adds checked class to .checkbox-toggle when checked="checked"', function() {
      var element = compile("<checkbox checked='checked'></checkbox>")(rootScope.$new());
      expect($('.checkbox-toggle', element).hasClass('checked')).toBe(true);
    });


    xit('adds disabled class to .checkbox-toggle when disabled="disabled"', function() {
      var element = compile("<checkbox disabled='disabled'></checkbox>")(rootScope.$new());
      expect($('.checkbox-toggle', element).hasClass('disabled')).toBe(true);
    });

  });


  describe('checked attribute', function() {

    it('adds checked="checked" to .checkbox-input when clicked', function() {
      var element = compile("<checkbox></checkbox>")(rootScope.$new());
      element.click();
      expect(element.attr('checked')).toBeDefined();
      expect(element.attr('checked')).toEqual('checked');
    });

    it('removes checked="checked" from .checkbox-input when clicked twice', function() {
      var element = compile("<checkbox></checkbox>")(rootScope.$new());
      element.click();
      element.click();
      expect(element.attr('checked')).toBeUndefined();
    });

    it('adds "checked" class to .checkbox-toggle when it has been checked', function() {
      var element = compile("<checkbox></checkbox>")(rootScope.$new());
      element.click();
      expect($('.checkbox-toggle', element).hasClass('checked')).toBe(true);
    });

    it('removes "checked" class from .checkbox-toggle when it has been unchecked', function() {
      var element = compile("<checkbox></checkbox>")(rootScope.$new());
      element.click();
      element.click();
      expect($('.checkbox-toggle', element).hasClass('checked')).toBe(false);
    });

  });

  describe('disabled attribute', function() {

    var element;

    beforeEach(function() {
      element = compile("<checkbox></checkbox>")(rootScope.$new());
    });

    it('does not add checked="checked" to .checkbox-input when disabled', function() {
      element.attr('disabled', 'disabled');
      element.click();
      expect(element.attr('checked')).toBeUndefined();
    });

    it('does not add "checked" class to .checkbox-toggle when disabled', function() {
      element.attr('disabled', 'disabled');
      element.click();
      expect($('.checkbox-toggle', element).hasClass('checked')).toBe(false);
    });

    it('does not remove checked="checked" from .checkbox-input when disabled', function() {
      element.attr('checked', 'checked');
      element.attr('disabled', 'disabled');
      element.click();
      expect(element.attr('checked')).toBeDefined();
      expect(element.attr('checked')).toBe('checked');
    });

    it('does not remove "checked" class from .checkbox-toggle when disabled', function() {
      element.attr('checked', 'checked');
      element.attr('disabled', 'disabled');
      element.click();
      expect($('.checkbox-toggle', element).hasClass('checked')).toBe(true);
    });

  });

  describe('ngModel', function() {

    it('should initialize boolean false to unchecked', function() {
      var scope = rootScope.$new();
      scope.value = false;
      var element = compile("<checkbox ng-model='value'></checkbox>")(scope);
      expect(element.attr('checked')).toBeUndefined();
      expect($('.checkbox-toggle', element).hasClass('checked')).toBe(false);
    });

    xit('should initialize boolean true to checked', function() {
      var scope = rootScope.$new();
      scope.value = true;
      var element = compile("<checkbox ng-model='value'></checkbox>")(scope);
      expect(element.attr('checked')).toBeDefined();
      expect(element.attr('checked')).toBe('checked');
      expect($('.checkbox-toggle', element).hasClass('checked')).toBe(true);
    });

    it('should change model to true when checked', function() {
      var scope = rootScope.$new();
      scope.value = false;
      var element = compile("<checkbox ng-model='value'></checkbox>")(scope);
      element.click();
      expect(scope.value).toBe(true);
    });

    it('should change model to false when unchecked', function() {
      var scope = rootScope.$new();
      scope.value = false;
      var element = compile("<checkbox ng-model='value'></checkbox>")(scope);
      element.click();
      element.click();
      expect(scope.value).toBe(false);
    });

  });

  describe('ngDisabled', function() {

    xit('should initialize the checkbox to be disabled when true', function() {
      var scope = rootScope.$new();
      scope.disabled = true;
      var element = compile("<checkbox ng-disabled='disabled'></checkbox>")(scope);
      expect(element.attr('disabled')).toBeDefined();
      expect(element.attr('disabled')).toBe('disabled');
    });

    it('should initialize the checkbox to be enabled when false', function() {
      var scope = rootScope.$new();
      scope.disabled = false;
      var element = compile("<checkbox ng-disabled='disabled'></checkbox>")(scope);
      expect(element.attr('disabled')).toBeUndefined();
    });

  });

});
