var link = function () {
  return function (scope, element, attrs) {

    scope.containerBridge = {

      setDataAndSession: function (dataAndSession) {
      },

      getSession: function () {
      },

      setResponse: function (response) {
      },

      setMode : function(newMode) {
      },

      reset : function(){
      },

      isAnswerEmpty: function(){
      },

      answerChangedHandler: function(callback){
      },

      editable: function (e) {
      }

    };
    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

  };
};

var main = [
  function () {
    var def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
