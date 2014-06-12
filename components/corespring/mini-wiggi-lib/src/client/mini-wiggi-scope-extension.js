var def = [
  '$log',
  'WiggiMathJaxFeatureDef',
  'ComponentImageService',
  function($log, WiggiMathJaxFeatureDef, ComponentImageService) {

    var log = $log.log.bind($log,'MiniWiggiScopeExtension');

    /**
     * Provide features to the scope that are used by mini wiggi
     */
    function MiniWiggiScopeExtension() {

      this.postLink = function(scope, elm, attr) {

        //log("postLink imageService", ComponentImageService);
        //log("postLink mathjaxFeature", WiggiMathJaxFeatureDef);

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