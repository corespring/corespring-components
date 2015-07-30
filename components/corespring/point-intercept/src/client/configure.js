/* global corespring */

var main = [
  'ServerLogic',
  'ChoiceTemplates',
  'ComponentDefaultData',
  function(ServerLogic, ChoiceTemplates, ComponentDefaultData) {

    this.inline = function(type, value, body, attrs) {
      return ['<label class="' + type + '-inline">',
        '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
        '</label>'
      ].join('\n');
    };

    var labelWithInput = function(options) {
      options.size = options.size || 3;
      options.labelSize = options.labelSize || options.size;
      options.inputType = options.inputType || "text";
      options.inputClass = options.inputClass || "default-input";
      return [
        '<label class="col-sm-' + options.labelSize + '">' + options.label + '</label>',
        '<div class="col-sm-' + options.size + ' ' + options.inputClass + '">',
        '  <input ',
        '    type="' + options.inputType + '" ',
        '    class="form-control" ',
        '    ng-model="fullModel.model.config.' + options.modelKey + '" ',
        options.placeholder ? ('placeholder="' + options.placeholder + '"') : '',
        '  />',
        '</div>'
      ].join('');
    };

    var graphAttributes = [
      '<hr>',
      '<div class="row"><div class="col-md-8">',
      '  <h3>Graph Attributes</h3>',
      '  <div class="body">',
      '  <p>Use this section to setup the graph area</p>',
      '     <form class="form-horizontal" role="form">',
      '       <div class="config-form-row">',
      labelWithInput({
        label: 'Width:',
        modelKey: 'graphWidth',
        placeholder: '{{defaults.graphWidth}}'
      }),
      labelWithInput({
        label: 'Height:',
        modelKey: 'graphHeight',
        placeholder: '{{defaults.graphHeight}}'
      }),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput({
        label: 'Domain:',
        modelKey: 'domain',
        inputType: "number",
        placeholder: '{{defaults.domain}}'
      }),
      labelWithInput({
        label: 'Domain Label:',
        modelKey: 'domainLabel',
        placeholder: '{{defaults.domainLabel}}'
      }),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput({
        label: 'Range:',
        modelKey: 'range',
        inputType: "number",
        placeholder: '{{defaults.range}}'
      }),
      labelWithInput({
        label: 'Range Label:',
        modelKey: 'rangeLabel',
        placeholder: "y"
      }),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput({
        label: 'Tick Label Frequency:',
        modelKey: 'tickLabelFrequency',
        inputType: "number",
        placeholder: '{{defaults.tickLabelFrequency}}'
      }),
      '       </div>',
      '     </form>',
      '  </div>',
      '</div></div>'
    ].join('\n');

    var pointsBlock = [
      '<div class="row">',
      '   <div class="col-md-12">',
      '     <h3>Points</h3>',
      '   </div>',
      '   <div class="col-md-12">',
      '     <form class="form-horizontal" role="form">',
      '         <div class="col-sm-6">',
      '           <radio id="absentRadio" value="absent" ng-model="fullModel.model.config.labelsType">Student plots points</radio>',
      '           <radio id="presentRadio" value="present" ng-model="fullModel.model.config.labelsType">Student plots points WITH labels</radio>',
      '       <div class="row">',
      '         <div class="col-md-offset-1 col-sm-9">',
      '           <checkbox id="showCoords" ng-model="fullModel.model.config.showCoordinates">Show Point Coordinates</checkbox>',
      '         </div>',
      '       </div>',
      '       <div class="row" ng-show="fullModel.model.config.labelsType == \'present\'">',
      '         <div class="col-md-offset-1 col-sm-9">',
      '           <checkbox id="mustMatch" ng-model="fullModel.model.config.orderMatters">Points must match labels</checkbox>',
      '         </div>',
      '       </div>',
      '       <div class="row">',
      '         <div class="col-md-offset-1 col-sm-6">',
      '           <label class="control-label">Maximum number of points a student is allowed to plot:</label>',
      '         </div>',
      '         <div class="col-sm-2">',
      '           <input type="number" class="form-control max-points" ng-model="fullModel.model.config.maxPoints" />',
      '         </div>',
      '       </div>',
      '         </div>',
      '       <div class="col-md-6">',
      '       <div ng-repeat="p in points track by $index" class="col-md-12 point-row">',
      '         <span class="point-parenthesis">(</span>',
      '         <div class="col-sm-2 coordinate-input">',
      '           <input type="text" class="form-control" ng-model="p.correctResponse[0]" />',
      '         </div>',
      '         <span class="point-comma">,</span>',
      '         <div class="col-sm-2 coordinate-input">',
      '           <input type="text" class="form-control" ng-model="p.correctResponse[1]" />',
      '         </div>',
      '         <span class="point-parenthesis">)</span>',
      '         <div class="col-sm-4" ng-show="fullModel.model.config.labelsType == \'present\'">',
      '           <input type="text" class="form-control" ng-model="p.label" />',
      '         </div>',
      '         <div class="col-sm-1"><button ng-click="removePoint(p)" type="button" class="close">&times;</button>',
      '         </div>',
      '       </div>',
      '         <button class="btn btn-default" ng-click="addPoint()"><i class="fa fa-plus"></i>  Add Another Point</button>',
      '       </div>',

      '     </form>',
      '   </div>',
      '</div>'
    ].join('\n');


    var feedback = [
      '<div class="row"><div class="col-md-8">',
      '  <div feedback-panel>',
      '      <div feedback-selector',
      '           fb-sel-label="If answered correctly, show"',
      '           fb-sel-class="correct"',
      '           fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '           fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '           fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '      ></div>',
      '      <div feedback-selector',
      '           fb-sel-label="If partially correct, show"',
      '           fb-sel-class="partial"',
      '           fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '           fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '           fb-sel-default-feedback="{{defaultPartialFeedback}}"',
      '      ></div>',
      '      <div feedback-selector',
      '           fb-sel-label="If answered incorrectly, show"',
      '           fb-sel-class="incorrect"',
      '           fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '           fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '           fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '      ></div>',
      '  </div>',
      '</div></div>'
    ].join('\n');

    return {
      scope: false,
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.defaults = ComponentDefaultData.getDefaultData('corespring-point-intercept', 'model.config');
        ChoiceTemplates.extendScope(scope, 'corespring-point-intercept');
        var server = ServerLogic.load('corespring-point-intercept');
        scope.defaultCorrectFeedback = server.keys.DEFAULT_CORRECT_FEEDBACK;
        scope.defaultPartialFeedback = server.keys.DEFAULT_PARTIAL_FEEDBACK;
        scope.defaultIncorrectFeedback = server.keys.DEFAULT_INCORRECT_FEEDBACK;
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
            scope.updateNumberOfCorrectResponses(scope.fullModel.correctResponse.length);
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
          scope.updateNumberOfCorrectResponses(scope.fullModel.correctResponse.value.length);
        };

        scope.removePoint = function(p) {
          scope.points = _.filter(scope.points, function(sp) {
            return sp !== p;
          });
          scope.updateNumberOfCorrectResponses(scope.fullModel.correctResponse.value.length);
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

        scope.resetDefaults = function() {
          var defaults = scope.defaults;

          function reset(property, value) {
            scope.fullModel.model.config[property] = value;
          }

          reset('graphWidth', defaults.graphWidth);
          reset('graphHeight', defaults.graphHeight);
          reset('domain', defaults.domain);
          reset('domainLabel', defaults.domainLabel);
          reset('range', defaults.range);
          reset('rangeLabel', defaults.rangeLabel);
          reset('tickLabelFrequency', defaults.tickLabelFrequency);
          reset('sigfigs', defaults.sigfigs);
        };

      },
      template: [
        '<div class="config-point-intercept">',
        '  <div navigator-panel="Design">',
        '    <div class="point-intercept-configuration col-md-12">',
        '      <p>',
        '        In Plot Points, students identify coordinates or plot points on a graph by clicking on the graph.',
        '      </p>',
               pointsBlock,
               graphAttributes,
        '      <div class="row">',
        '        <div class="col-md-8">',
        '          <a class="reset-defaults btn btn-default" ng-click="resetDefaults()">Reset to default values</a>',
        '        </div>',
        '      </div>',
               feedback,
        '    </div>',
        '  </div>',
        '  <div navigator-panel="Scoring">',
            ChoiceTemplates.scoring(),
        '  </div>',
        '</div>'
      ].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
