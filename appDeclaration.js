console.log('init');
angular.module('test-app', ['ngSanitize', 'ui.select']);

//Mock dependencies
angular.module('test-app').factory('WiggiMathJaxFeatureDef', [function(){
  return function(){
    return {};
  } 
}]);