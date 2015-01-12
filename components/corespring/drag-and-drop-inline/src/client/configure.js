var main = [
  "ChoiceTemplates",
  function(ChoiceTemplates) {
    var input = function(attrs, label) {
      return "<div style=\"margin-bottom: 20px\"> <input type=\"text\" class=\"form-control\" style=\"width: 80%; display: inline-block \"" + attrs + " />" + label + "</div>";
    };

    var designOptions = [
      '    <div class="container-fluid">',
      '      <div class="row">',
      '        <div class="col-xs-12">',
      '          <p>',
      '            In Short Answer &mdash; Drag and Drop, students are asked to complete a sentence, word, phrase or',
      '            equation using context clues presented in the text that surrounds it.',
      '          </p>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="container-fluid answer-areas-container">',
      '      <div class="row">',
      '        <div class="col-xs-12">',
      '          <label class="control-label" style="margin-bottom: 10px;">Problem Area</label>',
      '        </div>',
      '      </div>',
      '      <div class="row" ng-repeat="aa in model.answerAreas">',
      '        <div class="col-xs-10 col-xs-offset-1 well">',
      '          <div class="remove-button" ng-click="removeAnswerArea(aa)"><i class="fa fa-times-circle"></i></div>',
      '          <div><label class="control-label">Problem {{($index+1)}}</label></div>',
      '            <form class="form-horizontal" role="form">',
      '              <div class="config-form-row">',
      '                <div class="col-sm-3">Text Before (optional)</div>',
      '                <div class="col-sm-6">',
      '                  <input class="form-control" type="text" ng-model="aa.textBefore"/>',
      '                </div>',
      '              </div>',
      '              <div class="config-form-row">',
      '                <div class="col-sm-3">Correct Answer(s)</div>',
      '                <div class="col-sm-6">',
      '                  <select bootstrap-multiselect="{{componentState}}" class="answer-area-select form-control"',
      '                      multiple="true" ng-model="correctAnswers[aa.id]"',
      '                      ng-options="choiceToDropDownItem(c) for c in model.choices">',
      '                  </select>',
      '                </div>',
      '              </div>',
      '              <div class="config-form-row">',
      '                <div class="col-sm-3">Text After (optional)</div>',
      '                <div class="col-sm-6">',
      '                  <input class="form-control" type="text" ng-model="aa.textAfter" />',
      '                </div>',
      '              </div>',
      '              <div class="config-form-row">',
      '                <div class="col-sm-8">',
      '                  <checkbox id="insertBr{{$index}}" ng-model="aa.insertBr">Insert Line Break</checkbox>',
      '                </div>',
      '              </div>',
      '            </form>',
      '        </div>',
      '      </div>',
      '      <div class="row">',
      '        <div class="col-xs-10 col-xs-offset-1">',
      '          <button type="button" id="add-choice" class="btn btn-default" ',
      '              ng-click="addAnswerArea()">Add Problem Area</button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="container-fluid choices-container">',
      '      <div class="row">',
      '        <div class="col-xs-12"><label class="control-label" style="margin-bottom: 10px;">Choices</label></div>',
      '      </div>',
      '      <div class="choice-row" ng-repeat="choice in model.choices">',
      '        <div class="row">',
      '          <div class="col-xs-1 text-center">',
      '            <i class="fa fa-trash-o fa-lg" title="Delete" data-tggle="tooltip" ng-click="removeQuestion(choice)">',
      '            </i>',
      '          </div>',
      '          <div class="col-xs-10">',
      '            <div mini-wiggi-wiz="" ng-model="choice.label" placeholder="Enter a choice"',
      '                image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
      '                parent-selector=".wiggi-wiz-overlay">',
      '              <edit-pane-toolbar alignment="bottom">',
      '                <div class="btn-group pull-right">',
      '                  <button ng-click="closePane()" class="btn btn-sm btn-success">Done</button>',
      '                </div>',
      '              </edit-pane-toolbar>',
      '            </div>',
      '          </div>',
      '        </div>',
      '        <div class="row" style="margin-bottom: 20px;">',
      '          <div class="col-xs-offset-1 col-xs-10">',
      '            <checkbox ng-model="q.moveOnDrag">Remove tile after placing</checkbox>',
      '          </div>',
      '        </div>',
      '      </div>',
      '      <div class="row">',
      '        <div class="col-xs-12">',
      '          <button type="button" class="btn btn-default add-choice"',
      '              ng-click="addQuestion()">Add a Choice</button>',
      '        </div>',
      '      </div>',
      '      <div class="row">',
      '        <div class="col-xs-12">',
      '          <checkbox class="shuffle-choices" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="container-fluid">',
      '      <div class="row">',
      '        <div class="col-xs-12">',
      '          <div feedback-panel>',
      '            <div feedback-selector',
      '                fb-sel-label="If correct, show"',
      '                fb-sel-class="correct"',
      '                fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '                fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '                fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '            </div>',
      '            <div feedback-selector',
      '                fb-sel-label="If partially correct, show"',
      '                fb-sel-class="partial"',
      '                fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '                fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '                fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '            </div>',
      '            <div feedback-selector',
      '                fb-sel-label="If incorrect, show"',
      '                fb-sel-class="incorrect"',
      '                fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '                fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '                fb-sel-default-feedback="{{defaultIncorrectFeedback}}">' +
      '            </div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>'
    ].join('\n');

    var scoringOptions = [
      '    <div class="container-fluid">',
      '      <div class="row">',
      '        <div class="col-xs-12">',
                 ChoiceTemplates.scoring({maxNumberOfPartialScores: "sumCorrectResponses() - 1"}),
      '        </div>',
      '      </div>',
      '    </div>'
    ].join('\n');

    var displayOptions = [
      '    <div class="container-fluid">',
      '      <div class="row">',
      '        <div class="col-xs-12">',
      '          <form class="form-horizontal" role="form">',
      '            <div class="config-form-row">',
      '              <div class="col-sm-5" ng-show="fullModel.model.config.choiceAreaHasLabel">',
      '                <input type="text" class="form-control" ng-model="fullModel.model.config.choiceAreaLabel" />',
      '              </div>',
      '            </div>',
      '            <div class="config-form-row"><label>Layout</label></div>',
      '            <div class="config-form-row layout-config">',
      '              <div class="col-sm-2">',
      '                <radio id="vertical" value="vertical"',
      '                    ng-model="fullModel.model.config.choiceAreaLayout">Vertical</radio>',
      '              </div>',
      '              <div class="col-sm-2">',
      '                <radio id="horizontal" value="horizontal"',
      '                    ng-model="fullModel.model.config.choiceAreaLayout">Horizontal</radio>',
      '              </div>',
      '            </div>',
      '            <div class="config-form-row">',
      '              <label>Choice area is </label>',
      '              <select class="form-control choice-area" ng-model="fullModel.model.config.choiceAreaPosition"',
      '                  ng-options="c for c in [\'above\', \'below\']">',
      '              </select>',
      '              <label>answer blanks</label>',
      '            </div>',
      '          </form>',
      '        </div>',
      '      </div>',
      '    </div>'
    ].join('\n');

    var template = [
      '<div class="drag-and-drop-config-panel drag-and-drop-inline-config-panel" choice-template-controller="">',
      '  <div navigator-panel="Design">',
           designOptions,
      '  </div>',
      '  <div navigator-panel="Scoring">',
           scoringOptions,
      '  </div>',
      '  <div navigator-panel="Display">',
           displayOptions,
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
        $scope.correctMap = {};

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
              if (key === 'cat_1') {
                _.each(val, function(cid) {
                  $scope.correctMap[cid] = true;
                });
              }
              $scope.correctAnswers[key] = _.map(val, function(choiceId) {
                return choiceById(choiceId);
              });
            });

            $scope.componentState = "initialized";
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

        $scope.$watch('correctMap', function(n) {
          if (n) {
            var res = [];
            for (var key in $scope.correctMap) {
              if ($scope.correctMap[key]) {
                res.push(key);
              }
            }
            $scope.fullModel.correctResponse.cat_1 = res;
          }
        }, true);

        $scope.$watch('correctAnswers', function(n) {
          if (n) {
            _.each($scope.correctAnswers, function(val, key) {
              if (key !== 'cat_1') {
                $scope.fullModel.correctResponse[key] = _.pluck(val, 'id');
              }
            });
          }
        }, true);

        $scope.$emit('registerConfigPanel', attrs.id, $scope.containerBridge);

        $scope.removeQuestion = function(c) {
          $scope.model.choices = _.filter($scope.model.choices, function(existing) {
            return existing !== c;
          });
        };

        $scope.addChoice = function() {
          $scope.model.choices.push({
            id: "choice_" + $scope.model.choices.length,
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
          delete $scope.fullModel.correctResponse[answerArea.id];

        };

        $scope.addAnswerArea = function() {
          var idx = $scope.model.answerAreas.length + 1;
          $scope.model.answerAreas.push({
            id: "aa_" + idx,
            textBefore: "",
            textAfter: ""
          });
        };

      }
    };
  }
];

var bootstrapMultiselect = [
  function() {
    return function(scope, element, attrs) {
      element.multiselect();
      var btn = element.next().find('button');
      btn.dropdown();

      scope.$watch(function () {
        return element[0].length;
      }, function () {
        element.multiselect('rebuild');
      });

      scope.$watch(attrs.ngModel, function () {
        element.multiselect('refresh');
      });

      if (attrs.ngOptions && _.isString(attrs.ngOptions)) {
        var model = attrs.ngOptions.split("in ")[1];
        scope.$watch(model, function(n) {
          element.multiselect('rebuild');
        }, true);
      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: 'bootstrapMultiselect',
    directive: bootstrapMultiselect
  }

];
