var main = [
  'ComponentDefaultData',
  'ServerLogic',
  'ChoiceTemplates',
  'CanvasTemplates',
  function(ComponentDefaultData, ServerLogic, ChoiceTemplates, CanvasTemplates) {

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
      '      <div class="col-md-3"><strong>Line Label (Optional)</strong></div>',
      '      <div class="col-md-4" ng-hide="fullModel.model.config.exhibitOnly"><strong>Correct Line</strong></div>',
      '      <div class="col-md-4" ng-hide="fullModel.model.config.exhibitOnly"><strong>Initial View (Optional)</strong></div>',
      '      <div class="col-md-1"></div>',
      '    </div><br />',
      '    <form class="form-horizontal" role="form" >',
      '      <div class="row" ng-repeat="line in fullModel.model.config.lines">',
      '        <div class="config-form-row">',
      '          <div class="col-md-3">',
      '            <input type="text" class="form-control glowing-border" ng-model="line.label" ng-class="fullModel.model.config.exhibitOnly ? \'exhibit\' : \'line{{ line.colorIndex % 5 }}\'" />',
      '          </div>',
      '          <div class="col-md-4" ng-hide="fullModel.model.config.exhibitOnly">',
      '            <div class="col-md-9 input-group">',
      '              <span class="input-group-addon">y = </span><input type="text" class="form-control" placeholder="mx+b" ng-model="line.equation" />',
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
      '      <div feedback-selector',
      '           fb-sel-label="If partially correct, show"',
      '           fb-sel-class="partial"',
      '           fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '           fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '           fb-sel-default-feedback="{{defaultPartialFeedback}}"',
      '      ></div>',
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
        ChoiceTemplates.extendScope(scope, 'corespring-multiple-line');
        CanvasTemplates.extendScope(scope, 'corespring-multiple-line');

        var server = ServerLogic.load('corespring-multiple-line');
        scope.defaultCorrectFeedback = server.keys.DEFAULT_CORRECT_FEEDBACK;
        scope.defaultPartialFeedback = server.keys.DEFAULT_PARTIAL_FEEDBACK;
        scope.defaultIncorrectFeedback = server.keys.DEFAULT_INCORRECT_FEEDBACK;

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            model.model = model.model || {};
            model.model.config = model.model.config || {};
            model.model.config.showAxisLabels = model.model.config.showAxisLabels || true;

            scope.updateNumberOfCorrectResponses(scope.fullModel.correctResponse.length);
          },

          getModel: function() {
            var model = _.cloneDeep(scope.fullModel);
            return model;
          }
        };

        scope.addNewLine = function() {
          var newLineNumber = scope.fullModel.model.config.lines.length + 1;
          scope.fullModel.model.config.lines.push({ "id": newLineNumber, "equation": "", "intialLine": "", "label": "", "colorIndex": scope.fullModel.model.config.lines.length % 5 });
        };

        scope.removeLine = function(lineId) {

          function doesntMatchId(line) {
            return line.id !== lineId;
          }

          scope.fullModel.model.config.lines = scope.fullModel.model.config.lines.filter(doesntMatchId);
        };

        scope.resetDefaults = function() {
          scope.resetCanvasGraphAttributes();
          scope.resetCanvasDisplayAttributes();
        };

        scope.$watch('fullModel.model.config.lines', function(n) {
          if (n) {
            scope.fullModel.correctResponse = _.map(scope.fullModel.model.config.lines, function(line){
              return { id: line.id, equation: line.equation, label: line.label };
            });
            scope.updateNumberOfCorrectResponses(scope.fullModel.correctResponse.length);
          }
        }, true);

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      },
      template: [
        '<div class="multiple-line-interaction-configuration col-md-12">',
        '  <div navigator-panel="Design">',
        '    <p>',
        '      This interaction asks a student to draw a line that meets specific criteria.',
        '      The student will draw the line by clicking on two points on the graph.',
        '    </p>',
               linesBlock,
        '    <hr />',
               CanvasTemplates.configGraph(),
        '    <hr />',
               CanvasTemplates.configDisplay(),
        '    <div class="row">',
        '      <div class="col-md-8">',
        '        <a class="reset-defaults btn btn-default" ng-click="resetDefaults()">Reset to default values</a>',
        '      </div>',
        '    </div>',
        '    <div class="row"><div class="col-md-8" ng-hide="fullModel.model.config.exhibitOnly">',
               feedback,
        '    </div></div>',
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
exports.directives = [
  {
    directive: main
  }
];
