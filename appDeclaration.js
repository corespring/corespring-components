console.log('init');

//Mock assets and their requests

angular.module('test-app', ['ngSanitize', 'ui.select']).run(['$httpBackend',function($httpBackend) {
  $httpBackend.whenGET(/mock-assets\/.*/).respond('');
}]);

angular.module('test-app').constant('ASSETS_PATH', 'mock-assets');


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
angular.module('test-app').service('LogFactory', [function(){
  return {
    getLogger: function(id){
       return {
          log: function(){},
          debug: function(){},
          warn: function(){},
          error: function(){}
       };
    }
  };
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

  assertFunction('answerChangedHandler');
  assertFunction('editable');
  assertFunction('getSession');
  assertFunction('isAnswerEmpty');
  assertFunction('reset');
  assertFunction('setDataAndSession');
  assertFunction('setInstructorData');
  assertFunction('setMode');
  assertFunction('setResponse');
  assertFunction('setPlayerSkin');

  if(errors.length){
     return 'Missing methods: ' + errors.join(',')
  } else {
    return 'ok'
  }
};