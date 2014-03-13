var main = [
  function() {
    var promptBlock = [
      '<div class="input-holder">',
      '  <div class="header">Prompt</div>',
      '  <div class="body">',
      '    <textarea ck-editor ng-model="fullModel.model.prompt"></textarea>',
      '  </div>',
      '</div>'].join('\n');

    var additionalTextBlock = [
      '<div class="input-holder">',
      '  <div class="header">Additional Text</div>',
      '  <div class="body">',
      '    <textarea ck-editor ng-model="fullModel.model.config.additionalText"></textarea>',
      '  </div>',
      '</div>'].join('\n');

    var pointsBlock = [
      '<div class="input-holder">',
      '  <div class="header">Points</div>',
      '  <div class="body">',
      '     <form class="form-horizontal" role="form">',
      '       <div class="form-group">',
      '         <label for="ignore-case" class="col-sm-4 control-label">Number of points</label>',
      '         <div class="col-sm-2">',
      '           <input type="text" id="expected-length" class="form-control"  ng-model="fullModel.model.config.maxPoints" />',
      '         </div>',
      '       </div>',
      '       <div ng-repeat="p in points track by $index" class="form-group">',
      '         <div class="col-sm-4">',
      '           <input type="text" class="form-control" ng-model="p.label" />',
      '         </div>',
      '         <div class="col-sm-2">',
      '           <input type="text" class="form-control" ng-model="p.correctResponse[0]" />',
      '         </div>',
      '         <div class="col-sm-2">',
      '           <input type="text" class="form-control" ng-model="p.correctResponse[1]" />',
      '         </div>',
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

            var labels = (model.model.config.pointLabels || "").split(",");
            scope.xLabel = labels[1];
            scope.yLabel = labels[0];

            scope.points = [];

          },

          getModel: function() {
            return scope.fullModel;
          }
        };

        scope.registerConfigPanel(attrs.id, scope.containerBridge);

        scope.$watch('fullModel.model.config.maxPoints', function(n, o) {
          if (!n) {
            return;
          }

          console.log(n);
          console.log(o);


          var correctResponse = scope.fullModel.correctResponse || ["0,0", "0,0"];
          var labels = (scope.fullModel.model.config.pointLabels || "").split(",");

          var getLabel = function(i) {
            if (labels[i]) {
              return labels[i];
            }
            if (i < 3) {
              return ['x','y','z'][i];
            }
            return 'P' + (i - 3);
          };

          scope.points.length = 0;
          for (var i = 0; i < scope.fullModel.model.config.maxPoints ; i++) {
            scope.points.push({
              label: getLabel(i),
              correctResponse: (correctResponse[i] || "").split(",")
            });
          }

        });

        scope.$watch('points', function(n) {
          if (n) {
            scope.fullModel.model.config.pointLabels = _.pluck(scope.points, 'label').join(",");
            scope.fullModel.correctResponse = _(scope.points).pluck('correctResponse').map(function(cr) {
              return cr[0]+","+cr[1];
            }).value();
          }
        }, true);


      },
      template: [
        '<div class="point-intercept-configuration">',
        promptBlock,
        additionalTextBlock,
        pointsBlock,
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
