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
  angular.module('test-app').factory('WiggiMathJaxFeatureDef', [function(){
    return function(){
      return {};
    } 
  }]);
  """