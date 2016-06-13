exports.framework = 'angular';
exports.directive = ['$sce', '$log', '$timeout', 'Msgr', TestControllerViewDirective];


function TestControllerViewDirective($sce, $log, $timeout, Msgr) {

  return {
    scope: {},
    restrict: 'EA',
    replace: true,
    link: link,
    template: template()
  };

  function link(scope, element, attrs) {

    scope.ICONSET = {
      EMOJI: "emoji",
      CHECK: "check"
    };

    scope.MODE = {
      GATHER: {mode:"gather"},
      EVALUATE: {mode:"evaluate"},
      EVALUATE_NO_ANSWER: {mode:"evaluate", noAnswer:true},
      EVALUATE_NO_FEEDBACK: {mode:"evaluate", noFeedback: true},
      INSTRUCTOR: {mode:"instructor"},
      INSTRUCTOR_RATIONALES: {mode:"instructor", withRationales:true},
      VIEW: {mode:"view"}
    };

    scope.setIconSet = function(iconSet){
      scope.$emit("testController.setIconSet", {iconSet: iconSet});
    };

    scope.setMode = function(data){
      scope.$emit("testController.setMode", data);
    };
  }

  function template(){
    return [
      '<div class="corespring-test-controller view">',
      '<p>Test Controller View',
      '<ul>',
      '<li><a ng-click="setIconSet(ICONSET.EMOJI)">emoji</a></li>',
      '<li><a ng-click="setIconSet(ICONSET.CHECK)">check</a></li>',
      '<li><a ng-click="setMode(MODE.GATHER)">gather</a></li>',
      '<li><a ng-click="setMode(MODE.EVALUATE)">evaluate</a></li>',
      '<li><a ng-click="setMode(MODE.EVALUATE_NO_FEEDBACK)">evaluate no feedback</a></li>',
      '<li><a ng-click="setMode(MODE.EVALUATE_NO_ANSWER)">evaluate no answer</a></li>',
      '<li><a ng-click="setMode(MODE.INSTRUCTOR)">instructor</a></li>',
      '<li><a ng-click="setMode(MODE.INSTRUCTOR_RATIONALES)">instructor with rationales</a></li>',
      '<li><a ng-click="setMode(MODE.VIEW)">view</a></li>',
      '</ul>',
      '</div>'
    ].join('');
  }
}