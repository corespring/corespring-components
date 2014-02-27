var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {

      scope.editable = true;

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          $log.debug("multiple-choice setDataAndSession", dataAndSession);
        },

        getSession: function() {
          return {
            answers: ""
          };
        },

        setResponse: function(response) {
        },

        setMode: function(newMode) {
        },

        reset: function() {
        },

        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function(callback) {
          scope.$watch("answer", function(newValue, oldValue) {
            if (newValue) {
              callback();
            }
          }, true);
        },

        editable: function(e) {
          scope.editable = e;
        }
      };

      scope.model = {
        plots: 1
      };

      scope.bok = function() {
        scope.model.plots++;
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: [
        '<div>',
        ' <div><a ng-click="bok()">Bok</a>',
        ' <div khan-box-and-whiskers ngModel="model"></div>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
