var main = [
  "ChoiceTemplates",
  function(ChoiceTemplates) {

    var intro = [
      '<p>',
      '   In Short Answer &mdash; Drag and Drop, students are asked to complete a sentence, word, phrase or',
      '   equation using context clues presented in the text that surrounds it.',
      '</p>',
    ].join("\n");

    var choices = [
      '<div class="container-fluid choices-container">',
      '  <div class="row">',
      '    <div class="col-xs-12"><label class="control-label" style="margin-bottom: 10px;">Choices</label></div>',
      '  </div>',
      '  <div class="choice-row" ng-repeat="choice in model.choices">',
      '    <div class="row">',
      '      <div class="col-xs-1 text-center">',
      '        <i class="fa fa-trash-o fa-lg remove-choice" ng-hide="model.choices.length == 1" title="Delete"',
      '            data-toggle="tooltip" ng-click="removeChoice(choice)">',
      '        </i>',
      '      </div>',
      '      <div class="col-xs-10">',
      '        <div mini-wiggi-wiz="" dialog-launcher="external" ng-model="choice.label" placeholder="Enter a choice"',
      '            image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
      '            parent-selector=".modal-body">',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="row" style="margin-bottom: 20px;">',
      '      <div class="col-xs-offset-1 col-xs-10">',
      '        <checkbox ng-model="choice.moveOnDrag">Remove tile after placing</checkbox>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="row" style="margin-bottom: 20px;">',
      '    <div class="col-xs-12">',
      '      <button type="button" class="btn btn-default add-choice"',
      '          ng-click="addChoice()">Add a Choice</button>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <checkbox class="shuffle-choices" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <label>Display choices: ',
      '        <select class="form-control choice-area" ng-model="model.config.choiceAreaPosition"',
      '           ng-options="c for c in [\'above\', \'below\']">',
      '        </select>',
      '      </label>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join("\n");

    var answerAreaOptions = [
      '<div class="container-fluid answer-areas-container">',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <label class="control-label" style="margin-bottom: 10px;">Problem Area</label>',
      '    </div>',
      '  </div>',
      '  <div class="row" ng-repeat="aa in model.answerAreas">',
      '    <div class="col-xs-10 col-xs-offset-1 well">',
      '      <div class="remove-button" ng-click="removeAnswerArea(aa)"><i class="fa fa-trash-o fa-lg"></i></div>',
      '      <div><label class="control-label">Problem {{($index+1)}}</label></div>',
      '        <form class="form-horizontal" role="form">',
      '          <div class="config-form-row">',
      '            <div class="col-sm-3">Text Before (optional)</div>',
      '            <div class="col-sm-9">',
      '              <div mini-wiggi-wiz="" dialog-launcher="external" ng-model="aa.textBefore" placeholder="Enter ..."',
      '               image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
      '               parent-selector=".modal-body">',
      '              </div>',
      '            </div>',
      '          </div>',
      '          <div class="config-form-row">',
      '            <div class="col-sm-3">Correct Answer(s)</div>',
      '            <div class="col-sm-9">',
      '              <select bootstrap-multiselect="{{componentState}}" class="answer-area-select form-control"',
      '                  multiple="true" ng-model="correctAnswers[aa.id]"',
      '                  ng-options="choiceToDropDownItem(c) for c in model.choices">',
      '              </select>',
      '            </div>',
      '          </div>',
      '          <div class="config-form-row">',
      '            <div class="col-sm-3">Text After (optional)</div>',
      '            <div class="col-sm-9">',
      '              <div mini-wiggi-wiz="" dialog-launcher="external" ng-model="aa.textAfter" placeholder="Enter ..."',
      '               image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
      '               parent-selector=".modal-body">',
      '              </div>',
      '            </div>',
      '          </div>',
      '          <div class="config-form-row">',
      '            <div class="col-sm-8">',
      '              <checkbox id="insertBr{{$index}}" ng-model="aa.insertBr">Insert Line Break</checkbox>',
      '            </div>',
      '          </div>',
      '        </form>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-10 col-xs-offset-1">',
      '      <button type="button" id="add-choice" class="btn btn-default" ',
      '          ng-click="addAnswerArea()">Add Problem Area</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    var feedbackOptions = [
      '<div feedback-panel>',
      '  <div feedback-selector',
      '      fb-sel-label="If correct, show"',
      '      fb-sel-class="correct"',
      '      fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '      fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If partially correct, show"',
      '      fb-sel-class="partial"',
      '      fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '      fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If incorrect, show"',
      '      fb-sel-class="incorrect"',
      '      fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '      fb-sel-default-feedback="{{defaultIncorrectFeedback}}">' +
      '  </div>',
      '</div>',
    ].join("\n");

    var designOptions = [
      '<div class="container-fluid">',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      intro,
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="container-fluid">',
      '  <div class="row">',
      '    <div class="col-xs-5">',
      choices,
      '    </div>',
      '    <div class="col-xs-7">',
      answerAreaOptions,
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="container-fluid">',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      feedbackOptions,
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    var scoringOptions = [
      '<div class="container-fluid">',
      '  <div class="row">',
      '    <div class="col-xs-12">',
             ChoiceTemplates.scoring(),
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    var displayOptions = [
      '<div class="container-fluid">',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <form class="form-horizontal" role="form">',
      '        <div class="config-form-row">',
      '          <div class="col-sm-5" ng-show="model.config.choiceAreaHasLabel">',
      '            <input type="text" class="form-control" ng-model="model.config.choiceAreaLabel" />',
      '          </div>',
      '        </div>',
      '        <div class="config-form-row"><label>Layout</label></div>',
      '        <div class="config-form-row layout-config">',
      '          <div class="col-sm-2">',
      '            <radio id="vertical" value="vertical"',
      '                ng-model="model.config.choiceAreaLayout">Vertical</radio>',
      '          </div>',
      '          <div class="col-sm-2">',
      '            <radio id="horizontal" value="horizontal"',
      '                ng-model="model.config.choiceAreaLayout">Horizontal</radio>',
      '          </div>',
      '        </div>',
      '        <div class="config-form-row">',
      '          <label>Choice area is </label>',
      '          <select class="form-control choice-area" ng-model="model.config.choiceAreaPosition"',
      '              ng-options="c for c in [\'above\', \'below\']">',
      '          </select>',
      '          <label>answer blanks</label>',
      '        </div>',
      '      </form>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    var template = [
      '<div class="drag-and-drop-config-panel drag-and-drop-inline-config-panel" choice-template-controller="">',
      '  <div navigator-panel="Design">',
           designOptions,
      '  </div>',
      '  <div navigator-panel="Scoring">',
           scoringOptions,
      '  </div>',
      '</div>'
    ].join('\n');

    return {
      restrict: "E",
      scope: "isolate",
      template: template,
      replace: true,
      link: function($scope, element, attrs) {

        ChoiceTemplates.extendScope($scope, 'corespring-drag-and-drop-inline');

        $scope.correctAnswers = {};

        $scope.choiceToDropDownItem = function(c) {
          if (!c) {
            return;
          }
          if (c.labelType === 'image') {
            return c.imageName;
          }
          return c.label;
        };

        $scope.choiceToLetter = function(c) {
          var idx = $scope.model.choices.indexOf(c);
          return $scope.toChar(idx);
        };

        function sumCorrectAnswers() {
          return _.reduce($scope.correctAnswers, function(memo, ca) {
            return ca.length + memo;
          }, 0);
        }

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;

            function choiceById(cid) {
              return _.find(model.model.choices, function(c) {
                return c.id === cid;
              });
            }

            _.each(model.correctResponse, function(val, key) {
              $scope.correctAnswers[key] = _.map(val, function(choiceId) {
                return choiceById(choiceId);
              });
            });

            $scope.updatePartialScoringModel(sumCorrectAnswers());

            $scope.componentState = "initialized";
            console.log(model);
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          },
          getAnswer: function() {
            console.log("returning empty answer for: Drag and drop inline");
            return {};
          }
        };

        $scope.$watch('correctAnswers', function(n) {
          if (n) {
            _.each($scope.correctAnswers, function(val, key) {
              $scope.fullModel.correctResponse[key] = _.pluck(val, 'id');
            });
            $scope.updatePartialScoringModel(sumCorrectAnswers());
          }
        }, true);

        $scope.removeChoice = function(c) {
          $scope.model.choices = _.filter($scope.model.choices, function(existing) {
            return existing !== c;
          });
          _.each($scope.correctAnswers, function(val, key) {
            $scope.correctAnswers[key] = _.filter(val, function(choice) {
              return choice !== c;
            });
          });
        };

        function findFreeChoiceSlot() {
          var slot = 0;
          var ids = _.pluck($scope.model.choices, 'id');
          while (_.contains(ids, "choice_" + slot)) {
            slot++;
          }
          return slot;
        }

        $scope.addChoice = function() {
          $scope.model.choices.push({
            id: "choice_" + findFreeChoiceSlot(),
            labelType: "text",
            label: "",
            moveOnDrag: false
          });
        };

        $scope.removeAnswerArea = function(answerArea) {
          $scope.model.answerAreas = _.filter($scope.model.answerAreas, function(existing) {
            return existing !== answerArea;
          });
          delete $scope.correctAnswers[answerArea.id];
        };

        function findFreeAnswerAreaSlot() {
          var slot = 0;
          var ids = _.pluck($scope.model.answerAreas, 'id');
          while (_.contains(ids, "aa_" + slot)) {
            slot++;
          }
          return slot;
        }

        $scope.addAnswerArea = function() {
          var idx = findFreeAnswerAreaSlot();
          $scope.model.answerAreas.push({
            id: "aa_" + idx,
            textBefore: "",
            textAfter: ""
          });
        };

        $scope.$emit('registerConfigPanel', attrs.id, $scope.containerBridge);
      }
    };
  }
];



exports.framework = 'angular';
exports.directives = [{
  directive: main
}];