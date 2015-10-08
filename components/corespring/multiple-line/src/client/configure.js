var main = ['ComponentDefaultData',
  function(ComponentDefaultData) {

    this.inline = function(type, value, body, attrs) {
      return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
        '</label>'].join('\n');
    };

    var labelWithInput = function(options) {
      options.size = options.size || 3;
      options.labelSize = options.labelSize || options.size;
      options.labelClass = options.labelClass || "";
      options.inputType = options.inputType || "text";
      options.inputClass = options.inputClass || "default-input";
      return [
          '<label class="col-sm-' + options.labelSize+' '+options.labelClass+'">' + options.label + '</label>',
          '<div class="col-sm-' + options.size + ' ' + options.inputClass + '">',
          '  <input ',
          '    type="' + options.inputType + '" ',
          '    class="form-control" ',
          '    ng-model="fullModel.model.config.' + options.modelKey + '" ',
          options.placeholder ? ('placeholder="' + options.placeholder + '" ') : '',
          options.extraProperties,
          '  />',
        '</div>'
      ].join('');
    };

    var linesBlock = [
      '<div class="row">',
      '  <div class="body col-md-12">',
      '    <h3>Lines</h3>',
      '    <div class="row">',
      '      <div class="col-md-12 intro-text"><strong>Line equations must be in y=mx+b form. Only whole number coordinates can be plotted.</strong></div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-md-8">',
      '        <checkbox ng-model="fullModel.model.config.exhibitOnly">',
      '          Make this graph an exhibit only',
      '        </checkbox>',
      '      </div>',
      '    </div><br />',
      '    <div class="row">',
      '      <div class="col-md-3"><strong>Label (Optional)</strong></div>',
      '      <div class="col-md-4"><strong>Correct Line</strong></div>',
      '      <div class="col-md-4"><strong>Initial View (Optional)</strong></div>',
      '      <div class="col-md-1"></div>',
      '    </div><br />',
      '    <form class="form-horizontal" role="form" >',
      '      <div class="row" ng-repeat="line in fullModel.model.config.lines">',
      '        <div class="config-form-row">',
      '          <div class="col-md-3">',
      '            <input type="text" class="form-control glowing-border" ng-model="line.label" ng-class="fullModel.model.config.exhibitOnly ? \'exhibit\' : \'line{{ line.colorIndex % 5 }}\'" />',
      '          </div>',
      '          <div class="col-md-4">',
      '            <div class="col-md-9 input-group">',
      '              <span class="input-group-addon">y = </span><input type="text" class="form-control" placeholder="mx+b" ng-model="line.function" ng-disabled="fullModel.model.config.exhibitOnly" />',
      '            </div>',
      '          </div>',
      '          <div class="col-md-4">',
      '            <div class="col-md-9 input-group">',
      '              <span class="input-group-addon">y = </span><input type="text" class="form-control" placeholder="mx+b" ng-model="line.intialLine" />',
      '            </div>',
      '          </div>',
      '          <div class="col-sm-1">',
      '            <a class="btn btn-default" ng-click="removeLine(line.id)"><span class="delete-line fa fa-trash-o"></span></a>',
      '          </div>',
      '        </div>',
      '      </div>',
      '      <div class="row">',
      '        <div class="config-form-row">',
      '          <div class="col-md-4">',
      '            <a class="add-line btn btn-default" ng-click="addNewLine()">+ Add a line</a>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </form>',
      '  </div>',
      '</div>'].join('\n');

    var graphAttributesBlock = [
      '<div class="row">',
      '  <div class="body col-md-8">',
      '    <h3>Graph Attributes</h3>',
      '    <p>Use this section to setup the graph area.</p>',
      '    <form class="form-horizontal" role="form" name="attirbutesForm">',
      '       <div class="config-form-row">',
      '         <h4>Domain (X)</h4>',
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput({ label: 'Minimum Value', modelKey: 'domainMin', inputType: "number", placeholder: '{{defaults.domainMin}}' }),
      labelWithInput({ label: 'Maximum Value', modelKey: 'domainMax', inputType: "number", placeholder: '{{defaults.domainMax}}' }),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput({ label: 'Tick Value:', modelKey: 'domainStepValue', inputType: "number", placeholder: '{{defaults.domainStepValue}}' }),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput({ label: 'Label', modelKey: 'domainLabel', placeholder: '{{defaults.domainLabel}}' }),
      labelWithInput({ label: 'Label Frequency:', modelKey: 'domainLabelFrequency', inputType: "number", placeholder: '{{defaults.domainLabelFrequency}}' }),
      '       </div><br />',
      '       <div class="config-form-row">',
      '         <h4>Range (Y)</h4>',
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput({ label: 'Minimum Value', modelKey: 'rangeMin', inputType: "number", placeholder: '{{defaults.rangeMin}}' }),
      labelWithInput({ label: 'Maximum Value', modelKey: 'rangeMax', inputType: "number", placeholder: '{{defaults.rangeMax}}' }),
      '       </div>',
      '       <div class="config-form-row">',
      labelWithInput({ label: 'Tick Value:', modelKey: 'rangeStepValue', inputType: "number", placeholder: '{{defaults.rangeStepValue}}' }),
      '       </div>',
      '        <div class="config-form-row">',
      labelWithInput({ label: 'Label', modelKey: 'rangeLabel', placeholder: "y" }),
      labelWithInput({ label: 'Label Frequency:', modelKey: 'rangeLabelFrequency', inputType: "number", placeholder: '{{defaults.rangeLabelFrequency}}' }),
      '        </div><br />',
      '       <div class="config-form-row">',
      labelWithInput({ label: 'Significant Figures:', modelKey: 'sigfigs', inputType: "number",
        placeholder: '{{defaults.sigfigs}}' }),
      '       </div>',
      '     </form>',
      '  </div>',
      '</div>'
    ].join('\n');

    var displayBlock = [
      '  <div class="row">',
      '    <div class="body col-md-9">',
      '      <form class="form-horizontal" role="form" name="display">',
      '        <h3>Display</h3>',
      '        <div class="config-form-row">',
      '          <div class="col-sm-8">',
      '          </div>',
      '        </div><br/>',
      '        <div class="config-form-row">',
      labelWithInput({ label: 'Width', modelKey: 'graphWidth', inputType: "number", inputClass: 'input-number', placeholder: '{{defaults.graphWidth}}', labelSize: 1, size: 2 }),
      labelWithInput({ label: 'Height', modelKey: 'graphHeight', inputType: "number", inputClass: 'input-number', placeholder: '{{defaults.graphHeight}}', labelSize: 1, size: 2 }),
      '        </div>',
      '        <div class="config-form-row"><br />',
      '          <label class="col-sm-4 input-number-label">Add padding to graph</label>',
      '          <div class="col-sm-2" ',
      '            ng-class="{ \'has-error\': display.graphPadding.$error.min || display.graphPadding.$error.number }">',
      '            <input type="number" name="graphPadding" ',
      '              class="form-control" ',
      '              ng-model="fullModel.model.config.graphPadding" ',
      '              placeholder="{{defaults.graphPadding}}" ',
      '              min="0" step="25" />',
      '            <div class="inline-error-messages">',
      '              <div class="inline-error-message" ng-show="display.graphPadding.$error.number">Please enter a valid number</div>',
      '              <div class="inline-error-message" ng-show="display.graphPadding.$error.min">Please enter a positive number</div>',
      '            </div>',
      '          </div>',
      '          <span class="row col-sm-1 input-number-label">%</span>',
      '        </div>',
      '        <div class="config-form-row">',
      '          <div class="col-sm-6">',
      '            <checkbox ng-model="fullModel.model.config.showCoordinates">Show Point Coordinates</checkbox>',
      '            <checkbox ng-model="fullModel.model.config.showInputs">Show Point Inputs on the Graph</checkbox>',
      '          </div>',
      '        </div><br />',
      '      </form>',
      '    </div>',
      '  </div>'].join('\n');

    var feedback = [
      '<div class="input-holder">',
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
        scope.defaults = ComponentDefaultData.getDefaultData('corespring-multiple-line', 'model.config');
        scope.defaultCorrectFeedback = "Correct!";
        scope.defaultIncorrectFeedback = "Good try but that is not the correct answer.";
        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            model.model = model.model || {};
            model.model.config = model.model.config || {};

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
          var defaults = scope.defaults;

          function reset(property, value) {
            scope.fullModel.model.config[property] = value;
          }

          // lines
          reset('lines', defaults.lines);
          reset('exhibitOnly', defaults.exhibitOnly);

          // graph attributes
          reset('domainMin', defaults.domainMin);
          reset('domainMax', defaults.domainMax);
          reset('domainLabel', defaults.domainLabel);
          reset('domainStepValue', defaults.domainStepValue);
          reset('domainLabelFrequency', defaults.domainLabelFrequency);

          reset('rangeMin', defaults.rangeMin);
          reset('rangeMax', defaults.rangeMax);
          reset('rangeLabel', defaults.rangeLabel);
          reset('rangeStepValue', defaults.rangeStepValue);
          reset('rangeLabelFrequency', defaults.rangeLabelFrequency);

          // significant figures
          reset('sigfigs', defaults.sigfigs);

          // display
          reset('graphWidth', defaults.graphWidth);
          reset('graphHeight', defaults.graphHeight);
          reset('graphPadding', defaults.graphPadding);

          reset('showCoordinates', defaults.showCoordinates);
          reset('showInputs', defaults.showInputs);
          reset('showFeedback', defaults.showFeedback);

        };

        scope.addNewLine = function() {
          var newLineNumber = scope.fullModel.model.config.lines.length + 1;
          scope.fullModel.model.config.lines.push({ "id": newLineNumber, "function": "", "intialLine": "", "label": "", "colorIndex": scope.fullModel.model.config.lines.length % 5 });
        };

        scope.removeLine = function(lineId) {

          function doesntMatchId(line) {
            return line.id !== lineId;
          }

          scope.fullModel.model.config.lines = scope.fullModel.model.config.lines.filter(doesntMatchId);
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      },
      template: [
        '<div class="multiple-line-interaction-configuration col-md-12">',
        '  <p>',
        '    This interaction asks a student to draw a line that meets specific criteria.',
        '    The student will draw the line by clicking on two points on the graph.',
        '  </p>',
           linesBlock,
        '  <hr />',
           graphAttributesBlock,
        '  <hr />',
           displayBlock,
        '  <div class="row">',
        '    <div class="col-md-8">',
        '      <a class="reset-defaults btn btn-default" ng-click="resetDefaults()">Reset to default values</a>',
        '    </div>',
        '  </div>',
        '  <div class="row"><div class="col-md-8" ng-hide="fullModel.model.config.exhibitOnly">',
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
