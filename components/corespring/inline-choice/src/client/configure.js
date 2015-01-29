/* global exports */
var main = [
  '$log', 'ChoiceTemplates', 'ServerLogic',
  function($log, ChoiceTemplates, ServerLogic) {

    "use strict";

    var choices = [
      '<div class="form-horizontal choice-config-panel" role="form">',
      '  <div class="container-fluid">',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <p>In Short Answer &mdash; Select Text, students select the best response from a list of options ',
      '           presented. This interaction type may be embedded inline with other content such as text.',
      '        </p>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="container-fluid container-choices">',
      '    <div class="row">',
      '      <div class="text-right v-offset-2 col-xs-offset-9 col-xs-3">',
      '        Check correct<br/>answer',
      '      </div>',
      '    </div>',
      '    <div class="choice-row" ng-repeat="choice in model.choices">',
      '      <div class="row">',
      '        <div class="col-md-1 col-xs-1 text-center">',
      '          <i class="fa fa-trash-o fa-lg" title="Delete" data-tggle="tooltip" ng-click="removeChoice(choice)">',
      '          </i>',
      '        </div>',
      '        <div class="col-md-9 col-xs-8">',
      '          <div mini-wiggi-wiz="" ng-model="choice.label" placeholder="Enter a choice"',
      '              image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
      '              parent-selector=".modal-body">',
      '            <edit-pane-toolbar alignment="bottom">',
      '              <div class="btn-group pull-right">',
      '                <button ng-click="closePane()" class="btn btn-sm btn-success">Done</button>',
      '              </div>',
      '            </edit-pane-toolbar>',
      '          </div>',
      '        </div>',
      '        <div class="col-md-1 col-xs-1 text-center">',
      '          <i class="fa fa-check fa-lg choice-checkbox" ',
      '              ng-class="{checked: isCorrectResponse(choice)}"',
      '              ng-click="toggleCorrectResponse(choice)"></i>',
      '        </div>',
      '      </div>',
      '      <div class="row feedback">',
      '        <div class="bol-md-offset-1 col-xs-offset-1 col-md-9 col-xs-8">',
      '          <div class="panel panel-default">',
      '            <div class="panel-heading">',
      '              <h4 class="panel-title">',
      '                <a data-toggle="collapse" href="#feedback-{{toChar($index)}}">Feedback</a>',
      '              </h4>',
      '            </div>',
      '            <div id="feedback-{{toChar($index)}}" class="panel-collapse collapse">',
      '              <div class="panel-body">',
      '                <div feedback-selector ng-show="isCorrectResponse(choice)"',
      '                    fb-sel-label="If this choice is selected, show"',
      '                    fb-sel-class="correct"',
      '                    fb-sel-hide-feedback-options=""',
      '                    fb-sel-default-feedback="<input type=\'text\' disabled=\'\' value=\'{{defaultFeedback(choice)}}\'/>"',
      '                    fb-sel-feedback-type="feedback[choice.value].feedbackType"',
      '                    fb-sel-custom-feedback="feedback[choice.value].feedback">',
      '                </div>',
      '                <div feedback-selector ng-show="!isCorrectResponse(choice)"',
      '                    fb-sel-label="If this choice is selected, show"',
      '                    fb-sel-class="incorrect"',
      '                    fb-sel-hide-feedback-options=""',
      '                    fb-sel-default-feedback="<input type=\'text\' disabled=\'\' value=\'{{defaultFeedback(choice)}}\'/>"',
      '                    fb-sel-hide-feedback-options="none"',
      '                    fb-sel-feedback-type="feedback[choice.value].feedbackType"',
      '                    fb-sel-custom-feedback="feedback[choice.value].feedback">',
      '                </div>',
      '              </div>',
      '            </div>',
      '          </div>',
      '        </div>',
      '     </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <button type="button" id="add-choice" class="btn btn-default" ',
      '            ng-click="addChoice()">Add a Choice</button>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <checkbox class="shuffle-choices" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');


    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        var server = ServerLogic.load('corespring-inline-choice');
        ChoiceTemplates.extendScope(scope, 'corespring-inline-choice');

        scope.overrideFeatures = [{
          name: 'image',
          action: undefined
        }];

        function isCorrectResponse(choice){
          return scope.fullModel && _.contains(scope.fullModel.correctResponse, choice.value);
        }

        function addCorrectResponse(choice) {
          if(!isCorrectResponse(choice)){
            scope.fullModel.correctResponse.push(choice.value);
          }
        }

        function removeCorrectResponse(choice) {
          _.remove(scope.fullModel.correctResponse, function(n) {
            return n === choice.value;
          });
        }

        scope.isCorrectResponse = isCorrectResponse;

        scope.toggleCorrectResponse = function(choice) {
          if (isCorrectResponse(choice)) {
            removeCorrectResponse(choice);
          } else {
            addCorrectResponse(choice);
          }
        };

        function removeWiggiArtifacts(label) {
          if (!label) {
            return label;
          }

          var re = new RegExp('<span>' + String.fromCharCode(8203) + '<\/span>', 'gi');
          return label.replace(re, '');
        }

        scope.defaultFeedback = function(choice) {
          return server.defaultFeedback(scope.fullModel, choice.value);
        };

        scope.containerBridge = {
          setModel: function(model) {
            server.ensureCorrectResponseIsArray(model);

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
              var feedback = _.find(model.feedback, function(fb) {
                return fb.value === choice.value;
              });
              if (feedback) {
                var _ref = scope.feedback[choice.value];
                feedback.feedback = _ref !== null ? _ref.feedback : undefined;
                feedback.feedbackType = _ref !== null ? _ref.feedbackType : undefined;
              }

              choice.label = removeWiggiArtifacts(choice.label);
            });
            return model;
          }
        };

        scope.$watch('feedback', function(newFeedback) {
          $log.debug("update feedback in components");

          var out = _.makeArray(newFeedback, "value");
          scope.fullModel.feedback = out;

        }, true);

        scope.removeChoice = function(choice) {
          removeCorrectResponse(choice);

          scope.model.choices = _.filter(scope.model.choices, function(cq) {
            return cq.value !== choice.value;
          });

          scope.fullModel.feedback = _.filter(scope.fullModel.feedback, function(fb) {
            return fb.value !== choice.value;
          });

          return null;
        };

        function findFreeChoiceSlot() {
          var slot = 1;
          var ids = _.pluck(scope.model.choices, 'value');
          while (_.contains(ids, "mc_" + slot)) {
            slot++;
          }
          return slot;
        }

        scope.addChoice = function() {
          var uid = "mc_" + findFreeChoiceSlot();

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
        choices,
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];