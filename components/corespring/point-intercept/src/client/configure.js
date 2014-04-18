var main = [
  function() {

    var labelWithInput = function(size, label, modelKey, labelSize) {
      labelSize = labelSize || size;
      return [
          '<label class="col-sm-' + labelSize + ' control-label">' + label + '</label>',
          '<div class="col-sm-' + size + '">',
          '  <input type="text" class="form-control"  ng-model="fullModel.model.config.' + modelKey + '" />',
        '</div>'
      ].join('');
    };

    var graphAttributes = [
      '<div class="input-holder">',
      '  <div class="header">Graph Attributes</div>',
      '  <div class="body">',
      '     <form class="form-horizontal" role="form">',
      '       <div class="config-form-row">',
      labelWithInput(2, 'Width:', 'graphWidth'),
      labelWithInput(2, 'Height:', 'graphHeight'),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput(2, 'Domain:', 'domain'),
      labelWithInput(3, 'Domain Label:', 'domainLabel'),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput(2, 'Range:', 'range'),
      labelWithInput(3, 'Range Label:', 'rangeLabel'),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput(2, 'Tick Label Frequency::', 'tickLabelFrequency', 4),
      labelWithInput(2, 'Scale:', 'scale'),
      '       </div>',
      '     </form>',
      '  </div>',
      '</div>'
    ].join('\n');

    var pointsBlock = [
      '<div class="input-holder">',
      '  <div class="header">Points</div>',
      '  <div class="body">',
      '     <form class="form-horizontal" role="form">',
      '       <div class="config-form-row">',
      '         <div class="col-sm-4">',
      '           <input id="absentRadio" type="radio" value="absent" ng-model="fullModel.model.config.labelsType" />',
      '           <label for="absentRadio" class="control-label">Student plots points</label>',
      '         </div>',
      '         <label class="col-sm-1 control-label">OR</label>',
      '         <div class="col-sm-6">',
      '           <input id="presentRadio" type="radio" value="present" ng-model="fullModel.model.config.labelsType" />',
      '           <label for="presentRadio" class="control-label">Student plots points WITH labels</label>',
      '         </div>',
      '       </div>',
      '       <div ng-repeat="p in points track by $index" class="config-form-row point-row" style="padding-left: 10px">',
      '         <label style="float: left; padding-top: 3px">(</label>',
      '         <div class="col-sm-2">',
      '           <input type="text" class="form-control" ng-model="p.correctResponse[0]" />',
      '         </div>',
      '         <label style="float: left; padding-top: 8px">,</label>',
      '         <div class="col-sm-2">',
      '           <input type="text" class="form-control" ng-model="p.correctResponse[1]" />',
      '         </div>',
      '         <label style="float: left; padding-top: 3px">)</label>',
      '         <div class="col-sm-4" ng-show="fullModel.model.config.labelsType == \'present\'">',
      '           <input type="text" class="form-control" ng-model="p.label" />',
      '         </div>',
      '         <div class="col-sm-1"><button ng-click="removePoint(p)" type="button" class="close">&times;</button>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row" ng-show="fullModel.model.config.labelsType == \'present\'">',
      '         <div class="col-sm-4"></div>',
      '         <div class="col-sm-6">',
      '           <input id="mustMatch" type="checkbox" ng-model="fullModel.model.config.orderMatters" />',
      '           <label for="mustMatch" class="control-label">Points must match labels</label>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <button class="btn btn-default" ng-click="addPoint()">Add Point</button>',
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput(2, "Maximum number of points a student is allowed to plot:", 'maxPoints', 8),
      '       </div>',
      '     </form>',
      '  </div>',
      '</div>'].join('\n');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            model.model = model.model || {};
            model.model.config = model.model.config || {};

            var labels = (model.model.config.pointLabels || []);

            scope.points = [];
            _.each(model.correctResponse, function(cr, idx) {
              var cra = cr.split(",");
              scope.points.push({
                label: labels[idx],
                correctResponse: cra
              });
            });
          },

          getModel: function() {
            var model = _.cloneDeep(scope.fullModel);
            return model;
          }
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

        var getLetterForIndex = function(idx) {
          return String.fromCharCode(65 + idx);
        };

        scope.addPoint = function() {
          scope.points.push({
            label: getLetterForIndex(scope.points.length),
            correctResponse: [0, 0]
          });
        };

        scope.removePoint = function(p) {
          scope.points = _.filter(scope.points, function(sp) {
            return sp !== p;
          });
        };


        scope.$watch('points', function(n) {
          if (n) {
            scope.fullModel.model.config.pointLabels = _.pluck(scope.points, 'label');
            scope.fullModel.correctResponse = _(scope.points).pluck('correctResponse').map(function(cr) {
              return cr[0] + "," + cr[1];
            }).value();
          }
        }, true);


      },
      template: [
        '<div class="point-intercept-configuration">',
        pointsBlock,
        graphAttributes,
        '</div>'
      ].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
