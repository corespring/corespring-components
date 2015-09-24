var def = function() {
    return {
        restrict: "AE",
        transclude: true,
        replace: true,
        template: [
          '<button ',
          '  class="btn-player btn-undo" ',
          '  ng-click="undo ? undo() : undoModel.undo()"',
          '  ng-class="{disabled:undoModel.undoDisabled}"',
          '  ng-disabled="undoModel.undoDisabled"',
          '  ><i class="fa fa-angle-left"></i> Undo</button>'
        ].join('')
    };
};

exports.framework = "angular";
exports.directive = {
    name: "csUndoButtonWithModel",
    directive: def
};
