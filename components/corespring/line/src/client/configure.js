var main = [
  'ComponentDefaultData',
  'CanvasTemplates',
  function(ComponentDefaultData, CanvasTemplates) {

    var linesBlock = [
      '<div class="row">',
      '  <div class="body col-md-12">',
      '    <h3>Lines</h3>',
      '  </div>',
      '</div>',
      '<div class="row">',
      '  <div class="col-md-12 intro-text">',
      '    Line equations must be in y=mx+b form. Only whole number coordinates can be plotted.',
      '  </div>',
      '</div>',
      '<div class="row equation-labels">',
      '  <div class="col-md-6" ng-hide="fullModel.model.config.exhibitOnly"><strong>Correct Line</strong></div>',
      '  <div class="col-md-6"><strong>Initial View</strong></div>',
      '</div>',
      '<form class="form-horizontal" role="form">',
      '  <div class="config-form-row row">',
      '    <div class="col-md-6" ng-hide="fullModel.model.config.exhibitOnly">',
      '      <div class="input-group" ng-class="{ \'has-error\': !isValidFormula(correctResponse) }">',
      '        <span class="input-group-addon">y = </span><input type="text" class="form-control" cs-tooltip-title="Please use the linear (y=mx+b) form" cs-tooltip-is-open="!isValidFormula(correctResponse)" placeholder="mx+b" ng-model="correctResponse" />',
      '      </div>',
      '    </div>',
      '    <div class="col-md-6">',
      '      <div class="input-group">',
      '        <span class="input-group-addon">y = </span><input type="text" class="form-control" cs-tooltip-title="Please use the linear (y=mx+b) form" cs-tooltip-is-open="!isValidFormula(initialCurve)" placeholder="mx+b" ng-model="initialCurve" />',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="config-form-row exhibit-row row">',
      '    <div class="col-sm-6">',
      '      <checkbox ng-model="fullModel.model.config.exhibitOnly"',
      '          tooltip="An exhibit graph is view only and can not be manipulated by the student."',
      '          tooltip-append-to-body="true"',
      '          tooltip-placement="bottom">',
      '        Make this graph an exhibit only',
      '      </checkbox>',
      '    </div>',
      '  </div>',
      '</form>'].join('\n');

    var feedback = [
      '<div ng-hide="fullModel.model.config.exhibitOnly" class="input-holder">',
      '  <div feedback-panel>',
      '     <div feedback-selector',
      '          fb-sel-label="If answered correctly, show"',
      '          fb-sel-class="correct"',
      '          fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '          fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '          fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '     ></div>',
      '     <div feedback-selector',
      '          fb-sel-label="If answered incorrectly, show"',
      '          fb-sel-class="incorrect"',
      '          fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '          fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '          fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '     ></div>',
      '  </div>',
      '</div>'].join('\n');

    return {
      scope: false,
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.defaults = ComponentDefaultData.getDefaultData('corespring-line', 'model.config');
        CanvasTemplates.extendScope(scope, 'corespring-line');

        scope.defaultCorrectFeedback = "Correct!";
        scope.defaultIncorrectFeedback = "Good try but that is not the correct answer.";

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            model.model = model.model || {};
            model.model.config = model.model.config || {};
            scope.checkUndefinedProperties(model.model.config);

            scope.correctResponse = (scope.fullModel) ? scope.removeYEqualsPrefix(scope.fullModel.correctResponse) : undefined;
            scope.initialCurve = (scope.fullModel && scope.fullModel.model && scope.fullModel.model.config && scope.fullModel.model.config.initialCurve) ?
              scope.removeYEqualsPrefix(scope.fullModel.model.config.initialCurve) : undefined;

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

        scope.isValidFormula = function(s) {
          return /^(y=)?([+-]?\d+(\.\d+)?x([+-]\d+(\.\d+)?)?|\d+(\.\d+)?)$/i.test(s);
        };

        scope.removeYEqualsPrefix = function(expression) {
          return expression.replace(/^y\s?=\s?/,'');
        };

        scope.prefixWithYEquals = function(expression) {
          if(expression) {
            return (expression.replace(/ /g, '').indexOf('y=') === 0) ? expression : ("y=" + expression);
          } else {
            return '';
          }
        };

        scope.$watch('correctResponse', function(newValue) {
          scope.fullModel.correctResponse = scope.prefixWithYEquals(newValue);
        });

        scope.$watch('initialCurve', function(newValue) {
          scope.fullModel.model.config.initialCurve = scope.prefixWithYEquals(newValue);
        });

        scope.resetDefaults = function() {
          scope.resetCanvasGraphAttributes();
          scope.resetCanvasDisplayAttributes();
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      },
      template: [
        '<div class="line-interaction-configuration col-md-12">',
        '  <p>',
        '    This interaction asks a student to draw a line that meets specific criteria.',
        '    The student will draw the line by clicking on two points on the graph.',
        '  </p>',
           linesBlock,
        '  <hr />',
           CanvasTemplates.configGraph(),
        '    <hr />',
           CanvasTemplates.configDisplay(true),
        '  <div class="row">',
        '   <div class="col-md-8">',
        '     <a class="reset-defaults btn btn-default" ng-click="resetDefaults()">Reset to default values</a>',
        '   </div>',
        '  </div>',
        '  <div class="row"><div class="col-xs-12">',
           feedback,
        '  </div></div>',
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
