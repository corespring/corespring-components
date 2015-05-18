console.log('init');
angular.module('test-app', ['ngSanitize', 'ui.select']);

//Mock dependencies
angular.module('test-app').factory('ImageFeature', [function(){
  return function(){
    return {};
  }
}]);
angular.module('test-app').factory('WiggiLinkFeatureDef', [function(){
  return function(){
    return {};
  }
}]);
angular.module('test-app').factory('WiggiMathJaxFeatureDef', [function(){
  return function(){
    return {};
  } 
}]);

//Test helper
window.corespringComponentsTestLib = {};
corespringComponentsTestLib.verifyContainerBridge = function(bridge){
  var errors = [];
  function assertFunction(name){
    if(!_.isFunction(bridge[name])){
      errors.push(name);
    }
  }
  assertFunction('setDataAndSession');
  assertFunction('getSession');
  assertFunction('setResponse');
  assertFunction('setMode');
  assertFunction('reset');
  assertFunction('isAnswerEmpty');
  assertFunction('answerChangedHandler');
  assertFunction('editable');
  if(errors.length){
     return 'Missing methods: ' + errors.join(',')
  } else {
    return 'ok'
  }
};