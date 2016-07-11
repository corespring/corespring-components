describe('corespring-audio-configure', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container;

  var testModel;

  var testModelTemplate = {
    fileName: 'test.mp3',
    pauseButtonLabel: '||',
    playButtonLabel: '>',
    ui: 'fullControls'
  };

  var mockEditingAudioService = {
    deleteFile: jasmine.createSpy('deleteFile')
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('EditingAudioService', mockEditingAudioService);
      $provide.value('EditingAudioService', mockEditingAudioService);
      testModel = _.cloneDeep(testModelTemplate);
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerConfigPanel', function(event, id, obj) {
      console.log('registerConfigPanel', id, obj);
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-audio-configure id='1'></corespring-audio-configure>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toBeTruthy();
  });

  it('registers bridge', function() {
    expect(container.elements['1']).toBeTruthy();
  });

  it('should initialise scope', function() {
    expect(scope).toBeTruthy();
  });

  it('sets model', function() {
    container.elements['1'].setModel(testModel);
    expect(scope.fullModel.ui).toBe('fullControls');
    expect(scope.fullModel.playButtonLabel).toBe('>');
    expect(scope.fullModel.pauseButtonLabel).toBe('||');
    expect(scope.fullModel.fileName).toEqual('test.mp3');
  });

  describe('fileName', function(){

    beforeEach(function(){
      container.elements['1'].setModel(testModel);
    });

    it('when changed to string, the fullModel.fileName should be set', function(){
      scope.data = {imageUrl: '1234-abc.mp3'};
      scope.fileName = 'abc.mp3';
      scope.$digest();
      expect(scope.fullModel.fileName).toBe('1234-abc.mp3');
    });

  });

  describe('removeFile', function(){
    beforeEach(function(){
      container.elements['1'].setModel(testModel);
    });

    it('calls EditingAudioService.deleteFile', function(){
      scope.removeFile();
      expect(mockEditingAudioService.deleteFile).toHaveBeenCalledWith('test.mp3');
    });

    it('clears the model', function(){
      scope.removeFile();
      expect(scope.fullModel.fileName).toBeFalsy();
    });
  });

  describe('formatFilename', function(){
    it('removes unique id', function(){
      expect(scope.formatFilename('12345-test.mp3')).toBe('test.mp3');
    });
    it('retains other parts separated by -', function(){
      expect(scope.formatFilename('12345-test-one.mp3')).toBe('test-one.mp3');
    });
    it('decodes html encoded parts', function(){
      expect(scope.formatFilename('test%20one.mp3')).toBe('test one.mp3');
    });
  });

});