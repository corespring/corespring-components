var shuffle = [
  '<div class="well">',
  ' <input type="checkbox" ng-model="model.config.shuffle"></input> <label>Shuffle Distractors</label>',
  ' <table> ',
  ' <tr> ',
  ' <td> Layout: ',
  ' <td> <input type="radio" value="vertical" ng-model="model.config.orientation"></input><td>A<br/>B<br/>C<br/>D',
  ' <td> <input type="radio" value="horizontal" ng-model="model.config.orientation"></input><td>A B C D',
  ' <td> <input type="radio" value="tile" ng-model="model.config.orientation"></input><td>A B<br/>C D',
  ' </table>',
  '</div>'
].join('\n');


var main = [
  '$log', 'ChoiceTemplates',
  function($log, ChoiceTemplates) {

    var choices = [
      '<div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice(),
      '</div>',
      '<button class=\"btn\" ng-click=\"addQuestion()\">Add a Choice</button>'
    ].join('\n');


    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            scope.model = scope.fullModel.model;
            scope.model.config.orientation = scope.model.config.orientation || "vertical";
            scope.feedback = {};
            scope.correctMap = {};
            scope.scoreMapping = {};
            scope.model.scoringType = scope.model.scoringType || "standard";

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
                  feedbackType: feedback.isDefault ? "standard" : "custom"
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
                feedback.isDefault = ((_ref1 = scope.feedback[choice.value]) !== null ? _ref1.feedbackType : void 0) === "standard";
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
        '<div class="config-multiple-choice" file-uploader-host="">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
//              ChoiceTemplates.wrap('Prompt', ChoiceTemplates.prompt),
        ChoiceTemplates.wrap('Answer Area', choices),
        '    </div>',
        '    <div navigator-panel="Display">',
        ChoiceTemplates.wrap('Display Options', shuffle),
        '    </div>',
        '    <div navigator-panel="Scoring">',
        ChoiceTemplates.wrap('Scoring', ChoiceTemplates.scoring()),
        '    </div>',
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
