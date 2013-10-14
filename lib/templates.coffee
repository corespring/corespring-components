exports.wrapDirective = (name, contents) ->
  """
  (function(){

    //component definition --
    #{contents}
    //end

    var ngModule = angular.module('test-app');
    console.log("#{name}");
    //angular.module('test-app').directive('#{name}', componentDefinition.directive);

    if( componentDefinition.directive ){
      ngModule.directive( '#{name}', componentDefinition.directive);
    } else if( componentDefinition.directives ){

      var hasDefault = false;

      for( var i = 0; i < componentDefinition.directives.length; i++ ){
        var innerDef = componentDefinition.directives[i];
        var name = innerDef.name ? innerDef.name : '#{name}';

        if(!hasDefault){
          hasDefault = innerDef.name == undefined;
        };

        ngModule.directive( name, innerDef.directive);
        if(!hasDefault){
          throw "No default directive defined"
        }
      }
    }
  })();
  """