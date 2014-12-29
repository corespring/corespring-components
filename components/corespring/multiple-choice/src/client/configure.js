var main = [
  '$log',
  '$timeout',
  '$http',
  'ChoiceTemplates',
  function(
    $log,
    $timeout,
    $http,
    ChoiceTemplates
    ) {

    var choiceTypeDescriptions = {
      radio: 'This option allows students to select one correct answer. You may, however, set more than one answer as correct if you choose.',
      checkbox: 'This option allows students to select more than one correct answer. You may, however, set only one correct answer if you choose.'
    };

    var designTemplate = [
      '<div class="form-horizontal" role="form">',
      '  <div class="container-fluid">',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <p>In multiple choice, students select the best response from a list of options presented. This ',
      '           interaction allows for either one or more correct answers. Setting more than one answer as correct ',
      '           allows for partial credit (see the scoring tab).',
      '        </p>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="container-fluid container-types">',
      '    <div class="row">',
      '      <div class="col-sm-2 col-xs-3">',
      '        <label class="control-label">Choice Type:</label>',
      '      </div>',
      '      <div class="col-sm-3 col-xs-9">',
      '        <select ng-model="model.config.choiceType" class="choice-type form-control">',
      '          <option value="radio">Radio</option>',
      '          <option value="checkbox">Checkbox</option>',
      '        </select>',
      '      </div>',
      '      <div class="col-sm-6 col-xs-12 choice-type-description">{{choiceTypeDescription}}</div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-sm-2 col-xs-3">',
      '        <label class="control-label">Choice Labels:</label>',
      '      </div>',
      '      <div class="col-sm-3 col-xs-9">',
      '        <select class="form-control" ng-model="model.config.choiceLabels">',
      '          <option value="letters">Letters</option>',
      '          <option value="numbers">Numbers</option>',
      '          <option value="none">None</option>',
      '        </select>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="container-fluid container-choices">',
      '    <div class="row">',
      '      <div class="text-right v-offset-2 col-xs-offset-9 col-xs-3">',
      '        Check correct<br/>answer(s)',
      '      </div>',
      '    </div>',
      '    <div class="choice-row" ng-repeat="choice in model.choices">',
      '      <div class="row">',
      '        <div class="col-md-2 col-xs-3 text-center choice-letter">',
      '          <label class="control-label">{{toChar($index)}}</label>',
      '          <i class="fa fa-trash-o fa-lg" title="Delete" data-toggle="tooltip"',
      '              ng-click="removeQuestion(choice)"></i>',
      '        </div>',
      '        <div class="col-md-9 col-xs-8">',
      '          <div mini-wiggi-wiz="" ng-model="choice.label" placeholder="Enter a choice"',
      '              image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
      '              parent-selector=".wiggi-wiz-overlay">',
      '            <edit-pane-toolbar alignment="bottom">',
      '              <div class="btn-group pull-right">',
      '                <button ng-click="closePane()" class="btn btn-sm btn-success" style="float:right;">Done</button>',
      '              </div>',
      '            </edit-pane-toolbar>',
      '          </div>',
      '        </div>',
      '        <div class="col-md-1 col-xs-1 text-center">',
      '          <i class="fa fa-check fa-lg choice-checkbox" ',
      '              ng-class="{checked: correctMap[choice.value]}"',
      '              ng-click="correctMap[choice.value] = !correctMap[choice.value]"></i>',
      '        </div>',
      '      </div>',
      '      <div class="row feedback">',
      '        <div class="col-md-2 col-xs-3">',
      '          <checkbox class="text-center" ng-class="{\'hidden\': !model.config.shuffle}"',
      '              ng-init="remain = choice.shuffle == undefined ? false : !choice.shuffle" ng-model="remain"',
      '              ng-change="choice.shuffle = !remain; resetStash()">Don\'t Shuffle</checkbox>',
      '        </div>',
      '        <div class="col-md-9 col-xs-8">',
      '          <div class="panel panel-default">',
      '            <div class="panel-heading">',
      '              <h4 class="panel-title">',
      '                <a data-toggle="collapse" href="#feedback-{{toChar($index)}}">Feedback</a>',
      '              </h4>',
      '            </div>',
      '            <div id="feedback-{{toChar($index)}}" class="panel-collapse collapse">',
      '              <div class="panel-body">',
      '                <div feedback-selector ng-show="correctMap[choice.value]"',
      '                    fb-sel-label="If this choice is selected, show"',
      '                    fb-sel-class="correct"',
      '                    fb-sel-hide-feedback-options="default"',
      '                    fb-sel-feedback-type="feedback[choice.value].feedbackType"',
      '                    fb-sel-custom-feedback="feedback[choice.value].feedback">',
      '                </div>',
      '                <div feedback-selector ng-show="!correctMap[choice.value]"',
      '                    fb-sel-label="If this choice is selected, show"',
      '                    fb-sel-class="incorrect"',
      '                    fb-sel-hide-feedback-options="default"',
      '                    fb-sel-feedback-type="feedback[choice.value].feedbackType"',
      '                    fb-sel-custom-feedback="feedback[choice.value].feedback">',
      '                </div>',
      '              </div>',
      '            </div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <button type="button" id="add-choice" class="btn btn-default" ',
      '            ng-click="addQuestion()">Add a Choice</button>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <checkbox class="shuffle-choices" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
      '      </div>',
      '    </div>',
      '  </div>',

      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <div summary-feedback-input ng-model="fullModel.comments"></div>',
      '    </div>',
      '  </div>',
      '</div>'
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
            scope.model.config.showCorrectAnswer = scope.model.config.showCorrectAnswer || "separately";
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


        scope.$watch('model', function(model) {
          var choiceType = model.config.choiceType;
          scope.choiceTypeDescription = choiceTypeDescriptions[choiceType];
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

        $timeout(function() {
          $("[data-toggle='tooltip']").tooltip();
        });

      },

      template: [
        '<div class="config-multiple-choice">',
        '  <div navigator-panel="Design">',
              designTemplate,
        '  </div>',
        '  <div navigator-panel="Scoring">',
              ChoiceTemplates.scoring(),
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
