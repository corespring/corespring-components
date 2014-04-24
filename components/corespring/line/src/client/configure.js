var main = [
  function() {

    this.inline = function(type, value, body, attrs) {
      return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
        '</label>'].join('\n');
    };

    var labelWithInput = function(size, label, modelKey, labelSize, inputType) {
      labelSize = labelSize || size;
      inputType = inputType || "text";
      return [
          '<label class="col-sm-' + labelSize + '">' + label + '</label>',
          '<div class="col-sm-' + size + '">',
          '  <input type="' + inputType + '" class="form-control"  ng-model="fullModel.model.config.' + modelKey + '" />',
          '</div>'
      ].join('');
    };

    var graphAttributes = [
      '<div class="input-holder">',
      '  <div class="header">Graph Attributes</div>',
      '  <div class="body">',
      '     <div class="informative-label">Use this section to setup the graph area.</div>',
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
      labelWithInput(3, 'Significant Figures', 'sigfigs', 3, "number"),
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-6">',
      '           <input id="showCoords" type="checkbox" ng-model="fullModel.model.config.showCoordinates" />',
      '           <label for="showCoords" class="control-label">Show Coordinates</label>',
      '         </div>',
      '         <div class="col-sm-6">',
      '           <input id="showInputs" type="checkbox" ng-model="fullModel.model.config.showInputs" />',
      '           <label for="showInputs" class="control-label">Show Point Inputs on the Graph</label>',
      '         </div>',
      '       </div>',
      '     </form>',
      '  </div>',
      '</div>'
    ].join('\n');

    var linesBlock = [
      '<div class="input-holder">',
      '  <div class="header">Lines</div>',
      '  <div class="body">',
      '     <form class="form-horizontal" role="form">',
      '       <div class="config-form-row">',
      '         <div class="col-sm-8">',
      '           <input id="exhibitOnly" type="checkbox" value="absent" ng-model="fullModel.model.config.exhibitOnly" />',
      '           <label for="exhibitOnly" class="control-label">Make this graph an exhibit only</label>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row" ng-hide="fullModel.model.config.exhibitOnly">',
      '         <div class="col-sm-2">',
      '           <label class="control-label">Correct Answer</label>',
      '         </div>',
      '         <div class="col-sm-8">',
      '           <input type="text" class="form-control" placeholder="Enter correct answer in y=mx+b form." ng-model="fullModel.correctResponse" />',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-2">',
      '           <label class="control-label">Initial State</label>',
      '         </div>',
      '         <div class="col-sm-8">',
      '           <input type="text" class="form-control" placeholder="Enter initial line equation in y=mx+b form." ng-model="fullModel.model.config.initialCurve" />',
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
        scope.defaultCorrectFeedback = "Correct!";
        scope.defaultIncorrectFeedback = "Good try but that is not the correct answer.";
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


      },
      template: [
        '<div class="point-intercept-configuration">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        '      <div class="intro-text">This question type asks a student to draw a line by clicking on two points on the graph.</div>',
        linesBlock,
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
