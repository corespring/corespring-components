exports.framework = 'angular';
exports.directive = {
  name: "corespringUndoStartOver",
  directive: [
  function() {

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
        scope.$watch('renderModel', updateUndoStack, true)

        function clearUndoStack(){
          log("clearUndoStack");
          scope.undoStack = [];
        }

        function updateUndoStack(newValue, oldValue) {
          log("updateUndoStack", newValue);
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

        function doRevert(state){
          scope.revertToState({state:state});
        }

      }

      function template() {
        return [
          '<div>',
          '  <div class="undo-start-over pull-right">',
          '    <button type="button" class="btn btn-default" ng-click="undo()" ng-disabled="undoStack.length < 2"><i class="fa fa-undo"></i> Undo</button>',
          '    <button type="button" class="btn btn-default" ng-click="startOver()" ng-disabled="undoStack.length < 2">Start over</button>',
          '  </div>',
          '  <div class="clearfix"></div>',
          '</div>'
        ].join('');
      }
  }]
};