var main = [

  function() {
    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: function(scope, element, attrs) {
        scope.visible = false;
        scope.open = false;
        scope.showHide = {'true': 'hide', 'false': 'show'};
        scope.toggle = function() {
          scope.open = !scope.open;
        };

        function updateVisible() {
          scope.visible = (scope.mode === 'instructor') && (!_.isEmpty(scope.instructions));
        }

        scope.containerBridge = {

          setDataAndSession: function(dataAndSession) {
          },

          getSession: function() {
            return {};
          },

          setResponse: function(response) {
          },

          setInstructorData: function(data) {
            scope.instructions = data.teacherInstructions;
            updateVisible();
          },

          setMode: function(newMode) {
            scope.mode = newMode;
            updateVisible();
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
        '<div class="view-teacher-instructions" ng-show="visible">',
        '  <instructions-toggle toggle="open"></instructions-toggle>',
        '  <div class="text" ng-show="open" ng-bind-html-unsafe="instructions">',
        '  </div>',
        '</div>'
      ].join('')

    };
  }
];

exports.framework = 'angular';
exports.directive = main;