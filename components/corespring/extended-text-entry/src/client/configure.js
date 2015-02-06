var main = [
  function() {
    this.inline = function(type, value, body, attrs) {
      return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
        '</label>'].join('\n');
    };

    var design = [
      '<div class="form-group">',
      '        <div class="feedback-label">Feedback</div>',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="When answer submitted, show"',
      '               fb-sel-feedback-type="fullModel.feedback.feedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.feedback"',
      '               fb-sel-default-feedback="{{defaultIsAnswerFeedback}}"',
      '          ></div>',
      '    </div>',
      '    <h3>Scoring</h3>Open Ended questions are not automatically scored by the system. Please include a scoring guide or rubric in the Supporting Materials area.',
      '</div>'].join('\n');

    var displayOptions = [
      '<div class="form-group">',
      '     <p class="info">',
      '       In an Open Ended interaction, students respond to a prompt in short or long form. These interactions ',
      '       are not automatically scored.',
      '     </p>',
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
        scope.leftPanelClosed = false;
      },
      template: [

        '<div class="extended-text-entry-configuration">',
        '  <div class="row">',
        '   <div class="col-md-12">',
             displayOptions,
             design,
        '   </div>',
        ' </div>',
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
