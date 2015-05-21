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
     * With extraFeatureIds you can decide which extraFeatures to add to extraFeatures
     * By default math and link are added
     */
    function MiniWiggiScopeExtension() {

      this.postLink = function(scope) {

        if (scope.hasMiniWiggiScopeExtension) {
          return;
        }
        scope.hasMiniWiggiScopeExtension = true;

        scope.imageService = function() {
          return ComponentImageService;
        };

        scope.overrideFeatures = [
          ImageFeature
        ];

        scope.extraFeatures = makeExtraFeatures(this.extraFeatureIds);

        scope.linkFeature = {
          definitions: [makeLinkFeature()]
        };

        scope.updateMathJax = function() {
          scope.$emit('mathJaxUpdateRequest');
        };
      };

      this.withExtraFeatures = function(extraFeatureIds){
        this.extraFeatureIds = extraFeatureIds;
        return this;
      };

      function makeExtraFeatures(extraFeatureIds) {
        extraFeatureIds = extraFeatureIds || ['math', 'link'];
        var definitions = [];
        _.forEach(extraFeatureIds, function(featureId) {
          switch (featureId) {
            case 'link':
              definitions.push(makeLinkFeature());
              break;
            case 'math':
              definitions.push(makeMathJaxFeature());
              break;
          }
        });
        return {
          definitions: definitions
        };
      }

      function makeMathJaxFeature() {
        return {
          type: 'group',
          buttons: [new WiggiMathJaxFeatureDef()]
        }
      }

      function makeLinkFeature() {
        return {
          type: 'group',
          buttons: [new WiggiLinkFeatureDef()]
        }
      }
    }

    return MiniWiggiScopeExtension;
  }
];