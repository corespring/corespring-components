var link, main;

link = function() {
  return function(scope, element, attrs) {

    scope.editable = true;

    scope.containerBridge = {

      setDataAndSession: function(dataAndSession) {
        scope.question = dataAndSession.data.model;
        scope.session = dataAndSession.session || {};

        scope.rows = (dataAndSession.data.model.config && dataAndSession.data.model.config.expectedLines) || 4;
        scope.cols = (dataAndSession.data.model.config && dataAndSession.data.model.config.expectedLength) || 60;
      },

      getSession: function() {
        return {
          answers: scope.answer
        };
      },

      // sets the server's response
      setResponse: function(response) {
        console.log("Setting Response for extended text entry:");
        console.log(response);

        scope.answer = response.studentResponse;
        scope.feedback = response.feedback;

        scope.received = true;
      },

      setMode: function(newMode) {},

      reset: function() {
        scope.answer = undefined;
        scope.feedback = undefined;
        scope.received = false;
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

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

  };
};

main = [

  function() {
    var def;
    def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="view-extended-text-entry">',
        '<textarea ng-model="answer" rows="{{rows}}" cols="{{cols}}" ng-disabled="!editable" class="text-input" />',
        '<div class="feedback" ng-show="feedback" ng-bind-html-unsafe="feedback"></div>',
        '</div>'].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
