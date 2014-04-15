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
      '          <div><label>When answer submitted, show</label></div>',
      '          <div>',
      this.inline("radio", "default", "Default Feedback", "ng-model='fullModel.feedback.feedbackType'"),
      this.inline("radio", "none", "No Feedback", "ng-model='fullModel.feedback.feedbackType'"),
      this.inline("radio", "custom", "Customized Feedback", "ng-model='fullModel.feedback.feedbackType'"),
      '          </div>',
      '          <div class="clearfix"></div>',

      '          <span ng-switch="fullModel.feedback.feedbackType">',
      '            <input ng-switch-when="custom" class="form-control feedback-preview custom" ng-class="{correct: true}" type="text" ng-model="fullModel.feedback.feedback" placeholder="Enter customized feedback to be presented to the student" />',
      '            <input ng-switch-when="default" class="form-control feedback-preview" ng-class="{correct: true}" disabled="true" type="text" value="{{defaultIsAnswerFeedback}}" />',
      '            <input ng-switch-when="none" class="form-control feedback-preview nofeedback" disabled="true" type="text" placeholder="No feedback will be presented to the student" />',
      '          </span>',
      '  </div>',
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
      '     <div>Answer box:</div>',
      '     <form class="form-horizontal" role="form" style="margin-top: 10px">',
      '       <div class="form-group" style="max-width: 80%">',
      '         <label class="col-sm-4 control-label">Box width:</label>',
      '         <div class="col-sm-3">',
      '           <input type="text" id="expected-length" class="form-control"  ng-model="fullModel.model.config.expectedLength" />',
      '         </div>',
      '         <label class="control-label">columns</label>',
      '       </div>',
      '       <div class="form-group" style="max-width: 80%">',
      '         <label class="col-sm-4 control-label">Box height:</label>',
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
