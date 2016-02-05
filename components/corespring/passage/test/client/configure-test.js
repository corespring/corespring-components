var expect = require('expect.js');

describe('corespring:passage:configure', function() {

  "use strict";

  var MockPassageService;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null,
    container = null,
    scope, rootScope;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    MockPassageService = {
      search: jasmine.createSpy('search')
    };
    module(function($provide) {
      $provide.value('PassageService', MockPassageService);
    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    scope = $rootScope.$new();
    container = new MockComponentRegister();

    $rootScope.$on('registerConfigPanel', function (ev, id, b) {
      container.registerConfigPanel(id, b);
    });

    $rootScope.registerConfigPanel = function (id, b) {
      container.registerConfigPanel(id, b);
    };

    element = $compile("<corespring-passage-configure id='1'></corespring-passage-configure>")(scope);
    element.find('.ordering-config');
    scope = element.isolateScope();
    scope.fullModel = {};
    rootScope = $rootScope;
  }));

  it('constructs', function () {
    expect(element).not.toBe(null);
  });

  describe('entering query', function() {

    it('triggers PassageService#search', function() {
      scope.query.text = 'search string';
      scope.$digest();
      expect(MockPassageService.search).toHaveBeenCalledWith(scope.query, jasmine.any(Function));
    });

  });

  describe('setPassage', function() {

    it('updates fullModel.id to id of passage', function() {
      var passageId = "passage id";
      scope.setPassage({
        id: passageId
      });
      scope.$digest();
      expect(scope.fullModel.id).to.equal(passageId);
    });

  });

  describe('selected', function() {
    var passageId = "passage id";

    beforeEach(function() {
      scope.fullModel.id = passageId;
    });

    describe('fullModel.id matches provided passage id', function() {

      it('returns true', function() {
        expect(scope.selected({id: passageId})).to.be(true);
      });

    });

    describe('fullModel.id does not match provided passage id', function() {

      it('returns false', function() {
        expect(scope.selected({id: "not passage id"})).to.be(false);
      });

    });

  });

});