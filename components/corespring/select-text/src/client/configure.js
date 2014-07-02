var main = [
  '$log',
  'ChoiceTemplates',
  'ServerLogic',
  'TextProcessing',
  function ($log, ChoiceTemplates, ServerLogic, TextProcessing) {

    var designPanel = [
      '<div navigator-panel="Design">',
      '  <div class="input-holder root">',
      '    <div class="body">',
      '      <p class="info">',
      '        In Select Text Evidence, a student is asked to highlight specific words or sentences from a',
      '        passage to provide evidence to support their answer.',
      '      </p>',
      '      <div class="select-text-editor-container clearfix" ng-class="mode" ng-click="hidePopover()"',
      '           popover-trigger="show" popover-placement="top"',
      '           popover="Click the {{model.config.selectionUnit}}s you want to set as choices">',
      '        <wiggi-wiz ng-show="mode == \'editor\'" ng-model="content.xhtml">',
      '          <toolbar formatting="empty" positioning="empty"></toolbar>',
      '        </wiggi-wiz>',
      '        <div class="selection-editor" ng-show="mode == \'selection\'"',
      '             ng-class="{words: model.config.selectionUnit == \'word\'}">',
      '          <span class="selection" ng-repeat="choice in model.choices" ng-class="{correct: choice.correct}"',
      '                ng-click="selectItem($index)" ng-bind-html-unsafe="choice.data"></span>',
      '        </div>',
      '        <button class="btn btn-sm toggle-choice" ng-click="toggleChoice($event)">',
      '          {{mode == \'selection\' ? \'edit passage\' : \'done\'}}',
      '        </button>',
      '      </div>',
      '      <div class="selection-unit property" ng-class="{disabled: mode != \'selection\'}">',
      '        <p>',
      '          Students must select',
      '          <select class="form-control selection-unit" ng-disabled="mode != \'selection\'"',
      '                  ng-model="model.config.selectionUnit">',
      '            <option value="word">Words</option>',
      '            <option value="sentence">Sentences</option>',
      '          </select>',
      '          from the passage above.',
      '        </p>',
      '        <p>Select all possible choices {{model.config.selectionUnit}}s.</p>',
      '        <p>{{correctSelections()}} is the total number of correct selections identified.</p>',
      '      </div>',
      '      <div class="property response-type">',
      '        <strong>Acceptable Responses</strong>',
      '        <div class="response-type-selection">',
      '          <p class="prompt">Students must respond by:</p>',
      '          <label>',
      '            <input type="radio" ng-model="model.config.checkIfCorrect" ng-value="true"/>',
      '            <span>Selecting all of the {{model.config.selectionUnit}}s identified as correct</span>',
      '          </label>',
      '          <label class="open-ended">',
      '            <input type="radio" ng-model="model.config.checkIfCorrect" ng-value="false"/>',
      '            Selecting any number of {{model.config.selectionUnit}}s; the teacher will manually review',
      '            the selections to determine correctness.',
      '          </label>',
      '        </div>',
      '      </div>',
      '      <div class="additional-copyright-information">',
      '        <additional-copyright-information copyrights="profile.contributorDetails.additionalCopyrights"',
      '                                          prompt="Does this item contain any other copyrighted materials? E.g., book passage, image, etc.">',
      '        </additional-copyright-information>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="input-holder">',
      '    <div class="header">Feedback</div>',
      '    <div class="body">',
      '      <div class="well">',
      '        <div feedback-selector',
      '             fb-sel-label="If correct, show"',
      '             fb-sel-class="correct"',
      '             fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '             fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '             fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '          ></div>',
      '      </div>',
      '      <div class="well">',
      '        <div feedback-selector',
      '             fb-sel-label="If partially correct, show"',
      '             fb-sel-class="partial"',
      '             fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '             fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '             fb-sel-default-feedback="{{defaultPartialFeedback}}"',
      '          ></div>',
      '      </div>',
      '      <div class="well">',
      '        <div feedback-selector',
      '             fb-sel-label="If incorrect, show"',
      '             fb-sel-class="incorrect"',
      '             fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '             fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '             fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '          ></div>',
      '      </div>',
      '      <div summary-feedback-input ng-model="fullModel.comments"></div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    var scorePanel = [
      '<div navigator-panel="Scoring">',
      ChoiceTemplates.wrap(undefined, ChoiceTemplates.scoring({maxNumberOfPartialScores: "correctChoices() - 1"})),
      '</div>'
    ].join('');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function ($scope, $element, $attrs) {

        var server = ServerLogic.load('corespring-select-text');
        $scope.defaultCorrectFeedback = server.DEFAULT_CORRECT_FEEDBACK;
        $scope.defaultPartialFeedback = server.DEFAULT_PARTIAL_FEEDBACK;
        $scope.defaultIncorrectFeedback = server.DEFAULT_INCORRECT_FEEDBACK;

        $scope.mode = 'editor';

        $scope.overrideFeatures = [
          {
            name: 'image',
            action: undefined
          }
        ];

        function setBoundaries(oldValue, newValue) {
          // Don't run on init, when oldValue === newValue
          if (oldValue !== newValue) {
            if ($scope.model.config.selectionUnit === 'word') {
              $scope.model.choices = TextProcessing.wordSplit($scope.content.xhtml);
            } else if ($scope.model.config.selectionUnit === 'sentence') {
              $scope.model.choices = TextProcessing.sentenceSplit($scope.content.xhtml);
            } else {
              $scope.model.choices = [$scope.content.xhtml];
            }
          }
        }

        $scope.$watch('content.xhtml', setBoundaries, true);
        $scope.$watch('model.config.selectionUnit', setBoundaries, true);

        $scope.selectItem = function (index) {
          $scope.model.choices[index].correct = !$scope.model.choices[index].correct;
        };

        $scope.isSingleChoice = function () {
          return $scope.correctChoices() < 2;
        };

        $scope.safeApply = function (fn) {
          var phase = this.$root.$$phase;
          if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };

        $scope.toggleChoice = function ($event) {
          $event.stopPropagation();
          if ($scope.mode === 'editor') {
            $scope.mode = 'selection';
            $scope.safeApply(function () {
              setTimeout(function () {
                $('.select-text-editor-container', $element).trigger('show');
              }, 200);
            });
          } else {
            $scope.mode = 'editor';
            $scope.hidePopover();
          }
        };

        $scope.correctChoices = function () {
          return ($scope.model && $scope.model.choices) ? _.filter($scope.model.choices, function (choice) {
            return choice.correct === true;
          }).length : 0;
        };

        $scope.hidePopover = function () {
          setTimeout(function () {
            if ($('.popover-inner', $element).length !== 0) {
              $('.select-text-editor-container', $element).trigger('show');
            }
          }, 200);
        };

        $scope.containerBridge = {
          setModel: function (model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;
            $scope.model.choices = $scope.model.choices || [];
            $scope.content = {};
            $scope.content.xhtml = _.pluck($scope.model.choices, 'data').join(' ');
            $scope.fullModel.partialScoring = $scope.fullModel.partialScoring || [];
          },
          getModel: function () {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          },
          setProfile: function (profile) {
            $scope.profile = _.defaults(profile, {
              contributorDetails: {
                additionalCopyrights: []
              }
            });
          }
        };

        ChoiceTemplates.extendScope($scope);

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
      },
      template: [
        '<div class="select-text-configuration">',
        '  <div navigator="">',
        designPanel,
        scorePanel,
        '  </div>',
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
