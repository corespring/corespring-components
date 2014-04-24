/* global corespring */

var main = [ 'ServerLogic',
  function(ServerLogic) {

    this.inline = function(type, value, body, attrs) {
      return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
        '</label>'].join('\n');
    };

    var labelWithInput = function(size, label, modelKey, labelSize, inputType) {
      labelSize = labelSize || size;
      inputType = inputType || "text";
      return [
          '<label class="col-sm-' + labelSize + ' ">' + label + '</label>',
          '<div class="col-sm-' + size + '">',
          '  <input type="' + inputType + '" class="form-control"  ng-model="fullModel.model.config.' + modelKey + '" />',
        '</div>'
      ].join('');
    };

    var graphAttributes = [
      '<div class="input-holder">',
      '  <div class="header">Graph Attributes</div>',
      '  <div class="body">',
      '     <form class="form-horizontal" role="form">',
      '       <div class="config-form-row">',
      labelWithInput(3, 'Width:', 'graphWidth'),
      labelWithInput(3, 'Height:', 'graphHeight'),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput(3, 'Domain:', 'domain', 3, "number"),
      labelWithInput(3, 'Domain Label:', 'domainLabel'),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput(3, 'Range:', 'range', 3, "number"),
      labelWithInput(3, 'Range Label:', 'rangeLabel'),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput(3, 'Tick Label Frequency:', 'tickLabelFrequency', 3, "number"),
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
      '         <div class="col-sm-8">',
      '           <input id="absentRadio" type="radio" value="absent" ng-model="fullModel.model.config.labelsType" />',
      '           <label for="absentRadio" class="control-label">Student plots points</label>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-8">',
      '           <input id="presentRadio" type="radio" value="present" ng-model="fullModel.model.config.labelsType" />',
      '           <label for="presentRadio" class="control-label">Student plots points WITH labels</label>',
      '         </div>',
      '       </div>',
      '       <div ng-repeat="p in points track by $index" class="config-form-row point-row" style="padding-left: 10px">',
      '         <label style="float: left; padding-top: 3px">(</label>',
      '         <div class="col-sm-2 coordinate-input">',
      '           <input type="text" class="form-control" ng-model="p.correctResponse[0]" />',
      '         </div>',
      '         <label style="float: left; padding-top: 8px">,</label>',
      '         <div class="col-sm-2 coordinate-input">',
      '           <input type="text" class="form-control" ng-model="p.correctResponse[1]" />',
      '         </div>',
      '         <label style="float: left; padding-top: 3px">)</label>',
      '         <div class="col-sm-4" ng-show="fullModel.model.config.labelsType == \'present\'">',
      '           <input type="text" class="form-control" ng-model="p.label" />',
      '         </div>',
      '         <div class="col-sm-1"><button ng-click="removePoint(p)" type="button" class="close">&times;</button>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <button class="btn btn-default" ng-click="addPoint()">Add Another Point</button>',
      '       </div>',
      '       <div class="config-form-row" ng-show="fullModel.model.config.labelsType == \'present\'">',
      '         <div class="col-sm-9">',
      '           <input id="mustMatch" type="checkbox" ng-model="fullModel.model.config.orderMatters" />',
      '           <label for="mustMatch" class="control-label">Points must match labels</label>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-9">',
      '           <input id="showCoords" type="checkbox" ng-model="fullModel.model.config.showCoordinates" />',
      '           <label for="showCoords" class="control-label">Show Coordinates</label>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-6" style="max-width: 300px">',
      '           <label class="control-label">Maximum number of points a student is allowed to plot:</label>',
      '         </div>',
      '         <div class="col-sm-3">',
      '           <input type="number" class="form-control" ng-model="fullModel.model.config.maxPoints" />',
      '         </div>',
      '       </div>',
      '     </form>',
      '  </div>',
      '</div>'].join('\n');


    var feedback = [
      '<div class="input-holder">',
      '  <div class="header">Feedback</div>',
      '  <div class="body">',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="If answered correctly, show"',
      '               fb-sel-class="correct"',
      '               fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '               fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '          ></div>',
      '        </div>',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="If answered incorrectly, show"',
      '               fb-sel-class="incorrect"',
      '               fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '               fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '          ></div>',
      '  </div>',
      '</div>'].join('\n');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        var server = ServerLogic.load('corespring-point-intercept');
        scope.defaultCorrectFeedback = server.DEFAULT_CORRECT_FEEDBACK;
        scope.defaultIncorrectFeedback = server.DEFAULT_INCORRECT_FEEDBACK;
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


        scope.$watch('fullModel.model.config.maxPoints', function(n) {
          var min = scope.points.length;
          if (!_.isUndefined(n) && n < min) {
            scope.fullModel.model.config.maxPoints = min;
          }
          if (!_.isUndefined(n) && !_.isNumber(n)) {
            scope.fullModel.model.config.maxPoints = "";
          }
        });

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
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        pointsBlock,
        graphAttributes,
        feedback,
        '</div>',
        '</div>',
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
