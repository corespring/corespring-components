var main = [
  '$sce', '$log',

  function ($sce, $log) {
    var def;

    var link = function (scope, element, attrs) {

      scope.editable = true;
      scope.response = {};

      scope.containerBridge = {

        setDataAndSession: function (dataAndSession) {
          $log.debug("box and whiskers setDataAndSession", dataAndSession);

          scope.model = dataAndSession.data.model;

          if (dataAndSession.session && dataAndSession.session.answers) {
            console.log("Plott: ",dataAndSession.session.answers);
            scope.response = dataAndSession.session.answers;
            console.log("Plott2: ",scope.response);
          }

        },

        getSession: function () {
          return {
            answers: scope.response
          };
        },

        setResponse: function (response) {
          $log.debug("box and whiskers setResponse", response);
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
        '<div class="box-and-whiskers">',
        ' <div>{{response}}</div>',
        ' <table><tr>',
        ' <td ng-repeat="g in model.graphs" box-and-whiskers-graph editable="editable" ngModel="g" responseModel="response[$index]" style="background-color: #d3d3d3; border: 1px solid black">{{$index}}</td>',
        ' </table>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
