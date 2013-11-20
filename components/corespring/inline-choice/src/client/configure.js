var main = [
  'ChoiceTemplates',
  function (ChoiceTemplates) {
    var correct = ChoiceTemplates.inline("radio", "{{q.value}}", "Correct", "ng-model='$parent.fullModel.correctResponse'");
    
    var choices = [
        '<div class="choice" ng-repeat="q in model.choices">',
          ChoiceTemplates.choice({correct: correct}),
        '</div>',
        '<button class=\"btn\" ng-click=\"addQuestion()\">Add</button>'
      ].join('\n'); 

    var displayOptions = [
      '<div class="well">',
        ' <input type="checkbox" ng-model="model.config.shuffle"></input> <label>Shuffle Distractors</label>',
      '</div>'
    ].join('\n');
    
    return { 
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function (scope, element, attrs) {
        scope.containerBridge = {
          setModel: function (model) {
            scope.fullModel = model;
            scope.feedback = model.feedback;
            scope.model = scope.fullModel.model;
            scope.model.config.orientation = scope.model.config.orientation || "vertical";
            scope.scoreMapping = {};
            scope.model.scoringType = scope.model.scoringType || "standard";
            _.each(model.scoreMapping, function (v,k) {
              scope.scoreMapping[k] = String(v);
            });

            _.each(scope.model.choices, function (c) {
              c.labelType = c.labelType || "text";
            });
            return console.log(model);
          },

          getModel: function () {
            var model = _.cloneDeep(scope.fullModel);
            model.scoreMapping = {};
            _.each(scope.scoreMapping, function(v,k) {
              model.scoreMapping[k] = Number(v);
            });
            console.log("getting model: ", model);

            return model;
          }
        };

        scope.registerConfigPanel(attrs.id, scope.containerBridge);

        scope.removeQuestion = function (q) {
          scope.model.choices = _.filter(scope.model.choices, function (cq) {
            return cq !== q;
          });
          return null;
        };

        scope.addQuestion = function () {
          var id = ""+scope.model.choices.length;
          scope.model.choices.push({
            value: id,
            label: "new Question",
            labelType: "text"
          });
          scope.fullModel.feedback[id] = {feedbackType: 'standard'};
        };

        scope.toChar = function (num) {
          return String.fromCharCode(65 + num);
        };

      },
      template: [
        '<div class="view-inline-choice">',
          ChoiceTemplates.wrap('Prompt', ChoiceTemplates.prompt),
          ChoiceTemplates.wrap('Choices', choices),
          ChoiceTemplates.wrap('Display Options', displayOptions),
          ChoiceTemplates.wrap("Scoring", ChoiceTemplates.scoring()),
        '</div>'
      ].join("")
    };
  }
];

exports.framework = 'angular';
exports.directives = [{directive: main}];

