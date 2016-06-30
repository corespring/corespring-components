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
    ui: 'fullControls',
    playButtonLabel: '>',
    pauseButtonLabel: '||',
    formats: {
      'audio/mp3': 'test.mp3'
    }
  };

  var mockEditingAudioService = {
    deleteFile: jasmine.createSpy('deleteFile')
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('EditingAudioService', mockEditingAudioService);
      $provide.value('WIGGI_EVENTS', {'LAUNCH_DIALOG' : 'launchDialog'});
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
    expect(scope.fullModel.formats).toEqual({'audio/mp3': 'test.mp3'});
  });

  describe('addSrc', function(){
    beforeEach(function(){
      container.elements['1'].setModel(testModel);
    });

    it("adds the src", function(){
      scope.addSrc('test.ogg');
      expect(scope.fullModel.formats['audio/ogg']).toEqual('test.ogg');
    });

    it("replaces source", function(){
      scope.addSrc('test2.mp3');
      expect(scope.fullModel.formats['audio/mp3']).toEqual('test2.mp3');
    });
  });

  describe('removeSrc', function(){
    beforeEach(function(){
      container.elements['1'].setModel(testModel);
    });

    it("removes the src", function(){
      scope.removeSrc('test.mp3');
      expect(scope.fullModel.formats).toEqual({});
    });

    it("does not remove other sources", function(){
      scope.fullModel.formats['audio/ogg'] = "test.ogg";
      scope.removeSrc('test.mp3');
      expect(scope.fullModel.formats).toEqual({'audio/ogg' : 'test.ogg'});
    });
  });

  describe('showUploadDialog', function(){
    it('emits a launchDialog event', function(){
      var mockLaunchDialog = jasmine.createSpy('launchDialog');
      scope.$on('launchDialog', mockLaunchDialog);
      scope.showUploadDialog();
      expect(mockLaunchDialog).toHaveBeenCalled();
    });
  });

  describe('onCloseFileUploadDialog', function(){

    beforeEach(function(){
      container.elements['1'].setModel(testModel);
    });

    it('should add the file', function(){
      scope.onCloseFileUploadDialog({imageUrl: 'test.ogg'});
      expect(scope.fullModel.formats['audio/ogg']).toBe('test.ogg');
    });

    it('should delete file, when update has been canceled', function(){
      scope.onCloseFileUploadDialog({cancelled: true, imageUrl: 'test.mp3'});
      expect(mockEditingAudioService.deleteFile).toHaveBeenCalledWith('test.mp3');
    });
  });

});