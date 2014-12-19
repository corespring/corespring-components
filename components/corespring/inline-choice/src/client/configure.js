var main = [
  '$log', 'ChoiceTemplates',
  function($log, ChoiceTemplates) {

    "use strict";

    var choices = [
      '<div class="choice-config-panel" >',
      '  <p class="info">',
      '    In Drop Down Choice, students select the best response from a list of options presented. This interaction ',
      '    type may be embedded inline with other content such as text.',
      '  </p>',
      '  <div class="check-correct-label">Check Correct Answer(s)</div>',
      '  <div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice({
        correct: '<i class="fa fa-check fa-lg choice-checkbox" ng-class="{checked: fullModel.correctResponse == q.value}" ng-click="fullModel.correctResponse = q.value"></i>',
        correctnessPredicate: 'fullModel.correctResponse == q.value',
        selectType: false,
        showLabel: false
      }),
      '  </div>',
      '  <button class=\"btn\" ng-click=\"addQuestion()\">Add a Choice</button>',
      '  <checkbox class="shuffle" id="shuffle" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
      '</div>'
    ].join('\n');


    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {

        ChoiceTemplates.extendScope(scope, 'corespring-inline-choice');

        scope.correctMap = [];

        scope.overrideFeatures = [{
          name: 'image',
          action: undefined
        }];

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

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      },
      //TODO - allow the use of templates...
      //templateUrl: 'configure.html',
      template: [
        '<div class="config-inline-choice" choice-template-controller="">',
        ChoiceTemplates.inputHolder(undefined, choices),
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
