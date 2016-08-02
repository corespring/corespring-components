exports.framework = 'angular';
exports.factory = ['$log', function($log) {
  return CsUndoModel;

  /**
   * The CsUndoModel can be used to implement undo in a component
   * @example
   *
   // After creation of the undModel you would set the functions
   // to set/restore the state of your component

   var undoModel = new CsUndoModel();
   undoModel.setGetState(function(){
    //return the current state of your component here
    return {}
    });
   undoModel.setRevertState(function(state){
    //set the current state of your component from the state
    });

   // When your component is in an initial state, eg. at the
   // end of setDataAndSession, you would typically capture
   // this state by calling init

   undoModel.init();

   // When you want to save the current state because the user
   // has changed something you would call

   undoModel.remember();

   // To undo one step
   undoModel.undo();

   // To go back to the first state
   undoModel.startOver();
   */
  function CsUndoModel() {

    $log.debug("[CsUndoModel] model created.");

    var self = this;
    var undoStack = [];
    var getState = nop;
    var revertState = nop;

    this.undoCount = 0;
    this.undoDisabled = true;

    this.init = init;
    this.setGetState = setGetState;
    this.setRevertState = setRevertState;
    this.startOver = startOver;
    this.undo = undo;
    this.remember = remember;

    updateUndoState();

    //--------------------------

    /**
     * Clear the undo stack and get the initial state from the client
     */
    function init() {
      undoStack = [];
      remember();
    }

    /**
     * Ask the undo model to get & save the current state
     * This will call getState on the client
     */
    function remember() {
      pushState(getState());
    }

    /**
     * The undo model uses this function to get the state from the client
     * @param fn
     */
    function setGetState(fn) {
      getState = _.isFunction(fn) ? fn : nop;
    }

    /**
     * The undo model uses this function to revert the state of the client
     * @param fn
     */
    function setRevertState(fn) {
      revertState = _.isFunction(fn) ? fn : nop;
    }

    /**
     * Go back to the first state
     */
    function startOver() {
      if (undoStack.length > 1) {
        undoStack = [_.first(undoStack)];
        doRevert(_.first(undoStack));
      }
    }

    /**
     * Go back to the previous state
     */
    function undo() {
      if (undoStack.length > 1) {
        undoStack.pop();
        doRevert(_.last(undoStack));
      }
    }

    function doRevert(state) {
      revertState(_.cloneDeep(state));
      updateUndoState();
    }

    function updateUndoState() {
      self.undoCount = undoStack.length;
      self.undoDisabled = self.undoCount <= 1;
    }

    function pushState(newState) {
      if(newState){

        var newCleaned = ignoreAngularIds(newState);
        var last = _.last(undoStack);
        var lastCleaned = ignoreAngularIds(last);
        var equal = _.isEqual(newCleaned, lastCleaned);
        if(!equal){
           undoStack.push(newCleaned);
        }
      }
      updateUndoState();
    }

    function nop(state) {
      $log.warn("[CsUndoModel] undoCallback is not set.");
    }

    function ignoreAngularIds(obj){
      var json = angular.toJson(obj);
      return _.isString(json) ? JSON.parse(json) : undefined;
    }
  }
}];