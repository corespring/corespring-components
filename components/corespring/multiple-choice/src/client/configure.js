var main = [
  '$log',
  '$http',
  'ChoiceTemplates',
  function(
    $log,
    $http,
    ChoiceTemplates
    ) {

    var choices = [
      '<p class="intro">',
      '  In multiple choice, students select the best response from a list of options presented. This interaction',
      '  allows for either one or more correct answers. Setting more than one answer as correct allows for partial',
      '  credit (see the scoring tab).',
      '</p>',
      '<div class="row"><div class="col-md-2">Choice Type:</div>',
      '  <div class="col-md-8">',
      '   <select ui-select2="{minimumResultsForSearch: -1}" ng-model="model.config.choiceType" class="label-select">',
      '     <option value="radio">Radio</option>',
      '     <option value="checkbox">Checkbox</option>',
      '   </select>',
      '  </div>',
      '</div>',
      '<div class="row"><div class="col-md-2">Choice Labels:</div>',
      '  <div class="col-md-8">',
      '    <select ui-select2="{minimumResultsForSearch: -1}" ng-model="model.config.choiceLabels" class="label-select">',
      '      <option value="none">None</option>',
      '      <option value="letters">Letters</option>',
      '      <option value="numbers">Numbers</option>',
      '    </select>',
      '  </div>',
      '</div>',
      '<div class="check-correct-label">Check Correct Answer(s)</div>',
      '<div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice({
        columnWidths: ['150px', '100%'],
        hideFeedbackOptions: ['default','notSelected']
      }),
      '</div>',
      '<button class=\"btn\" ng-click=\"addQuestion()\">Add a Choice</button>',
      '<div class="config-shuffle">',
      '  <input id="shuffle" type="checkbox" ng-model="model.config.shuffle"></input> <label for="shuffle">Shuffle Choices</label>',
      '</div>',
      '<div summary-feedback-input ng-model="fullModel.comments"></div>'
    ].join('\n');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {

        ChoiceTemplates.extendScope(scope, 'corespring-multiple-choice');

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            scope.model = scope.fullModel.model;
            scope.model.config.orientation = scope.model.config.orientation || "vertical";
            scope.feedback = {};
            scope.correctMap = {};
            scope.scoreMapping = {};
            scope.model.scoringType = scope.model.scoringType || "standard";
            scope.fullModel.partialScoring = scope.fullModel.partialScoring || [];

            _.each(model.scoreMapping, function(v, k) {
              scope.scoreMapping[k] = String(v);
            });

            _.each(model.feedback, function(feedback) {
              var choice = _.find(model.model.choices, function(choice) {
                return choice.value === feedback.value;
              });

              if (choice) {
                scope.feedback[choice.value] = {
                  feedback: feedback.feedback,
                  feedbackType: feedback.feedbackType || "none",
                  notChosenFeedback: feedback.notChosenFeedback,
                  notChosenFeedbackType: feedback.notChosenFeedbackType || "none"
                };
              }
            });

            _.each(scope.fullModel.correctResponse.value, function(cr) {
              scope.correctMap[cr] = true;
            });

            _.each(scope.model.choices, function(c) {
              c.labelType = c.labelType || "text";
            });
          },

          getModel: function() {
            var model = _.cloneDeep(scope.fullModel);
            var correctAnswers = [];

            _.each(scope.correctMap, function(v, k) {
              if (v) {
                correctAnswers.push(k);
              }
            });
            model.scoreMapping = {};

            _.each(scope.scoreMapping, function(v, k) {
              model.scoreMapping[k] = Number(v);
            });
            model.correctResponse.value = correctAnswers;

            _.each(model.model.choices, function(choice) {
              var feedback, _ref, _ref1;
              feedback = _.find(model.feedback, function(fb) {
                return fb.value === choice.value;
              });
              if (feedback) {
                feedback.feedback = (_ref = scope.feedback[choice.value]) !== null ? _ref.feedback : void 0;
                feedback.feedbackType = ((_ref1 = scope.feedback[choice.value]) !== null ? _ref1.feedbackType : void 0);
                feedback.notChosenFeedback = (_ref = scope.feedback[choice.value]) !== null ? _ref.feedback : void 0;
                feedback.notChosenFeedbackType = ((_ref1 = scope.feedback[choice.value]) !== null ? _ref1.feedbackType : void 0);
              }
            });

            return model;
          }
        };

        scope.$watch('correctMap', function(value) {
          var res;
          res = [];
          _.each(value, function(v, k) {
            if (v) {
              return res.push(k);
            }
          });
          scope.fullModel.correctResponse.value = res;
          console.log(scope.fullModel.correctResponse.value);
          return console.log(scope.model);
        }, true);

        scope.$watch('feedback', function(newFeedback) {
          $log.debug("update feedback in components");

          var out = _.makeArray(newFeedback, "value");
          scope.fullModel.feedback = out;
        }, true);

        scope.removeQuestion = function(q) {

          scope.correctMap[q.value] = false;

          scope.model.choices = _.filter(scope.model.choices, function(cq) {
            return cq !== q;
          });

          scope.fullModel.feedback = _.filter(scope.fullModel.feedback, function(fb) {
            return fb.value !== q.value;
          });

          return null;
        };

        scope.addQuestion = function() {
          var uid = _.uniqueId("mc_");

          scope.model.choices.push({
            label: "",
            value: uid,
            labelType: "text"
          });

          scope.feedback[uid] = {
            feedbackType: "default",
            value: uid
          };

          scope.fullModel.feedback.push(scope.feedback[uid]);
        };

        scope.isSingleChoice = function() {
          return (_(scope.correctMap).keys().filter(function(ck) {
            return scope.correctMap[ck];
          }).size() <= 1);
        };

        scope.toChar = function(num) {
          return String.fromCharCode(65 + num);
        };

        scope.updateMathJax = function() {
          scope.$emit('mathJaxUpdateRequest');
        };

        scope.navClosed = false;
        scope.toggleNav = function() {
          scope.navClosed = !scope.navClosed;
        };

        scope.leftPanelClosed = false;

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      },

      template: [
        '<div class="config-multiple-choice">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        ChoiceTemplates.inputHolder(undefined, choices),
        '    </div>',
        '    <div navigator-panel="Scoring">',
        ChoiceTemplates.scoring(),
        '    </div>',
        '  </div>',
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
