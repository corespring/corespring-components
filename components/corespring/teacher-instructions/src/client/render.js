var main = [

  function() {
    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: function(scope, element, attrs) {
        scope.open = false;
        scope.showHide = {true: "hide", false: "show"};
        scope.capShowHide = {true: "Hide", false: "Show"};
        scope.toggle = function() {
          scope.open = !scope.open;
        };
        scope.containerBridge = {

          setDataAndSession: function(dataAndSession) {
            console.log("DS: ", dataAndSession);
            scope.instructions = dataAndSession.data.value;
          },

          getSession: function() {
            return {};
          },

          // sets the server's response
          setResponse: function(response) {
          },

          setMode: function(newMode) {
          },

          reset: function() {
            scope.open = false;
          },

          isAnswerEmpty: function() {
            return true;
          },

          answerChangedHandler: function(callback) {
          },

          editable: function(e) {
            scope.editable = e;
          }

        };

        scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      },
      template: [
        '<div class="view-teacher-instructions" ng-click="toggle()">',
        '  <div class="toggle-row {{showHide[open]}}-state">',
        '    <span class="{{showHide[open]}}-icon"></span>',
        '    <span class="instructions">{{capShowHide[open]}} Instructions</span>',
        '  </div>',
        '  <div class="text" ng-show="open" ng-bind-html-unsafe="instructions">',
        '  </div>',
        '</div>'
      ].join('')

    };
  }
];

exports.framework = 'angular';
exports.directive = main;