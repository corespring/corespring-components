var displayOptions = [
  '<div class="well">',
  ' <input id="shuffle" type="checkbox" ng-model="model.config.shuffle"></input> <label for="shuffle">Shuffle Distractors</label>',
  '</div>'
].join('\n');


var main = [
  '$log', 'ChoiceTemplates',
  function($log, ChoiceTemplates) {

    var choices = [
      '<div class="choice-config-panel config-panel">',
      '  <div class="check-correct-label">Select Correct Answer</div>',
      '  <div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice({
        correct: '<i class="fa fa-check fa-lg choice-checkbox" ng-class="{checked: fullModel.correctResponse == q.value}" ng-click="fullModel.correctResponse = q.value"></i>',
        correctnessPredicate: 'fullModel.correctResponse == q.value'
      }),
      '  </div>',
      '  <button class=\"btn\" ng-click=\"addQuestion()\">Add a Choice</button>',
      '</div>'
    ].join('\n');


    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {

        // TODO: this needs to be centralised and not duplicated here and the server side
        scope.defaultCorrectFeedback = "Correct!";
        scope.defaultIncorrectFeedback = "Good try but that is not the correct answer";
        scope.correctMap = [];

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            scope.model = scope.fullModel.model;
            scope.model.config.orientation = scope.model.config.orientation || "vertical";
            scope.model.scoringType = scope.model.scoringType || "standard";
            scope.feedback = {};

            _.each(model.scoreMapping, function(v, k) {
              scope.scoreMapping[k] = String(v);
            });

            _.each(scope.model.choices, function(c) {
              c.labelType = c.labelType || "text";
            });

            _.each(model.feedback, function(feedback) {
              var choice = _.find(model.model.choices, function(choice) {
                return choice.value === feedback.value;
              });


              if (choice) {
                scope.feedback[choice.value] = {
                  feedback: feedback.feedback,
                  feedbackType: feedback.feedbackType || "default"
                };
              }
            });

          },

          getModel: function() {
            var model = _.cloneDeep(scope.fullModel);

            _.each(model.model.choices, function(choice) {
              var feedback, _ref, _ref1;
              feedback = _.find(model.feedback, function(fb) {
                return fb.value === choice.value;
              });
              if (feedback) {
                feedback.feedback = (_ref = scope.feedback[choice.value]) !== null ? _ref.feedback : void 0;
                feedback.feedbackType = ((_ref1 = scope.feedback[choice.value]) !== null ? _ref1.feedbackType : void 0);
              }
            });
            return model;
          }
        };

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
            feedbackType: "standard",
            value: uid
          };

          scope.fullModel.feedback.push(scope.feedback[uid]);
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

      },
      //TODO - allow the use of templates...
      //templateUrl: 'configure.html',
      template: [
        '<div class="config-multiple-choice" choice-template-controller="">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        ChoiceTemplates.wrap(undefined, choices),
        '    </div>',
        '    <div navigator-panel="Display">',
        ChoiceTemplates.wrap(undefined, displayOptions),
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