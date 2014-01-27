var link, main;

link = function () {
  return function (scope, element, attrs) {

    scope.editable = true;

    scope.containerBridge = {

      setDataAndSession: function (dataAndSession) {
        scope.question = dataAndSession.data.model;
        scope.session = dataAndSession.session || {};

        scope.rows = (dataAndSession.data.model.config && dataAndSession.data.model.config.rows) || 4;
      },

      getSession: function () {
        return {
          answers: scope.answer
        };
      },

      // sets the server's response
      setResponse: function (response) {
        console.log("Setting Response for extended text entry:");
        console.log(response);

        scope.answer = response.studentResponse;

        scope.received = true;
      },

      setMode : function(newMode) {
      },

      reset : function(){
      },

      isAnswerEmpty: function(){
        return _.isEmpty(this.getSession().answers);
      },

      answerChangedHandler: function(callback){
        scope.$watch("answer", function(newValue, oldValue){
          if(newValue){
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
};

main = [
  function () {
    var def;
    def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="view-extended-text-entry">',
        '<textarea ng-model="answer" rows="{{rows}}" ng-disabled="!editable" class="form-control text-input" />',
        '</div>'].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
