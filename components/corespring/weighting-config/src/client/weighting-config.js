exports.framework = 'angular';
exports.directive = {
  name: "corespringWeightingConfig",
  directive: ['LogFactory', WeightingConfig]
};

function WeightingConfig(LogFactory) {

  var $log = LogFactory.getLogger('WeightingConfig');

  return {
    link: link,
    replace: true,
    restrict: 'E',
    template: template(),
    scope: {
      allowWeighting: '=',
      categories: '=',
      model: '='
    }
  };

  function link(scope, elem, attr) {
    scope.numberOfCategories = 0;

    scope.getPercentage = getPercentage;
    scope.isPanelCollapsed = isPanelCollapsed;
    scope.toggleWeighting = toggleWeighting;

    scope.$watch('categories.length', function(newValue) {
      scope.numberOfCategories = newValue || 0;
    });

    //--------------------------------------------------------------

    function isPanelCollapsed(){
      var collapsed = !(scope.allowWeighting && hasWeightingToConfigure());
      if(isWeightingHidden()) {
        fixPanelCollapsed(collapsed);
      }
      return collapsed;

      //-----------------------

      function hasWeightingToConfigure(){
        return scope.numberOfCategories > 1;
      }

      function isWeightingHidden(){
        return elem.parents('.ng-hide').length > 0;
      }

      function fixPanelCollapsed(isCollapsed){
        var panelBody = elem.find('.panel-body');
        panelBody.removeClass('collapsing');
        if(isCollapsed){
          panelBody.addClass('collapse');
          panelBody.height(0);
        } else {
          panelBody.addClass('collapse in');
          panelBody.height('auto');
        }
      }
    }

    function toggleWeighting() {
      if (scope.numberOfCategories > 1) {
        scope.allowWeighting = !scope.allowWeighting;
      }
    }

    function getPercentage(weight) {
      if(weight === 0){
        return 0;
      }
      var totalWeight = _.reduce(scope.model, function(sum, weighting) {
        return sum + parseInt(weighting.weight, 10);
      }, 0);
      var p = weight * 100 / totalWeight;
      return Math.floor(p * 100) / 100;
    }

  }

  function template() {
    return [
      '<div class="corespring-weighting">',
      '  <div class="weighting-header-text">',
      '   In an item with more than one category, you can assign ',
      '   specific weights to each part. This feature is optional; ',
      '   if you don\'t adjust weights, weight will be evenly divided ',
      '   across each category.',
      '  </div>',
      '  <div class="panel panel-default" ng-class="{disabled: numberOfCategories <= 1}">',
      '   <div class="panel-heading">',
      '     <h4 class="panel-title">',
      '       <a ng-click="toggleWeighting()">',
      '         <span class="icon">',
      '           <i class="fa fa-{{isPanelCollapsed() ? \'plus\' : \'minus\'}}-circle"></i>',
      '         </span>',
      '         Weighting Rules',
      '       </a>',
      '     </h4>',
      '   </div>',
      '   <div class="weighting">',
      '     <div class="panel-body" collapse="numberOfCategories <= 1 || !allowWeighting">',
      '       <form class="weight-form">',
      '         <div class="weighting-item" ng-repeat="item in model">',
      '           <div class="label-cell right">',
      '             <span class="control-label"><span class="item-label" ng-bind-html="item.label"></span> is worth</span>',
      '           </div>',
      '           <div class="input-cell">',
      '             <div class="input-group">',
      '               <input class="form-control" type="number" min="0" max="99" ng-model="item.weight" style="width:100%!important;margin-bottom:0;"/>',
      '               <span class="input-group-addon">pts</span>',
      '               <span class="input-group-addon" style="width: 82px;">{{getPercentage(item.weight)}}%</span>',
      '             </div>',
      '           </div>',
      '         </div>',
      '       </form>',
      '     </div>',
      '   </div>',
      '  </div>',
      '</div>'
    ].join('');
  }
}