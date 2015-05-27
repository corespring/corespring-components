exports.wrapAngular = (moduleName, name, contents) ->
  """
  (function(){
    var definition = (function(exports, require){
        #{contents};
        return exports;
    })(corespring.client.component("#{name}", "#{moduleName}"), corespring.require);

    definition.initializeComponent();
  })();
  """

exports.preroll = ->
  """
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
  """