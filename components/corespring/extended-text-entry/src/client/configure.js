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
      this.inline("radio", "default", "Default Feedback", "ng-model='fullModel.feedback.isAnswer.feedbackType'"),
      this.inline("radio", "none", "No Feedback", "ng-model='fullModel.feedback.isAnswer.feedbackType'"),
      this.inline("radio", "custom", "Customized Feedback", "ng-model='fullModel.feedback.isAnswer.feedbackType'"),
      '          </div>',
      '          <div class="clearfix"></div>',

      '          <span ng-switch="fullModel.feedback.isAnswer.feedbackType">',
      '            <input ng-switch-when="custom" class="form-control feedback-preview custom" ng-class="{correct: true}" type="text" ng-model="fullModel.feedback.isAnswer.feedback" placeholder="Enter customized feedback to be presented to the student" />',
      '            <input ng-switch-when="default" class="form-control feedback-preview" ng-class="{correct: true}" disabled="true" type="text" value="{{defaultIsAnswerFeedback}}" />',
      '            <input ng-switch-when="none" class="form-control feedback-preview nofeedback" disabled="true" type="text" placeholder="No feedback will be presented to the student" />',
      '          </span>',

      '          <div style="margin-top: 20px"><label>If no answer is submitted, show </label></div>',
      '          <div>',
      this.inline("radio", "default", "Default Feedback", "ng-model='fullModel.feedback.noAnswer.feedbackType'"),
      this.inline("radio", "none", "No Feedback", "ng-model='fullModel.feedback.noAnswer.feedbackType'"),
      this.inline("radio", "custom", "Customized Feedback", "ng-model='fullModel.feedback.noAnswer.feedbackType'"),
      '          </div>',
      '          <div class="clearfix"></div>',

      '          <span ng-switch="fullModel.feedback.noAnswer.feedbackType">',
      '            <input ng-switch-when="custom" class="form-control feedback-preview custom" ng-class="{correct: true}" type="text" ng-model="fullModel.feedback.noAnswer.feedback" placeholder="Enter customized feedback to be presented to the student" />',
      '            <input ng-switch-when="default" class="form-control feedback-preview" ng-class="{correct: true}" disabled="true" type="text" value="{{defaultNoAnswerFeedback}}" />',
      '            <input ng-switch-when="none" class="form-control feedback-preview nofeedback" disabled="true" type="text" placeholder="No feedback will be presented to the student" />',
      '          </span>',

      '  </div>',
      '  </div>',
      '</div>'].join('\n');

    var scoring = [
      '<div class="input-holder">',
      '  <div class="body">',
      '    Please include a scoring guide in the Supporting Materials area',
      '  </div>',
      '</div>'].join('\n');

    var displayOptions = [
      '<div class="input-holder">',
      '  <div class="body">',
      '     <form class="form-horizontal" role="form">',
      '       <div class="form-group">',
      '         <label for="ignore-case" class="col-sm-2 control-label">Expected Length</label>',
      '         <div class="col-sm-10">',
      '           <input type="text" id="expected-length" class="form-control"  ng-model="fullModel.model.config.expectedLength" />',
      '         </div>',
      '       </div>',
      '       <div class="form-group">',
      '         <label for="ignore-whitespace" class="col-sm-2 control-label">Expected Lines</label>',
      '         <div class="col-sm-10">',
      '           <input type="text" id="expected-lines" class="form-control"  ng-model="fullModel.model.config.expectedLines" />',
      '         </div>',
      '       </div>',
      '     </form>',
      '  </div>',
      '</div>'].join('\n');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.defaultIsAnswerFeedback = "Def Is Answer";
        scope.defaultNoAnswerFeedback = "Def No Answer";
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
               design,
        '    </div>',
        '    <div navigator-panel="Scoring">',
               scoring,
        '    </div>',
        '    <div navigator-panel="Display">',
               displayOptions,
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
