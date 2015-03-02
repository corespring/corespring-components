/* global exports */
var main = [
  'DragAndDropTemplates',
  'MathJaxService',
  '$compile',
  '$log',
  '$modal',
  '$rootScope',
  '$timeout',
  function(DragAndDropTemplates,
    MathJaxService,
    $compile,
    $log,
    $modal,
    $rootScope,
    $timeout) {

    "use strict";

    function link(scope, element, attrs) {

      scope.dragAndDropScopeId = "scope-" + Math.floor(Math.random() * 1000);

      function renderMath() {
        MathJaxService.parseDomForMath(10, element[0]);
      }

      function answerAreaTemplate(attributes) {
        attributes = (attributes ? ' ' + attributes : '');
        var answerHtml = scope.model.answerAreaXhtml;
        var answerArea = '<div scope-forwarder-csdndi-v201=""' + attributes + '>' + answerHtml + '</div>';
        return answerArea;
      }

      function withoutPlacedChoices(originalChoices) {
        return _.filter(originalChoices, function(choice) {
          if (!choice.moveOnDrag) {
            return true;
          }
          var landingPlaceWithChoice = _.find(scope.landingPlaceChoices, function(c) {
            return _.pluck(c, 'id').indexOf(choice.id) >= 0;
          });
          return _.isUndefined(landingPlaceWithChoice);
        });
      }

      function renderAnswerArea(targetSelector, scope) {
        var $answerArea = element.find(targetSelector).html(answerAreaTemplate());
        $timeout(function() {
          $compile($answerArea)(scope);
          renderMath();
        });
      }

      _.extend(scope.containerBridge, {
        setDataAndSession: function(dataAndSession) {
          $log.debug("[DnD-inline] setDataAndSession: ", dataAndSession);

          scope.session = dataAndSession.session || {};
          scope.rawModel = dataAndSession.data.model;
          scope.editable = true;
          scope.local = {};

          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
          _.forEach(dataAndSession.data.model.answerAreas, function(area) {
            if (!_.isArray(scope.landingPlaceChoices[area.id])) {
              scope.landingPlaceChoices[area.id] = [];
            }
          });

          scope.resetChoices(scope.rawModel);

          if (dataAndSession.session && dataAndSession.session.answers) {

            // Build up the landing places with the selected choices
            _.each(dataAndSession.session.answers, function(v, k) {
              scope.landingPlaceChoices[k] = _.map(v, scope.choiceForId);
            });

            // Remove choices that are in landing place area
            scope.local.choices = withoutPlacedChoices(scope.originalChoices);
          }

          renderAnswerArea(".answer-area-holder", scope.$new());
        },

        getSession: function() {
          var answer = {};
          _.each(scope.landingPlaceChoices, function(v, k) {
            if (k) {
              answer[k] = _.pluck(v, 'id');
            }
          });
          return {
            answers: answer
          };
        },

        setResponse: function(response) {
          $log.debug("[DnD-inline] setResponse: ", response);
          scope.response = response;
          scope.correctResponse = response.correctness === 'incorrect' ? response.correctResponse : null;

          // Populate solutionScope with the correct response
          var solutionScope = $rootScope.$new();
          solutionScope.landingPlaceChoices = {};
          solutionScope.model = scope.model;
          _.each(scope.correctResponse, function(v, k) {
            solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return scope.choiceForId(r);
            });
          });

          renderAnswerArea(".correct-answer-area-holder", solutionScope);
        },

        reset: function() {
          scope.resetChoices(scope.rawModel);

          scope.correctResponse = undefined;
          scope.response = undefined;
        }
      });

      scope.toggleAnswerVisible = function() {
        scope.correctResponse.answerVisible = !scope.correctResponse.answerVisible;
        renderMath();
      };

      scope.$watch('correctResponse.answerVisible', function(answerVisible) {
        if (answerVisible) {
          $(element).find('.answer-collapse').slideDown(400);
        } else {
          $(element).find('.answer-collapse').slideUp(400);
        }
      });

      scope.classForChoice = function(answerAreaId, choice, index) {
        var defaultClass = scope.canEdit() ? 'editable' : undefined;
        if (!scope.correctResponse) {
          return defaultClass;
        }
        var correctResponse = scope.correctResponse[answerAreaId];
        if (!correctResponse) {
          return defaultClass;
        }

        var result;
        if(scope.response && scope.response.feedbackPerChoice &&
          _.isArray(scope.response.feedbackPerChoice[answerAreaId])){
          result = scope.response.feedbackPerChoice[answerAreaId][index];
        }
        return result === 'correct' ? 'correct' : 'incorrect';
      };

      scope.draggableOptionsWithScope = function(choice) {
        var options = scope.draggableOptions(choice);
        options.scope = scope.dragAndDropScopeId;
        return options;
      };

      scope.answerChangeCallback = function() {
        scope.local.choices = withoutPlacedChoices(scope.originalChoices);
      };

      scope.canEdit = function() {
        return scope.editable && !scope.correctResponse;
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
    }

    function choiceArea() {
      return [
        '<div class="choices-holder" >',
        '  <div class="label-holder" ng-show="model.config.choiceAreaLabel">',
        '    <div class="choiceAreaLabel">{{model.config.choiceAreaLabel}}</div>',
        '  </div>',
        '  <div ng-repeat="choice in local.choices"',
        '    class="choice" ',
        '    ng-class="{editable:canEdit()}"',
        '    data-drag="canEdit()"',
        '    data-jqyoui-options="draggableOptionsWithScope(choice)"',
        '    ng-model="local.choices"',
        '    jqyoui-draggable="draggableOptionsWithScope(choice)"',
        '    data-choice-id="{{choice.id}}">',
        '    <span class="choice-content" ng-bind-html-unsafe="choice.label"></span>',
        '  </div>',
        '</div>'
      ].join('');
    }

    var tmpl = [
      '<div class="render-csdndi-v201" drag-and-drop-controller>',
      '  <div ng-show="canEdit()" class="undo-start-over pull-right">',
      '    <button type="button" class="btn btn-default" ng-click="undo()"><i class="fa fa-undo"></i> Undo</button>',
      '    <button type="button" class="btn btn-default" ng-click="startOver()">Start over</button>',
      '  </div>',
      '  <div class="clearfix"></div>',
      '  <div ng-if="model.config.choiceAreaPosition != \'below\'">', choiceArea(), '</div>',
      '  <div class="answer-area-holder" ng-class="response.correctClass"></div>',
      '  <div ng-if="model.config.choiceAreaPosition == \'below\'">', choiceArea(), '</div>',
      '  <div class="clearfix"></div>',
      '  <div ng-show="feedback" feedback="response.feedback" correct-class="{{response.correctClass}}"></div>',
      '  <div class="see-solution" ng-show="correctResponse">',
      '    <div class="panel panel-default">',
      '      <div class="panel-heading">',
      '        <h4 class="panel-title" ng-click="toggleAnswerVisible()">',
      '          <i class="answerIcon fa fa-eye{{correctResponse.answerVisible ? \'-slash\' : \'\'}}"></i>',
      '          {{correctResponse.answerVisible ? \'Hide Answer\' : \'Show Correct Answer\'}}',
      '        </h4>',
      '      </div>',
      '      <div class="answer-collapse">',
      '        <div class="panel-body correct-answer-area-holder">',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'

    ].join("");

    return {
      link: link,
      scope: false,
      restrict: 'AE',
      replace: true,
      template: tmpl
    };
  }];

var scopeForwarder = [
  function() {
    "use strict";
    return {
      scope: false,
      restrict: 'A',
      replace: true,
      controller: ['$scope', function($scope) {
        $scope.$on("get-scope", function(event, callback) {
          callback($scope);
        });
      }]
    };
  }
];

var answerAreaInline = [
  function() {
    "use strict";
    return {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: function(scope, el, attr) {
        scope.$emit("get-scope", function(renderScope) {
          scope.renderScope = renderScope;
          scope.answerAreaId = attr.id;

          var isOut = false;

          scope.canEdit = function() {
            return renderScope && _.isFunction(renderScope.canEdit) && renderScope.canEdit();
          };

          scope.targetSortableOptions = function() {
            return {
              disabled: scope.canEdit(),
              start: function() {
                renderScope.targetDragging = true;
              },
              stop: function() {
                renderScope.targetDragging = false;
              },
              beforeStop: function(event, ui) {
                if (isOut) {
                  isOut = false;
                  var index = ui.item.sortable.index;
                  ui.item.sortable.cancel();
                  scope.removeChoice(index);
                }
              },
              out: function(event, ui) {
                isOut = true;
              },
              over: function(event, ui) {
                isOut = false;
              }
            };
          };

          scope.droppableOptions = {
            accept: function() {
              return !renderScope.targetDragging;
            },
            activeClass: 'answer-area-inline-active',
            distance: 5,
            hoverClass: 'answer-area-inline-hover',
            scope: renderScope.dragAndDropScopeId,
            tolerance: renderScope.model.config.isRegressionTest ? 'intersect' : 'pointer'
              //regression tests fail when tolerance is pointer
              //but for items which are bigger than the initial answer area, intersect does not feel natural
              //so we pass in a config bool that we can use to choose the tolerance
          };

          scope.trackId = function(choice) {
            return _.uniqueId();
          };
          scope.classForChoice = function(choice, index) {
            return renderScope && renderScope.classForChoice ? renderScope.classForChoice(scope.answerAreaId, choice, index) : undefined;
          };
          scope.classForCorrectness = function(choice, index) {
            var choiceClass = scope.classForChoice(choice, index);
            if (choiceClass === "correct") {
              return 'fa-check-circle';
            } else if (choiceClass === "incorrect") {
              return 'fa-times-circle';
            }
          };
          scope.removeChoice = function(index) {
            scope.renderScope.landingPlaceChoices[scope.answerAreaId].splice(index, 1);
          };

          scope.showWarningIfEmpty = function() {
            return renderScope.correctResponse && renderScope.landingPlaceChoices[scope.answerAreaId].length === 0;
          };

        });
      },
      template: [
        '<div class="answer-area-inline">',
        '  <div ui-sortable="targetSortableOptions()"',
        '    ng-model="renderScope.landingPlaceChoices[answerAreaId]"',
        '    data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
        '    <div class="selected-choice" ng-class="classForChoice(choice, $index)" data-choice-id="{{choice.id}}" ',
        '      ng-repeat="choice in renderScope.landingPlaceChoices[answerAreaId] track by trackId(choice)">',
        '      <div class="selected-choice-content">',
        '        <span class="html-wrapper" ng-bind-html-unsafe="choice.label"></span>',
        '        <span class="remove-choice"><i ng-click="removeChoice($index)" class="fa fa-close"></i></span>',
        '      </div>',
        '      <i class="circle fa" ng-class="classForCorrectness(choice, $index)"></i>',
        '    </div>',
        '  </div>',
        '  <div class="empty-answer-area-warning" ng-if="showWarningIfEmpty()"><i class="fa fa-exclamation-triangle"></i></div>',
        '</div>'
      ].join("\n")
    };
  }
];
exports.framework = 'angular';
exports.directives = [{
  directive: main
}, {
  name: 'scopeForwarderCsdndiV201',
  directive: scopeForwarder
}, {
  name: 'answerAreaInlineCsdndiV201',
  directive: answerAreaInline
}];