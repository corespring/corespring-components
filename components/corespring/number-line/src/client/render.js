var main = [
  '$sce', '$log',

  function ($sce, $log) {
    var def;

    var link = function (scope, element, attrs) {

      scope.editable = true;
      scope.response = {};

      scope.containerBridge = {

        setDataAndSession: function (dataAndSession) {
          $log.debug("number line", dataAndSession);

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
            if (newValue !== oldValue) {
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
        '<div class="number-line">',
        ' <div>Cucu: {{response}}</div>',
        ' <div interactive-graph ngModel="model" responseModel="response">{{$index}}</div>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
