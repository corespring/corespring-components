var main = [
  '$sce', '$log',

  function ($sce, $log) {
    var def;

    var link = function (scope, element, attrs) {

      scope.editable = true;

      scope.containerBridge = {

        setDataAndSession: function (dataAndSession) {
          $log.debug("multiple-choice setDataAndSession", dataAndSession);
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

      scope.model = {
        graphs: [
          {
            orientation: 'horizontal',
            domain: {
              label: 'domain label'
            },
            range: {
              label: 'range label'
            },
            plots: [
              {
                dataSet: [14, 6, 3, 2, 4, 15, 11, 8, 1, 7, 2, 1, 3, 4, 10, 22, 20],
                label: "plot 1 long"
              },
              {
                dataSet: [44, 6, 3, 2, 4, 30, 11, 8, 1, 7, 2, 9, 3, 4, 10, 22, 20],
                label: "plot 2"
              }
            ]
          },
          {
            orientation: 'vertical',
            domain: {
              label: 'verticalio libratio domintant di tur domain label'
            },
            range: {
              label: 'ver range label'
            },
            plots: [
              {
                dataSet: [1, 2, 3, 4, 5],
                label: "dogkut"
              }
            ]
          }
        ]
      };

      scope.bok = function () {
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
        ' <div>{{model}}</div>',
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
