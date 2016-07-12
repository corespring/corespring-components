describe('corespring-audio-render', function() {

  var element, scope, rootScope, container, sce, testModel;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      fileName: 'test.mp3',
      pauseButtonLabel: '||',
      playButtonLabel: '>',
      ui: 'fullControls'
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
    });
  });

  beforeEach(inject(function($compile, $rootScope, $sce) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      console.log('registerComponent', id, obj);
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-audio-render id='1'></corespring-audio-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
    sce = $sce;
  }));

  it('constructs', function() {
    expect(element).toBeTruthy();
  });

  it('registers bridge', function() {
    expect(container.elements['1']).toBeTruthy();
  });

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  it('should initialise scope', function() {
    expect(scope).toBeTruthy();
  });

  describe('setDataAndSession', function() {

    beforeEach(function () {
      container.elements['1'].setDataAndSession(testModel);
    });

    describe('config', function(){
      it('sets ui', function () {
        expect(scope.config.ui).toBe('fullControls');
      });

      it('sets playButtonLabel', function () {
        expect(scope.config.playButtonLabel).toBe('>');
      });

      it('sets pauseButtonLabel', function () {
        expect(scope.config.pauseButtonLabel).toBe('||');
      });

      it('sets fileName', function () {
        expect(scope.config.fileName).toEqual('test.mp3');
      });
    });

    describe('sources', function(){
      it('adds two sources', function () {
        expect(scope.sources.length).toEqual(2);
      });

      it('sets fileName as source with mime audio/mp3', function () {
        expect(scope.sources[0].type).toEqual('audio/mp3');
        expect(scope.sources[0].url).toEqual('test.mp3');
        expect(typeof scope.sources[0].trustedUrl).toEqual('object');
        expect(sce.getTrustedUrl(scope.sources[0].trustedUrl)).toEqual('test.mp3');
      });

      it('sets fileName as source with mime audio/mpeg', function () {
        expect(scope.sources[1].type).toEqual('audio/mpeg');
        expect(scope.sources[1].url).toEqual('test.mp3');
        expect(typeof scope.sources[1].trustedUrl).toEqual('object');
        expect(sce.getTrustedUrl(scope.sources[1].trustedUrl)).toEqual('test.mp3');
      });
    });
  });

});