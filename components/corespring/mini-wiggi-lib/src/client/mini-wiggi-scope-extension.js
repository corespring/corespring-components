exports.framework = "angular";
exports.factory = [
  'WiggiMathJaxFeatureDef',
  'WiggiLinkFeatureDef',
  'ComponentImageService',
  function(WiggiMathJaxFeatureDef, WiggiLinkFeatureDef, ComponentImageService) {

    /**
     * Provide features to the scope that are used by mini wiggi
     */
    function MiniWiggiScopeExtension() {

      this.postLink = function($scope) {

        $scope.imageService = function() {
          return ComponentImageService;
        };

        $scope.extraFeatures = {
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

        $scope.linkFeature = {
          definitions: [{
            type: 'group',
            buttons: [
              new WiggiLinkFeatureDef()
            ]
          }]
        };

        $scope.updateMathJax = function() {
          scope.$emit('mathJaxUpdateRequest');
        };

      };
    }

    return MiniWiggiScopeExtension;
  }
];
