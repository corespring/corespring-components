describe('checkbox', function() {

  var compile, rootScope;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($compile, $rootScope) {
    compile = $compile;
    rootScope = $rootScope;
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

    it('preserves value attribute from initial <radio/>', function() {
      var value = "1";
      var element = compile("<radio value='" + value + "'></radio>")(rootScope.$new());
      expect(element.attr('value')).toBe(value);
    });

    describe('checked', function() {
      it('adds the "checked" class to .radio-toggle', function() {
        var element = compile("<radio checked='checked'></radio>")(rootScope.$new());
        expect($('.radio-toggle', element).hasClass('checked')).toBe(true);
      });
    });

    describe('disabled', function() {
      it('adds the "disabled" class to .radio-toggle', function() {
        var element = compile("<radio disabled='disabled'></radio>")(rootScope.$new());
        expect($('.radio-toggle', element).hasClass('disabled')).toBe(true);
      });
    });


  });

  describe('clicking on <radio/> without ng-model', function() {
    var value = '1';
    var element;

    describe('and it is not disabled', function() {

      beforeEach(function() {
        spyOn(rootScope, '$broadcast').andCallThrough();
        element = compile("<radio value='" + value + "' name='great'>")(rootScope.$new());
        element.click();
      });

      it('sets the element to checked', function() {
        expect(element.attr('checked')).toBe('checked');
      });

      it('adds the "checked" class to .radio-toggle', function() {
        expect($('.radio-toggle', element).hasClass('checked')).toBe(true);
      });

      it('broadcasts a change to $rootScope', function() {
        expect(rootScope.$broadcast).toHaveBeenCalledWith('radio.checked', value);
      });

      describe('and another value has been selected', function() {

        var notValue = value + value;

        beforeEach(function() {
          rootScope.$broadcast('radio.checked', notValue);
        });

        it('removes checked="checked"', function() {
          expect(element.attr('checked')).toBeUndefined();
        });

        it('removes "checked" class from .radio-toggle', function() {
          expect($('.radio-toggle', element).hasClass('checked')).toBe(false);
        });

      });

    });

    describe('and it is disabled', function() {

      beforeEach(function() {
        spyOn(rootScope, '$broadcast').andCallThrough();
        element = compile("<radio value='" + value + "' name='great' disabled='disabled'>")(rootScope.$new());
        element.click();
      });

      it('does not set the element to checked', function() {
        expect(element.attr('checked')).toBeUndefined();
      });

      it('does not add the "checked" class to .radio-toggle', function() {
        expect($('.radio-toggle', element).hasClass('checked')).toBe(false);
      });

    });

  });

  describe('clicking on <radio/> and using ng-model', function() {
    var value = '1';
    var element, scope;

    beforeEach(function() {
      scope = rootScope.$new();
      scope.value = value;
      spyOn(rootScope, '$broadcast');
      element = compile("<radio ng-model='value' value='" + value + "'></radio>")(scope);
      element.click();
    });

    it('sets the element to checked', function() {
      expect(element.attr('checked')).toBe('checked');
    });

    it('adds the "checked" class to .radio-toggle', function() {
      expect($('.radio-toggle', element).hasClass('checked')).toBe(true);
    });

    it('does not broadcast a change to $rootScope', function() {
      expect(rootScope.$broadcast).not.toHaveBeenCalled();
    });

    it("sets the model to the element's value", function() {
      expect(scope.value).toBe(value);
    });

    describe('and another value has been selected', function() {

      var notValue = value + value;

      beforeEach(function() {
        scope.value = notValue;
        scope.$digest();
      });

      it('removes checked="checked"', function() {
        expect(element.attr('checked')).toBeUndefined();
      });

      it('removes "checked" class from .radio-toggle', function() {
        expect($('.radio-toggle', element).hasClass('checked')).toBe(false);
      });

    });

  });

});