exports.framework = "angular";
exports.factory = [
  'ComponentImageService',
  'ImageFeature',
  'WiggiLinkFeatureDef',
  'WiggiMathJaxFeatureDef',
  function(
      ComponentImageService,
      ImageFeature,
      WiggiLinkFeatureDef,
      WiggiMathJaxFeatureDef
  ) {

    /**
     * Provide features to the scope that are used by mini wiggi
     */
    function MiniWiggiScopeExtension() {

      this.postLink = function(scope) {

        if(scope.hasMiniWiggiScopeExtension){
          return;
        }
        scope.hasMiniWiggiScopeExtension = true;

        scope.imageService = function() {
          return ComponentImageService;
        };

        scope.overrideFeatures = [
          ImageFeature
        ];

        scope.extraFeatures = {
          definitions: [
            {
              type: 'group',
              buttons: [new WiggiMathJaxFeatureDef()]
            },
            {
              type: 'group',
              buttons: [new WiggiLinkFeatureDef()]
            }
          ]
        };

        scope.linkFeature = {
          definitions: [{
            type: 'group',
            buttons: [
              new WiggiLinkFeatureDef()
            ]
          }]
        };

        scope.updateMathJax = function() {
          scope.$emit('mathJaxUpdateRequest');
        };

      };
    }

    return MiniWiggiScopeExtension;
  }
];