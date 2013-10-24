exports.wrapDirective = (name, contents) ->
  """
  (function(){

    var exports = {};
    //component definition -----------------------
    #{contents}
    //end ----------------------------------------

    var ngModule = angular.module('test-app');
    console.log("#{name}");

    if( exports.directive ){
      ngModule.directive( '#{name}', exports.directive);
    } else if( exports.directives ){

      var hasDefault = false;

      for( var i = 0; i < exports.directives.length; i++ ){
        var innerDef = exports.directives[i];
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