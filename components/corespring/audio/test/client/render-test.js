describe('corespring-audio-render', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container;

  var testModel;

  var testModelTemplate = {
    data: {
      ui: 'fullControls',
      playButtonLabel: '>',
      pauseButtonLabel: '||',
      formats: {
        'audio/mp3': 'test.mp3'
      }
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      console.log('registerComponent', id, obj);
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-audio-render id='1'></corespring-audio-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
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

  it('sets model', function() {
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.config.ui).toBe('fullControls');
    expect(scope.config.playButtonLabel).toBe('>');
    expect(scope.config.pauseButtonLabel).toBe('||');
    expect(scope.config.formats).toEqual({'audio/mp3': 'test.mp3'});
    expect(scope.sources.length).toEqual(1);
    expect(scope.sources[0].type).toEqual('audio/mp3');
    expect(scope.sources[0].url).toEqual('test.mp3');
    expect(typeof scope.sources[0].trustedUrl).toEqual('object');
    expect(scope.sources[0].trustedUrl.toString()).toEqual('test.mp3');
  });

});