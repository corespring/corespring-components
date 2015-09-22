exports.framework = 'angular';
exports.factory = [function() {
  return CsUndoModel;
}];

function CsUndoModel($log) {

  $log.debug("[CsUndoModel] model created.");

  var self = this;
  var undoStack = [];
  var undoCallback = nop;

  this.undoEnabled = false;
  this.undoDisabled = true;

  this.clear = clear;
  this.pushState = pushState;
  this.setUndoCallback = setUndoCallback;
  this.startOver = startOver;
  this.undo = undo;

  updateUndoEnabled();

  //--------------------------

  function clear() {
    undoStack = [];
  }

  function pushState(newState) {
    if (newState && !_.isEqual(newState, _.last(undoStack))) {
      undoStack.push(_.cloneDeep(newState));
      $log.debug('pushState', newState);
      updateUndoEnabled();
    }
  }

  function setUndoCallback(callback) {
    undoCallback = _.isFunction(callback) ? callback : nop;
  }

  function startOver() {
    if (undoStack.length > 1) {
      undoStack = [_.first(undoStack)];
      doRevert(_.first(undoStack));
    }
  }

  function undo() {
    if (undoStack.length > 1) {
      undoStack.pop();
      doRevert(_.last(undoStack));
    }
  }

  function updateUndoEnabled() {
    self.undoEnabled = undoStack.length > 1;
    self.undoDisabled = !self.undoEnabled;
  }

  function doRevert(state) {
    undoCallback(state);
    updateUndoEnabled();
  }

  function nop(state) {
    $log.warn("[CsUndoModel] undoCallback is not set.");
  }
}