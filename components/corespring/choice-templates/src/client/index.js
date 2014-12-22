// module: corespring.choice-templates
// service: ChoiceTemplates 

exports.framework = "angular";
exports.service = ['$log',
  'ChoiceTemplateScopeExtension',
  'MiniWiggiScopeExtension',
  'ServerLogic',
  '$timeout',
  function($log, ChoiceTemplateScopeExtension, MiniWiggiScopeExtension, ServerLogic, $timeout) {


    function ChoiceTemplates() {

      var placeholderText = {
        selectedFeedback: 'Enter feedback to display if this choice is selected.',
        notSelectedFeedback: 'Enter feedback to display if this choice is not selected.',
        noFeedback: 'No feedback will be presented to the student.'
      };

      this.extendScope = function(scope, componentType) {
        new ChoiceTemplateScopeExtension().postLink(scope);
        new MiniWiggiScopeExtension().postLink(scope);

        var server = ServerLogic.load(componentType);
        scope.defaultCorrectFeedback = server.keys.DEFAULT_CORRECT_FEEDBACK;
        scope.defaultIncorrectFeedback = server.keys.DEFAULT_INCORRECT_FEEDBACK;
        scope.defaultPartialFeedback = server.keys.DEFAULT_PARTIAL_FEEDBACK;
        scope.defaultNotChosenFeedback = server.keys.DEFAULT_NOT_CHOSEN_FEEDBACK;
        scope.defaultSubmittedFeedback = server.keys.DEFAULT_SUBMITTED_FEEDBACK;
      };

      this.inline = function(type, value, body, attrs) {
        return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
          '</label>'
        ].join('\n');
      };

      this.choice = function(opts) {
        var defaults = {
          choice: "<b>Choice {{toChar($index)}}</b>",
          correct: '<i class="fa fa-check fa-lg choice-checkbox" ng-class="{checked: correctMap[q.value]}" ng-click="correctMap[q.value] = !correctMap[q.value]"></i>',
          correctnessPredicate: "correctMap[q.value]",
          feedback: true,
          columnWidths: [],
          selectType: true,
          showLabel: true,
          hideFeedbackOptions: []
        };

        opts = _.extend(defaults, opts);

        var notSelectedFeedback = [
          '    <div class="well" ng-show="correctMap[q.value]" style="margin-top: 15px">',
          '      <div feedback-selector ',
          '        fb-sel-label="If this choice is NOT selected, show"',
          '        fb-sel-class="correct"',
          '        fb-sel-hide-feedback-options="'+defaults.hideFeedbackOptions.join(",")+'"',
          '        fb-sel-feedback-type="feedback[q.value].feedbackType"',
          '        fb-sel-custom-feedback="feedback[q.value].notChosenFeedback"',
          '        fb-sel-default-feedback="{{defaultNotChosenFeedback}}">',
          '      </div>',
          '    </div>'
        ].join("");

        var feedback = opts.feedback ? [
          '<td colspan="6" style="text-align: left">',
          '  <div ng-click="feedbackOn = !feedbackOn" class="expander feedback-label"><i class="fa fa-{{feedbackOn ? \'minus\' : \'plus\'}}-circle"></i>Feedback</div>',
          '  <div ng-show="feedbackOn">',
          '    <div class="well">',
          '      <div feedback-selector ng-show="correctMap[q.value]"',
          '        fb-sel-label="If this choice is selected, show"',
          '        fb-sel-class="correct"',
          '        fb-sel-hide-feedback-options="'+defaults.hideFeedbackOptions.join(",")+'"',
          '        fb-sel-feedback-type="feedback[q.value].feedbackType"',
          '        fb-sel-custom-feedback="feedback[q.value].feedback"',
          '        fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
          '      </div>',
          '      <div feedback-selector ng-show="!correctMap[q.value]"',
          '        fb-sel-label="If this choice is selected, show"',
          '        fb-sel-class="incorrect"',
          '        fb-sel-hide-feedback-options="'+defaults.hideFeedbackOptions.join(",")+'"',
          '        fb-sel-feedback-type="feedback[q.value].feedbackType"',
          '        fb-sel-custom-feedback="feedback[q.value].feedback"',
          '        fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
          '      </div>',
          '    </div>',
          (opts.hideFeedbackOptions.indexOf("notSelected") === -1) ? notSelectedFeedback : "",
          '  </div>',
          '</td>'

        ].join('') : '';

        var optWidth = function(w) {
          if (!_.isEmpty(w)) {
            return 'style="min-width:' + w + '; width: ' + w + ';"';
          } else {
            return '';
          }
        };

        return [
          '<table class="choice-template-choice">',
          '  <tr>', !_.isEmpty(opts.choice) && opts.showLabel ? ' <td ' + optWidth(opts.columnWidths[0]) + '>' + opts.choice + '</td>' : '',
          '   <td ' + optWidth(opts.columnWidths[1]) + '>',
          '     <div class="choice-wrapper">',
          '       <span class="choice-remove-button" ng-click="removeQuestion(q)">',
          '         <i class="fa fa-times-circle"></i>',
          '       </span>',
          '     </div>',
          '     <div mini-wiggi-wiz="" ng-model="q.label" placeholder="Enter a choice"',
          '       image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
          '       parent-selector=".wiggi-wiz-overlay">',
          '       <edit-pane-toolbar alignment="bottom">',
          '         <div class="btn-group pull-right">',
          '           <button ng-click="closePane()" class="btn btn-sm btn-success" style="float:right;">Done</button>',
          '         </div>',
          '       </edit-pane-toolbar>',
          '     </div>',
          '     <label class="shuffle" ng-class="{shown: model.config.shuffle}">',
          '       <checkbox ',
          '         ng-init="remain = q.shuffle == undefined ? false : !q.shuffle" ng-model="remain"',
          '         ng-change="q.shuffle = !remain; resetStash()">Remain in place</checkbox>',
          '     </label>',
          '   </td>',
          '   <td class="correct" ' + optWidth(opts.columnWidths[2]) + '>',
          opts.correct,
          '    </td>',
          '  </tr>',
          '  <tr>',
          feedback,
          '  </tr>',
          '</table>'
        ].join('\n');

      };

      this.inputHolder = function(title, body) {
        return ['<div class="input-holder">',
          title ? '  <div class="header">' + title + '</div>' : '',
          '  <div class="body">' + body + '</div>',
          '</div>'
        ].join('\n');
      };

      this.scoring = function(opts) {
        return this.inputHolder(undefined, this.unwrappedScoring(opts));
      };

      this.unwrappedScoring = function(opts) {
        var o = _.extend({
          maxNumberOfPartialScores: "model.choices.length - 1"
        }, opts);

        return [
          '<div class="scoring-header-text">',
          '  If there is more than one correct answer to this question, you may allow partial credit based on the number of correct answers submitted. This is optional.',
          '</div>',
          '<div class="panel panel-default">',
          '  <div class="panel-heading">',
          '    <h4 class="panel-title">',
          '      <a ng-click="togglePartialScoring()" data-toggle="collapse" href="#partial-scoring">',
          '        <span class="icon">',
          '          <i class="fa fa-{{fullModel.allowPartialScoring ? \'plus\' : \'minus\'}}-circle"></i>',
          '        </span>',
          '        Allow Partial Scoring',
          '      </a>',
          '    </h4>',
          '  </div>',
          '  <div id="partial-scoring" class="panel-collapse panel-body">',
          '    <ul class="list-unstyled">',
          '      <li class="scoring-item" ng-repeat="scenario in fullModel.partialScoring">',
          '        If',
          '        <input class="form-control" type="number" min="1" max="{{model.choices.length - 1}}" ng-model="scenario.numberOfCorrect"/>',
          '        of correct answers is selected, award',
          '        <input class="form-control" type="number" min="1" max="99" ng-model="scenario.scorePercentage"/>',
          '        % of full credit.',
          '        <i class="fa fa-trash-o remove-item" ng-hide="fullModel.partialScoring.length == 1" ng-click="removeScoringScenario(scenario)"></i>',
          '      </li>',
          '    </ul>',
          '    <div class="text-right">',
          '      <button class="btn btn-default" ng-click="addScoringScenario()" ng-show="fullModel.partialScoring.length < ' + o.maxNumberOfPartialScores + '">',
          '        <i class="fa fa-plus"/>',
          '        Add another scenario',
          '      </button>',
          '    </div>',
          '  </div>',
          '</div>',
          '<div>{{model.partialScoring}}</div>'

        ].join('\n');
      };
    }

    return new ChoiceTemplates();
  }
];
