var main = [
  function() {
    this.inline = function(type, value, body, attrs) {
      return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
        '</label>'].join('\n');
    };

    var design = [
      '<div class="input-holder">',
      '  <div class="body">',

      '        <div class="feedback-label">Feedback</div>',
      '        <div class="well">',

      '          <div feedback-selector',
      '               fb-sel-label="When answer submitted, show"',
      '               fb-sel-feedback-type="fullModel.feedback.feedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.feedback"',
      '               fb-sel-default-feedback="{{defaultIsAnswerFeedback}}"',
      '          ></div>',
      '    </div>',
      '  </div>',
      '</div>'].join('\n');

    var scoring = [
      '<div class="input-holder">',
      '  <div class="body">',
      '    Open Ended questions are not automatically scored by the system. Please include a scoring guide or rubric in the Supporting Materials area.',
      '  </div>',
      '</div>'].join('\n');

    var displayOptions = [
      '<div class="input-holder">',
      '  <div class="body">',
      '     <div>Adjust the height and width of student response area below.</div>',
      '     <form class="form-horizontal" role="form" style="margin-top: 10px">',
      '       <div class="form-group" style="max-width: 80%">',
      '         <label class="col-sm-4 control-label narrow-form-label">Box width:</label>',
      '         <div class="col-sm-3">',
      '           <input type="text" id="expected-length" class="form-control"  ng-model="fullModel.model.config.expectedLength" />',
      '         </div>',
      '         <label class="control-label">columns</label>',
      '       </div>',
      '       <div class="form-group" style="max-width: 80%">',
      '         <label class="col-sm-4 control-label narrow-form-label">Box height:</label>',
      '         <div class="col-sm-3">',
      '           <input type="text" id="expected-length" class="form-control"  ng-model="fullModel.model.config.expectedLines" />',
      '         </div>',
      '         <label class="control-label">rows</label>',
      '       </div>',
      '     </form>',
      '  </div>',
      '</div>'].join('\n');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.defaultIsAnswerFeedback = "Your answer has been submitted";
        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            model.model = model.model || {};
            model.model.config = model.model.config || {};
          },

          getModel: function() {
            return scope.fullModel;
          }
        };

        scope.$emit('registerConfigPanel',attrs.id, scope.containerBridge);
      },
      template: [

        '<div class="extended-text-entry-configuration">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
               displayOptions,
               design,
        '    </div>',
        '    <div navigator-panel="Scoring">',
               scoring,
        '    </div>',
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
