var main = [
  function() {
    this.inline = function(type, value, body, attrs) {
      return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
        '</label>'].join('\n');
    };

    var design = [
      '<div class="form-group">',
      '        <h3>Feedback</h3>',
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
      '       are not automatically scored. Students will have formatting options available (bold, italic, etc) when ',
      '       entering their response. An optional keypad may be included to allow students to enter math notation.',
      '     </p>',
      '     <div>',
      '       <h3>Display</h3>',
      '     </div>',
      '     <div>Adjust the width and height of student response area below.</div>',
      '     <form name="sizeForm" class="form-horizontal" role="form" style="margin-top: 10px">',
      '       <div class="form-group" ng-class="{\'has-error\': !sizeForm.expectedLength.$valid}" style="max-width: 80%">',
      '         <label class="col-sm-4 control-label narrow-form-label">Box width:</label>',
      '         <div class="col-sm-3">',
      '           <input type="number" ',
      '             name="expectedLength"',
      '             min="40" max="100" ',
      '             id="expected-length" ',
      '             class="form-control"  ',
      '             ng-model="fullModel.model.config.expectedLength" />',
      '         </div>',
      '         <label class="control-label">columns</label>',
      '       </div>',
      '       <div class="form-group" ng-class="{\'has-error\': !sizeForm.expectedLines.$valid}" style="max-width: 80%">',
      '         <label class="col-sm-4 control-label narrow-form-label">Box height:</label>',
      '         <div class="col-sm-3">',
      '           <input name="expectedLines" ',
      '             type="number" min="5" max="20" ',
      '             id="expected-lines" ',
      '             class="form-control"  ',
      '             ng-model="fullModel.model.config.expectedLines" />',
      '         </div>',
      '         <label class="control-label">rows</label>',
      '       </div>',
      '     </form>',
      '     <checkbox ng-model="fullModel.model.config.showMathInput">Student responses can include math notation</checkbox>',
      '</div>'].join('\n');

    return {
      scope: {},
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
