var link, main;

link = function () {
  return function (scope, element, attrs) {

    scope.containerBridge = {

      setDataAndSession: function (dataAndSession) {
        scope.question = dataAndSession.data.model;
        scope.session = dataAndSession.session || {};

        scope.answer = scope.session.answers;

      },

      getSession: function () {
        var answer = scope.answer;

        return {
          answers: answer,
          stash: scope.session.stash
        };
      },

      // sets the server's response
      setResponse: function (response) {
        console.log("Setting Response for text entry:");
        console.log(response);

        scope.correctClass = response.correctness;
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
      template: [ '<div class="view-text-entry">',
        '<input type="text" ng-model="answer" class="{{correctClass}}"/>',
        '</div>'].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
