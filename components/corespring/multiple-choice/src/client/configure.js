var main = [
  '$log',
  '$http',
  'ChoiceTemplates',
  'ComponentImageService',
  'ChoiceTemplateScopeExtension',
  function(
    $log,
    $http,
    ChoiceTemplates,
    ComponentImageService,
    ChoiceTemplateScopeExtension) {

    var choices = [
      '<p class="intro">',
      '  In multiple choice, students select the best response from a list of options presented. This interaction',
      '  allows for either one or more correct answers. Setting more than one answer as correct allows for partial',
      '  credit (see the scoring tab).',
      '</p>',
      '<div class="check-correct-label">Check Correct Answer(s)</div>',
      '<div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice({
        columnWidths: ['150px', '100%']
      }),
      '</div>',
      '<button class=\"btn\" ng-click=\"addQuestion()\">Add a Choice</button>',
      '<div class="config-shuffle">',
      '  <input id="shuffle" type="checkbox" ng-model="model.config.shuffle"></input> <label for="shuffle">Shuffle Choices</label>',
      '</div>',
      '<div ng-click="commentOn = !commentOn" style="margin: 10px 0;"><i class="fa fa-{{commentOn ? \'minus\' : \'plus\'}}-square-o"></i><span style="margin-left: 3px">Summary Feedback (optional)</span></div>',
      '<div ng-show="commentOn">',
      '  <p>Use this space to provide summary level feedback for this interaction.</p>',
      '  <div mini-wiggi-wiz="" ng-model="fullModel.comments" placeholder="Enter a choice"',
      '    image-service="imageService()" features="extraFeatures"',
      '    parent-selector=".wiggi-wiz-overlay"></div>',
      '</div>'
    ].join('\n');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      controller: ['$scope',
        function(scope) {
          $log.debug('---------> controller');
          scope.imageService = function() {
            return ComponentImageService;
          };
        }
      ],
      link: function(scope, element, attrs) {


        // TODO: this needs to be centralised and not duplicated here and the server side
        scope.defaultCorrectFeedback = "Correct!";
        scope.defaultIncorrectFeedback = "Good try but that is not the correct answer";
        scope.defaultNotChosenFeedback = "This answer is correct";

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
                  feedbackType: feedback.feedbackType || "default",
                  notChosenFeedback: feedback.notChosenFeedback,
                  notChosenFeedbackType: feedback.notChosenFeedbackType || "default"
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
            model.model.config.singleChoice = correctAnswers.length === 1;

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
          scope.model.config.singleChoice = res.length === 1;
          return console.log(scope.model);
        }, true);

        scope.$watch('feedback', function(newFeedback) {
          $log.debug("update feedback in components");

          var out = _.makeArray(newFeedback, "value");
          scope.fullModel.feedback = out;
        }, true);

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

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

        new ChoiceTemplateScopeExtension().postLink(scope, element, attrs);

      },

      template: [
        '<div class="config-multiple-choice">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        ChoiceTemplates.wrap(undefined, choices),
        '    </div>',
        '    <div navigator-panel="Scoring">',
        ChoiceTemplates.wrap(undefined, ChoiceTemplates.scoring()),
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