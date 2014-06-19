var def = [
  'WiggiMathJaxFeatureDef',
  'ComponentImageService',
  function(WiggiMathJaxFeatureDef, ComponentImageService) {

    /**
     * Provide features to the scope that are used by mini wiggi
     */
    function MiniWiggiScopeExtension() {

      this.postLink = function(scope, elm, attr) {

        scope.imageService = function(){
          return ComponentImageService;
        };

        scope.extraFeatures = {
          definitions: [{
            type: 'group',
            buttons: [new WiggiMathJaxFeatureDef()]
          }]
        };

      };
    }

    return MiniWiggiScopeExtension;
  }
];


exports.framework = "angular";
exports.factory = def;