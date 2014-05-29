// module: corespring.choice-templates
// service: ChoiceTemplates 

exports.framework = "angular";
exports.service = ['$log',
  function($log) {

    var ChoiceTemplates = function() {

      var placeholderText = {
        selectedFeedback: 'Enter feedback to display if this choice is selected.',
        notSelectedFeedback: 'Enter feedback to display if this choice is not selected.',
        noFeedback: 'No feedback will be presented to the student.'
      };

      this.prompt = '<textarea ck-editor ng-model="model.prompt"></textarea><br/>';


      this.inline = function(type, value, body, attrs) {
        return ['<label class="' + type + '-inline">',
            '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
          '</label>'].join('\n');
      };

      this.choice = function(opts) {
        var defaults = {
          choice: "<b>Choice {{toChar($index)}}</b>",
          correct: '<i class="fa fa-check fa-lg choice-checkbox" ng-class="{checked: correctMap[q.value]}" ng-click="correctMap[q.value] = !correctMap[q.value]" tooltip="{{isSingleChoice() ? \'\' : \'See the scoring tab for more options\'}}"></i>',
          correctnessPredicate: "correctMap[q.value]",
          feedback: true,
          columnWidths: [],
          selectType: true,
          showLabel: true
        };

        opts = _.extend(defaults, opts);

        var feedback = opts.feedback ? [
          '      <td colspan="6" style="text-align: left">',
          '        <div ng-click="feedbackOn = !feedbackOn" class="feedback-label"><i class="fa fa-{{feedbackOn ? \'minus\' : \'plus\'}}-square-o"></i> Feedback</div>',
          '        <div class="well" ng-show="feedbackOn">',
          '          <div><label>If this choice is selected, show</label></div>',
          '          <div>',
          this.inline("radio", "default", "Default Feedback", "ng-model='feedback[q.value].feedbackType'"),
          this.inline("radio", "none", "No Feedback", "ng-model='feedback[q.value].feedbackType'"),
          this.inline("radio", "custom", "Customized Feedback", "ng-model='feedback[q.value].feedbackType'"),
          '          </div>',
          '          <div class="clearfix"></div>',
          '          <span ng-switch="feedback[q.value].feedbackType">',
            '            <input ng-switch-when="custom" class="form-control feedback-preview custom" ng-class="{correct: ' + opts.correctnessPredicate + '}" type="text" ng-model="feedback[q.value].feedback" placeholder="' + placeholderText.selectedFeedback + '"></input>',
            '            <input ng-switch-when="default" class="form-control feedback-preview" ng-class="{correct: ' + opts.correctnessPredicate + '}" disabled="true" type="text" value="{{' + opts.correctnessPredicate + ' ? defaultCorrectFeedback : defaultIncorrectFeedback}}"></input>',
            '            <input ng-switch-when="none" class="form-control feedback-preview nofeedback" disabled="true" type="text" placeholder="' + placeholderText.noFeedback + '"></input>',
          '          </span>',

          '          <div ng-show="correctMap[q.value]" style="margin-top: 15px">',
          '            <div><label>If this choice is NOT selected, show</label></div>',
          '            <div>',
          this.inline("radio", "default", "Default Feedback", "ng-model='feedback[q.value].notChosenFeedbackType'"),
          this.inline("radio", "none", "No Feedback", "ng-model='feedback[q.value].notChosenFeedbackType'"),
          this.inline("radio", "custom", "Customized Feedback", "ng-model='feedback[q.value].notChosenFeedbackType'"),
          '            </div>',
          '            <div class="clearfix"></div>',
          '          <span ng-switch="feedback[q.value].notChosenFeedbackType">',
            '            <input ng-switch-when="custom" class="form-control feedback-preview custom correct" type="text" ng-model="feedback[q.value].notChosenFeedback" placeholder="' + placeholderText.selectedFeedback + '"></input>',
          '            <input ng-switch-when="default" class="form-control feedback-preview  correct" disabled="true" type="text" value="{{defaultNotChosenFeedback}}"></input>',
            '            <input ng-switch-when="none" class="form-control feedback-preview nofeedback" disabled="true" type="text" placeholder="' + placeholderText.noFeedback + '"></input>',
          '          </span>',
          '          </div>',
          '        </div>',
          '      </td>'

        ].join('') : '';

        var optWidth = function(w) {
          if (!_.isEmpty(w)) {
            return 'style="min-width:' + w + '; width: ' + w + ';"';
          } else {
            return '';
          }
        };

        return _.flatten([
          [
            '  <table class="choice-template-choice">',
            '    <tr>',
            !_.isEmpty(opts.choice) && opts.showLabel ? ' <td ' + optWidth(opts.columnWidths[0]) + '>' + opts.choice + '</td>' : ''
          ],
          [
            '     <td '+optWidth(opts.columnWidths[1])+'>',
            '       <div class="choice-wrapper">',
            '         <span class="choice-remove-button" ng-click="removeQuestion(q)">',
            '           <i class="fa fa-times-circle"></i>',
            '         </span>',
            '       </div>',
            '       <div mini-wiggi-wiz="" ng-model="q.label" placeholder="Enter a choice" image-service="imageService"' +
            '         features="extraFeatures" parent-selector=".content-top"></div>',
            '       <label class="shuffle" ng-class="{shown: model.config.shuffle}">',
            '         <input type="checkbox" ',
            '           ng-init="remain = q.shuffle == undefined ? false : !q.shuffle" ng-model="remain"',
            '           ng-change="q.shuffle = !remain; resetStash()" /> Remain in place',
            '       </label>',
            '     </td>',
            '     <td class="correct" '+ optWidth(opts.columnWidths[2]) + '>',
            opts.correct,
            '      </td>',
            '    </tr>',
            '    <tr>',
            feedback,
            '    </tr>',
            '  </table>'
          ]
        ]).join('\n');

      };

      this.wrap = function(title, body) {
        return ['<div class="input-holder">',
          title ? '  <div class="header">' + title + '</div>' : '',
            '  <div class="body">' + body + '</div>',
          '</div>'].join('\n');
      };


      this.scoring = function(opts) {

        var o = _.extend({
          maxNumberOfPartialScores: "model.choices.length - 1"
        }, opts);

        return [
          '<div class="scoring-header-text">',
          '  If there is more than one correct answer to this question, you may allow partial credit based on the number of correct answers submitted. This is optional.',
          '</div>',

          '<div>',
          '   <input id="partialScoring" type="checkbox" ng-model="fullModel.allowPartialScoring" ng-disabled="isSingleChoice()"></input>',
          '   <label for="partialScoring" ng-class="{ disabled: isSingleChoice() }">Allow partial scoring</label>',
          '</div>',

          '<form class="form-inline choice-template-scoring-section">',
          '<div class="well scoring-well" ng-show="fullModel.allowPartialScoring">',
          '  <div class="score-row" ng-repeat="scenario in fullModel.partialScoring">',
          '    <div class="remove-button" ng-click="removeScoringScenario(scenario)"><button type="button" class="close">&times;</button></div>',
          '    <label>If</label> <div class="form-group"><input type="number" min="1" max="{{model.choices.length - 1}}" style="width: 60px" class="form-control {{validClass(scenario)}}" ng-model="scenario.numberOfCorrect"/></div> of correct answers selected, award',
          '    <span class="form-group"><input type="number" min="1" max="99" style="width: 60px" class="form-control" ng-model="scenario.scorePercentage"/>% of full credit</span>',
          '  </div>',
          '  <div ng-click="addScoringScenario()" ng-show="fullModel.partialScoring.length < ' + o.maxNumberOfPartialScores + '">',
          '    <i class="fa fa-plus-square-o"></i> Add another scenario',
          '  </div>',
          '</div>',
          '</form>',

          '<div>{{model.partialScoring}}</div>'

        ].join('\n');
      };

    };

    return new ChoiceTemplates();
  }];
