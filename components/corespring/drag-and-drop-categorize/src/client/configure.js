var main = [
  "ChoiceTemplates", 'ServerLogic',
  function(ChoiceTemplates, ServerLogic) {
    var input, inputs, template;

    input = function(attrs, label) {
      return "<div style=\"margin-bottom: 20px\"> <input type=\"text\" class=\"form-control\" style=\"width: 80%; display: inline-block \"" + attrs + " />" + label + "</div>";
    };

    var inputHolder = function(header, body) {
      return [
        '<div class="input-holder">',
        ' <div class="header">' + header + '</div>',
        ' <div class="body">',
        body,
        ' </div>',
        '</div>'
        ].join("");
    };

    var choiceArea = [
      '  <div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice({feedback: false, correct: ''}),
      '  </div>',

        '<div class="clearfix"></div>',
        '  <button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>'

        ].join("");

    var answerArea = [
        '<div class="answer-area" ng-repeat="category in model.categories">',
        '  <div>Correct tiles for {{$first ? "Default Answer Area" :"Answer Area "+($index+1)}}</div>',
        '  <select class="answer-area-select" multiple="true" ng-model="correctAnswers[category.id]" ng-options="choiceToLetter(c) for c in model.choices"></select>',
        '  <div><a href="#" ng-hide="$first" ng-click="removeCategory(category)">Remove Answer Area</a></div>',
        '</div>',
        '<a ng-click="addCategory()">Add Answer Area</a>'

      ].join("");

    var feedback = [
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="Correct"',
      '               fb-sel-class="correct"',
      '               fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '               fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '          ></div>',
      '        </div>',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="Partial"',
      '               fb-sel-class="correct"',
      '               fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '               fb-sel-default-feedback="{{defaultPartialFeedback}}"',
      '          ></div>',
      '        </div>',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="Incorrect"',
      '               fb-sel-class="incorrect"',
      '               fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '               fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '          ></div>',
      '        </div>'
      ].join("");

    var displayOptions = function() {
      return [
        '<div class="display-row"><label class="col-sm-4">Shuffle</label><input type=\"checkbox\" ng-model=\"model.config.shuffle\" /></div>',
        '<div class="display-row"><label class="col-sm-4">Show choice area </label><select ng-model="model.config.position"><option value="above">Above</option><option value="below">Below</option></select> the answer area</div>',
        '<div class="display-row"><label class="col-sm-4">Label for choice area </label><div class="col-sm-6"><input type="text" class="form-control"  ng-model="model.config.choiceAreaLabel"/></div></div>',
        '<div class="display-row"><label class="col-sm-4">Label for answer area </label><div class="col-sm-6"><input type="text" class="form-control"  ng-model="model.config.answerAreaLabel"/></div></div>'
        ].join("");
    };

    template = [
      '<div class="drag-and-drop-config-panel" choice-template-controller="">',
      '  <div navigator="">',
      '    <div navigator-panel="Design">',
      inputHolder('Choices', choiceArea),
      inputHolder('Answer Areas', answerArea),
      inputHolder('Feedback', feedback),
      '    </div>',

      '    <div navigator-panel="Scoring">',
      '      <div>',
      ChoiceTemplates.wrap(undefined, ChoiceTemplates.scoring({maxNumberOfPartialScores: "sumCorrectResponses() - 1"})),
      '      </div>',
      '    </div>',


      '  </div>',
      '</div>'].join('\n');

    return {
      restrict: "E",
      scope: "isolate",
      template: template,
      replace: true,
      link: function($scope, element, attrs) {

        var server = ServerLogic.load('corespring-drag-and-drop-categorize');
        $scope.defaultCorrectFeedback = server.DEFAULT_CORRECT_FEEDBACK;
        $scope.defaultPartialFeedback = server.DEFAULT_PARTIAL_FEEDBACK;
        $scope.defaultIncorrectFeedback = server.DEFAULT_INCORRECT_FEEDBACK;

        $scope.correctAnswers = {};

        $scope.choiceToLetter = function(c) {
          var idx = $scope.model.choices.indexOf(c);
          return $scope.toChar(idx);
        };

        $scope.toChar = function(num) {
          return String.fromCharCode(65 + num);
        };

        $scope.sumCorrectResponses = function() {
          return _.reduce($scope.correctAnswers, function(memo, ca) {
            return ca.length + memo;
          }, 0);
        };

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;

            var choiceById = function(cid) {
              return _.find(model.model.choices, function(c) {
                return c.id === cid;
              });
            };

            _.each(model.correctResponse, function(val, key) {
               $scope.correctAnswers[key] = _.map(val, function(choiceId) {
                  return choiceById(choiceId);
               });
            });
            console.log(model);
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          },

          getAnswer: function() {
            console.log("returning answer for: Drag and drop");
            return {};
          }
        };

        $scope.$watch('correctAnswers', function(n) {
          if (n) {
            $scope.fullModel.correctResponse = _.cloneDeep($scope.correctAnswers);
            _.each($scope.fullModel.correctResponse, function(val, key) {
              $scope.fullModel.correctResponse[key] = _.pluck(val, 'id');
            });
          }
        }, true);

        $scope.$emit('registerConfigPanel', attrs.id, $scope.containerBridge);

        $scope.remove = function(c) {
          $scope.model.choices = _.filter($scope.model.choices, function(existing) {
            return existing !== c;
          });
        };

        $scope.addChoice = function() {
          $scope.model.choices.push({
            id: "" + $scope.model.choices.length,
            content: "new choice"
          });
        };

        $scope.removeCategory = function(category) {
          $scope.model.categories = _.filter($scope.model.categories, function(existing) {
            return existing !== category;
          });
        };

        $scope.addCategory = function() {
          var idx = $scope.model.categories.length + 1;
          $scope.model.categories.push({
            id: "cat_"+idx,
            label: "Category "+idx,
            orientation: "vertical"
          });
        };

      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
