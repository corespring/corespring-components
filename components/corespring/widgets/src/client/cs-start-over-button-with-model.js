var def = function() {
    return {
        restrict: "AE",
        transclude: true,
        replace: true,
        template: [
            '<button ',
            '  class="btn-player" ',
            '  ng-click="startOver ? startOver() : undoModel.startOver()"',
            '  ng-class="{disabled:undoModel.undoDisabled}"',
            '  ng-disabled="undoModel.undoDisabled"',
            '  ><i class="fa start-over-icon">&nbsp;</i> Start Over</button>'
        ].join('')
    };
};


exports.framework = "angular";
exports.directive = {
    name: "csStartOverButtonWithModel",
    directive: def
};
