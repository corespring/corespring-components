var main = [
  '$sce', '$log',

  function ($sce, $log) {
    var def;

    var link = function (scope, element, attrs) {

      scope.editable = true;

      scope.containerBridge = {

        setDataAndSession: function (dataAndSession) {
          $log.debug("multiple-choice setDataAndSession", dataAndSession);
          scope.model = dataAndSession.data.model;
        },

        getSession: function () {
          return {
            answers: ""
          };
        },

        setResponse: function (response) {
        },

        setMode: function (newMode) {
        },

        reset: function () {
        },

        isAnswerEmpty: function () {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function (callback) {
          scope.$watch("answer", function (newValue, oldValue) {
            if (newValue) {
              callback();
            }
          }, true);
        },

        editable: function (e) {
          scope.editable = e;
        }
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
        ' <table><tr>',
        ' <td ng-repeat="g in model.graphs" box-and-whiskers-graph ngModel="g" style="background-color: #d3d3d3; border: 1px solid black"></td>',
        ' </table>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
