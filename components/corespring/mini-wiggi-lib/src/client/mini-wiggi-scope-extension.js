exports.framework = "angular";
exports.factory = [
  /**
   * TODO: Untangle - This feature 'ImageFeature' belongs the main editor.
   * It is not safe to use it in this context.
   */
  'ImageFeature',
  'WiggiLinkFeatureDef',
  'WiggiMathJaxFeatureDef',
  function(
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

      this.withExtraFeatureMath = function(){
        this.extraFeatureIds = this.extraFeatureIds || [];
        this.extraFeatureIds.push('math');
        return this;
      };

      this.withExtraFeatureLinks = function(){
        this.extraFeatureIds = this.extraFeatureIds || [];
        this.extraFeatureIds.push('link');
        return this;
      };

      function makeExtraFeatures(extraFeatureIds) {
        extraFeatureIds = extraFeatureIds || ['math', 'link'];
        var buttons = [];
        _.forEach(extraFeatureIds, function(featureId) {
          switch (featureId) {
            case 'math':
              buttons.push(new WiggiMathJaxFeatureDef());
              break;
            case 'link':
              buttons.push(new WiggiLinkFeatureDef());
              break;
          }
        });
        return {
          definitions: [
            {
              type: 'group',
              buttons: buttons
            }
          ]
        };
      }

      function makeMathJaxFeature() {
        return {
          type: 'group',
          buttons: [new WiggiMathJaxFeatureDef()]
        };
      }

      function makeLinkFeature() {
        return {
          type: 'group',
          buttons: [new WiggiLinkFeatureDef()]
        };
      }
    }

    return MiniWiggiScopeExtension;
  }
];