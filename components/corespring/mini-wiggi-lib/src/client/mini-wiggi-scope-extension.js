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

        scope.imageUploadedToChoice = function(q) {
          q.imageName = scope.uploadingFilename;
          scope.$apply();
        };

        scope.getUploadUrl = function(file) {
          scope.uploadingFilename = file.name;
          return file.name;
        };

      };
    }

    return MiniWiggiScopeExtension;
  }
];


exports.framework = "angular";
exports.factory = def;