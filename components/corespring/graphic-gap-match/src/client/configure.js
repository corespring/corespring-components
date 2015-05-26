var main = [
  '$log', 'ChoiceTemplates','ComponentDefaultData',
  function($log, ChoiceTemplates, ComponentDefaultData) {

    var display = [
      '<div>',
      '</div>'
    ].join('');

    var feedback = [
      '<div ng-hide="fullModel.model.config.exhibitOnly">',
      '<div feedback-panel>',
      '  <div feedback-selector',
      '      fb-sel-label="If correct, show"',
      '      fb-sel-class="correct"',
      '      fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '      fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If partially correct, show"',
      '      fb-sel-class="partial"',
      '      fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '      fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If incorrect, show"',
      '      fb-sel-class="incorrect"',
      '      fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '      fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
      '  </div>',
      '</div>',
      '</div>'

    ].join('');

    return {
      scope: false,
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.defaults = ComponentDefaultData.getDefaultData('corespring-graphic-gap-match', 'model.config');
        ChoiceTemplates.extendScope(scope, 'corespring-graphic-gap-match');
        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
          },

          getModel: function() {
            return scope.fullModel;
          }
        };


        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      },
      template: [
        '<div class="config-graphic-gap-match">',
        '  <div navigator-panel="Design">',
        '  <p>',
        '    In this interaction, students plot points, line segments or rays on a number line.',
        '  </p>',
        display,
        feedback,
        '  </div>',
        '  <div navigator-panel="Scoring">',
        ChoiceTemplates.scoring(),
        '  </div>',

        '</div>',
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
