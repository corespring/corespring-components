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
        scope.response = response;

        scope.received = true;
      },

      setMode: function(newMode) {},

      reset: function() {
        scope.answer = undefined;
        scope.response = undefined;
        scope.received = false;
      },

      isAnswerEmpty: function() {
        return _.isEmpty(this.getSession().answers);
      },

      answerChangedHandler: function(callback) {
        scope.$watch("answer", function(newValue, oldValue) {
          if (newValue !== oldValue) {
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
        '<div class="view-extended-text-entry {{response.correctness}}" ng-class="{received: received}">',
        '  <div class="textarea-holder">',
        '    <textarea ng-model="answer" rows="{{rows}}" cols="{{cols}}" ng-disabled="!editable" class="form-control text-input" />',
        '    <i class="warning-icon fa fa-warning"></i>',
        '  </div>',
        '  <div class="alert {{response.correctness == \'incorrect\' ? \'no-\' : \'\'}}feedback" ng-show="response.feedback" ng-bind-html-unsafe="response.feedback"></div>',
        '  <div ng-show="response.comments" class="well" ng-bind-html-unsafe="response.comments"></div>',
        '</div>'].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
