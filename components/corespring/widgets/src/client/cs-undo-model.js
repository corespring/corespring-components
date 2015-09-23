exports.framework = 'angular';
exports.factory = ['$log', function($log) {
  return CsUndoModel;

  function CsUndoModel() {

    $log.debug("[CsUndoModel] model created.");

    var self = this;
    var undoStack = [];
    var getState = nop;
    var revertState = nop;

    this.undoCount = 0;
    this.undoEnabled = false;
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
     * Set the function which gets the state from the client
     * @param fn
     */
    function setGetState(fn) {
      getState = _.isFunction(fn) ? fn : nop;
    }

    /**
     * Set the function which sets the state to the client
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
      self.undoCount = undoStack.length
      self.undoEnabled = self.undoCount > 1;
      self.undoDisabled = !self.undoEnabled;
    }

    function pushState(newState) {
      if (newState && !_.isEqual(newState, _.last(undoStack))) {
        undoStack.push(_.cloneDeep(newState));
      }
      updateUndoState();
    }

    function nop(state) {
      $log.warn("[CsUndoModel] undoCallback is not set.");
    }
  }
}];