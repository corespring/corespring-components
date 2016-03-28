describe('cs undo model', function() {

  var sut, getState, revertState;

  var counter = 1;

  function getDifferentState(){
    return {value: counter++};
  }

  function getSameState(){
    return {value:1};
  }

  function getNullState(){
    return null;
  }

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function(CsUndoModel) {
    sut = new CsUndoModel();
    getState = jasmine.createSpy('getState').and.callFake(getDifferentState);
    sut.setGetState(getState);
    revertState = jasmine.createSpy('revertState');
    sut.setRevertState(revertState);
    sut.init();
  }));


  describe('init', function() {

    it('calls getState', function() {
      expect(getState).toHaveBeenCalled();
    });

    it('should save one state', function() {
      expect(sut.undoCount).toBe(1);
    });

    it('undo is not enabled afterwards', function() {
      sut.init();
      expect(sut.undoDisabled).toBe(true);
    });
  });

  describe('remember', function() {
    it('calls getState', function () {
      getState.calls.reset();
      sut.remember();
      expect(getState).toHaveBeenCalled();
    });

    it('should save one more state', function () {
      expect(sut.undoCount).toBe(1);
      sut.remember();
      expect(sut.undoCount).toBe(2);
    });

    it('should enable undo', function () {
      sut.remember();
      expect(sut.undoDisabled).toBe(false);
    });
  });

  describe('saving state logic', function(){

    it('init should not save a state, when getState returns null', function(){
      sut.setGetState(getNullState);
      sut.init();
      expect(sut.undoCount).toBe(0);
    });

    it('remember should not save a state, when getState returns null', function(){
      sut.setGetState(getNullState);
      expect(sut.undoCount).toBe(1);
      sut.remember();
      expect(sut.undoCount).toBe(1);
    });

    it('remember should not save a state, when getState returns same state as before', function(){
      sut.setGetState(getSameState);
      sut.init();
      expect(sut.undoCount).toBe(1);
      sut.remember();
      expect(sut.undoCount).toBe(1);
    });
  });

  describe('undo', function(){
    it('does not call revertState when it is disabled', function(){
      revertState.calls.reset();
      expect(sut.undoDisabled).toBe(true);
      sut.undo();
      expect(revertState).not.toHaveBeenCalled();
    });
    it('does call revertState when it is enabled', function(){
      revertState.calls.reset();
      sut.remember();
      expect(sut.undoDisabled).toBe(false);
      sut.undo();
      expect(revertState).toHaveBeenCalled();
    });
    it('should disable undo afterwards, when there is no more state', function(){
      sut.remember();
      sut.undo();
      expect(sut.undoDisabled).toBe(true);
    });
    it('should not disable undo afterwards, when there is more state', function(){
      sut.remember();
      sut.remember();
      sut.undo();
      expect(sut.undoDisabled).toBe(false);
    });
  });

  describe('startOver', function(){
    it('does not call revertState, when it is disabled', function(){
      revertState.calls.reset();
      expect(sut.undoDisabled).toBe(true);
      sut.startOver();
      expect(revertState).not.toHaveBeenCalled();
    });
    it('does call revertState, when it is enabled', function(){
      revertState.calls.reset();
      sut.remember();
      expect(sut.undoDisabled).toBe(false);
      sut.startOver();
      expect(revertState).toHaveBeenCalled();
    });
    it('should disable undo afterwards, when there is no more state', function(){
      sut.remember();
      sut.startOver();
      expect(sut.undoDisabled).toBe(true);
    });
    it('should disable undo afterwards, when there is more than one state', function(){
      sut.remember();
      sut.remember();
      sut.startOver();
      expect(sut.undoDisabled).toBe(true);
    });
  });

});
