var main = [
  'ComponentDefaultData',
  'ServerLogic',
  'ChoiceTemplates',
  'CanvasTemplates',
  function(ComponentDefaultData, ServerLogic, ChoiceTemplates, CanvasTemplates) {

    var linesBlock = [
      '<div class="row">',
      '  <div class="body equations col-md-12">',
      '    <h3>Lines</h3>',
      '    <div class="row">',
      '      <div class="col-md-12 intro-text">',
      '        Line equations must be in y=mx+b form. Only whole number coordinates can be plotted.',
      '      </div>',
      '    </div>',
      '    <div class="row equation-labels">',
      '      <div class="col-md-3"><strong>Line Label</strong></div>',
      '      <div class="col-md-4" ng-hide="fullModel.model.config.exhibitOnly"><strong>Correct Line</strong></div>',
      '      <div class="col-md-4" ng-hide="fullModel.model.config.exhibitOnly"><strong>Initial View</strong></div>',
      '      <div class="col-md-1"></div>',
      '    </div>',
      '    <form class="form-horizontal" role="form">',
      '      <div class="row" ng-repeat="line in fullModel.model.config.lines">',
      '        <div class="config-form-row">',
      '          <div class="col-md-3">',
      '            <input type="text" class="form-control glowing-border" ng-model="line.label" ng-class="fullModel.model.config.exhibitOnly ? \'exhibit\' : \'line{{ line.colorIndex % 5 }}\'" />',
      '          </div>',
      '          <div class="col-md-4" ng-hide="fullModel.model.config.exhibitOnly">',
      '            <div class="input-group" ng-class="{ \'has-error\': !isValidFormula(line.equation) }">',
      '              <span class="input-group-addon">y = </span><input type="text" class="form-control" placeholder="mx+b" cs-tooltip-title="Please use the linear (y=mx+b) form" cs-tooltip-is-open="!isValidFormula(line.equation)" ng-model="line.equation" />',
      '            </div>',
      '          </div>',
      '          <div class="col-md-4">',
      '            <div class="input-group">',
      '              <span class="input-group-addon">y = </span><input type="text" class="form-control" placeholder="mx+b" cs-tooltip-title="Please use the linear (y=mx+b) form" cs-tooltip-is-open="!isValidFormula(line.intialLine)" ng-model="line.intialLine" />',
      '            </div>',
      '          </div>',
      '          <div class="col-sm-1 remove-line">',
      '             <span ng-click="removeLine(line.id)" class="delete-line fa fa-trash-o"></span>',
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
      '    <div class="row">',
      '      <div class="col-md-8">',
      '        <checkbox ng-model="fullModel.model.config.exhibitOnly"',
      '            tooltip="An exhibit graph is view only and can not be manipulated by the student."',
      '            tooltip-append-to-body="true"',
      '            tooltip-placement="bottom">',
      '          Make this graph an exhibit only',
      '        </checkbox>',
      '      </div>',
      '    </div>',
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
            scope.checkUndefinedProperties(model.model.config);
            scope.updateNumberOfCorrectResponses(scope.fullModel.correctResponse.length);
          },

          getModel: function() {
            var model = _.cloneDeep(scope.fullModel);
            return model;
          }
        };

        scope.isValidFormula = function(s) {
          return /^(y=)?([+-]?\d+(\.\d+)?x([+-]\d+(\.\d+)?)?|\d+(\.\d+)?)$/i.test(s);
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
            scope.fullModel.correctResponse = _.map(scope.fullModel.model.config.lines, function(line) {
              return {id: line.id, equation: line.equation, label: line.label};
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
        '      This interaction asks students to draw lines that meet specific criteria. The student will draw each',
        '      line by clicking two points on the graph. Each line will be denoted by a different color and symbol,',
        '      as well as by optional labels.',
        '    </p>',
        linesBlock,
        '    <hr />',
        CanvasTemplates.configGraph(),
        '    <hr />',
        CanvasTemplates.configDisplay(false),
        '    <div class="row">',
        '      <div class="col-md-8">',
        '        <a class="reset-defaults btn btn-default" ng-click="resetDefaults()">Reset to default values</a>',
        '      </div>',
        '    </div>',
        '    <div class="row"><div class="col-xs-12" ng-hide="fullModel.model.config.exhibitOnly">',
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
