var def = function() {
    return {
        restrict: "AE",
        transclude: true,
        replace: true,
        template: [
            '<button class="btn-player" ng-click="startOver()"><i class="fa start-over-icon">&nbsp;</i> Start Over</button>'
        ].join('')
    };
};


exports.framework = "angular";
exports.directive = {
    name: "csStartOverButton",
    directive: def
};
