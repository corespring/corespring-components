// module: corespring.choice-templates
// service: ChoiceTemplates 

exports.framework = "angular";
exports.service = ['$log',
  function($log) {

    var ChoiceTemplates = function() {

      var placeholderText = {
        selectedFeedback: 'Enter feedback to display if this choice is selected.',
        notSelectedFeedback: 'Enter feedback to display if this choice is not selected.'
      };

      this.prompt = '<textarea ck-editor ng-model="model.prompt"></textarea><br/>';


      this.inline = function(type, value, body, attrs) {
        return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
          '</label>'].join('\n');
      };

      this.choice = function(opts) {
        var defaults = {
          correct: '<i class="fa fa-check fa-lg choice-checkbox" ng-class="{checked: correctMap[q.value]}" ng-click="correctMap[q.value] = !correctMap[q.value]"></i>'
        };

        opts = _.extend(defaults, opts);

        return [
          '  <table class="choice-template-choice">',
          '    <tr>',
          '     <td><b>Choice {{toChar($index)}}</b></td>',
          '      <td>',
          '      </td>',
          '      <td>',
          '        <select class="form-control" ng-model="q.labelType">',
          '          <option value="text">Text</option>',
          '          <option value="image">Image</option>',
          '        </select>',
          '      </td>',
          '      <td style="position: relative">',
          '        <span class="choice-remove-button" ng-click="removeQuestion(q)">',
          '          <i class="fa fa-times-circle"></i>',
          '        </span>',

          '        <div ng-switch="q.labelType">',
          '          <input class="form-control" type="text" ng-switch-when="text" ng-model="q.label" placeholder="Enter distractor choice"></input>',
          '          <span ng-switch-when="image">',
          '            <input class="form-control" type="text" ng-model="q.imageName" placeholder="Click here to upload a .png or .gif file" file-uploader fu-url="getUploadUrl()" fu-upload-completed="imageUploadedToChoice(q)" fu-mode="raw" fu-max-size="1000" placeholder="Click to upload..."></input>',
          '          </span>',
          '          <textarea ng-switch-when="mathml" ng-model="q.mathml" ng-change="updateMathJax()"></textarea>',
          '        </div>',
          '      </td>',
          '      <td>',
          '      </td>',
          '      <td>',
          opts.correct,
          '      </td>',
          '    </tr>',
          '    <tr>',
          '      <td colspan="4" style="text-align: left">',
          '        <div ng-click="feedbackOn = !feedbackOn" class="feedback-label"><i class="fa fa-{{feedbackOn ? \'minus\' : \'plus\'}}-square-o"></i> Feedback</div>',
          '        <div class="well" ng-show="feedbackOn">',
          '          <div><label>If selected</label></div>',
          '          <input class="form-control" type="text" ng-disabled="feedback[q.value].feedbackType != \'custom\'" ng-model="feedback[q.value].feedback" placeholder="' + placeholderText.selectedFeedback + '"></input>',

          '          <div class="pull-right">',
          this.inline("radio", "none", "None", "ng-model='feedback[q.value].feedbackType'"),
          this.inline("radio", "default", "Default", "ng-model='feedback[q.value].feedbackType'"),
          this.inline("radio", "custom", "Custom", "ng-model='feedback[q.value].feedbackType'"),
          '          </div>',
          '          <div class="clearfix"></div>',
          '          <div ng-show="correctMap[q.value]" style="margin-top: 15px">',
          '            <div><label>If not selected</label></div>',
          '            <input class="form-control" type="text" ng-disabled="feedback[q.value].notChosenFeedbackType != \'custom\'" ng-model="feedback[q.value].notChosenFeedback" placeholder="' + placeholderText.notSelectedFeedback + '"></input>',
          '            <div class="pull-right">',
                         this.inline("radio", "none", "None", "ng-model='feedback[q.value].notChosenFeedbackType'"),
                         this.inline("radio", "default", "Default", "ng-model='feedback[q.value].notChosenFeedbackType'"),
                         this.inline("radio", "custom", "Custom", "ng-model='feedback[q.value].notChosenFeedbackType'"),
          '            </div>',
          '            <div class="clearfix"></div>',
          '          </div>',
          '        </div>',
          '      </td>',
          '    </tr>',
          '  </table>'
        ].join('\n');

      };

      this.wrap = function(title, body) {
        return ['<div class="input-holder">',
          title ? '  <div class="header">' + title + '</div>' : '',
          '  <div class="body">' + body + '</div>',
          '</div>'].join('\n');
      };


      this.scoring = function() {

        return [
          '<div>',
          '   <input id="partialScoring" type="checkbox" ng-model="fullModel.allowPartialScoring"></input> <label for="partialScoring">Allow partial scoring</label>',
          '</div>',

          '<form class="form-inline choice-template-scoring-section">',
          '<div class="well" ng-show="fullModel.allowPartialScoring">',
          '  <div class="score-row" ng-repeat="scenario in fullModel.partialScoring">',
          '    <div class="remove-button" ng-click="removeScoringScenario(scenario)"><button type="button" class="close">&times;</button></div>',
          '    <label>If</label> <div class="form-group"><input type="number" min="1" max="{{model.choices.length - 1}}" style="width: 70px" class="form-control {{validClass(scenario)}}" ng-model="scenario.numberOfCorrect"/></div> of correct answers selected, award',
          '    <span class="form-group"><input type="number" min="1" max="99" style="width: 70px" class="form-control" ng-model="scenario.scorePercentage"/>% of full credit</span>',
          '  </div>',
          '  <div ng-click="addScoringScenario()" ng-show="fullModel.partialScoring.length < model.choices.length - 1">',
          '   <i class="fa fa-plus-square-o"></i> Add another scenario',
          '  </div>',
          '</div>',
          '</form>',

          '<div>{{model.partialScoring}}</div>'

        ].join('\n');
      };

    };

    return new ChoiceTemplates();
  }];
