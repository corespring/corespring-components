var def = function() {
    return {
        restrict: "AE",
        transclude: true,
        replace: true,
        template: [
            '<button class="btn-player btn-undo" ng-click="undo()"><i class="fa fa-angle-left"></i> Undo</button>'
        ].join('')
    };
};


exports.framework = "angular";
exports.directive = {
    name: "csUndoButton",
    directive: def
};
