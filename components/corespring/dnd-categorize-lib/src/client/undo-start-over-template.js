exports.framework = 'angular';
exports.directive = {
  name: "corespringUndoStartOver",
  directive: CorespringUndoStartOver
};

function CorespringUndoStartOver() {
  return {
    restrict: 'A',
    replace: true,
    link: link,
    template: template(),
    scope: {
      renderModel: '=',
      revertToState: '&'
    }
  };

  function link(scope, elem, attrs) {
    var log = console.log.bind(console, '[undo-start-over]');

    scope.undoStack = [];
    scope.undo = undo;
    scope.startOver = startOver;

    scope.$on('reset', clearUndoStack);
    scope.$watch('renderModel', updateUndoStack, true);

    //------------------------------------------------------

    function clearUndoStack() {
      scope.undoStack = [];
    }

    function updateUndoStack(newValue, oldValue) {
      if (newValue && !_.isEqual(newValue, _.last(scope.undoStack))) {
        scope.undoStack.push(_.cloneDeep(newValue));
      }
    }

    function startOver() {
      scope.undoStack = [_.first(scope.undoStack)];
      doRevert(_.first(scope.undoStack));
    }

    function undo() {
      if (scope.undoStack.length < 2) {
        return;
      }
      scope.undoStack.pop();
      doRevert(_.last(scope.undoStack));
    }

    function doRevert(state) {
      scope.revertToState({
        state: state
      });
    }

  }

  function template() {
    return [
          '<div>',
          '  <div class="undo-start-over pull-right">',
          '    <span cs-undo-button ng-class="{disabled: undoStack.length < 2}" ng-disabled="undoStack.length < 2"></span>',
          '    <span cs-start-over-button ng-class="{disabled: undoStack.length < 2}" ng-disabled="undoStack.length < 2"></span>',
          '  </div>',
          '  <div class="clearfix"></div>',
          '</div>'
        ].join('');
  }
}