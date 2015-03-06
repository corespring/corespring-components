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
        console.log("renderAnswerArea", element.find(targetSelector));
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
          scope.seeSolutionExpanded = false;
          scope.local = {};

          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
          _.forEach(dataAndSession.data.model.answerAreas, function(area) {
            if (!_.isArray(scope.landingPlaceChoices[area.id])) {
              scope.landingPlaceChoices[area.id] = [];
            }
          });

          // resetChoices also initializes scope.local.choices
          // and scope.originalChoices
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
          $log.debug("[DnD-inline-v201] setResponse: ", response);
          scope.response = response;
          scope.correctResponse = response.correctness === 'incorrect' ? response.correctResponse : null;

          // Populate solutionScope with the correct response
          var solutionScope = $rootScope.$new();
          solutionScope.landingPlaceChoices = {};
          solutionScope.model = scope.model;
          solutionScope.canEdit = function(){return false;};
          solutionScope.classForChoice = function(){return "";};
          solutionScope.cleanLabel = scope.cleanLabel;
          _.each(scope.correctResponse, function(v, k) {
            solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return scope.choiceForId(r);
            });
          });

          renderAnswerArea(".correct-answer-area-holder", solutionScope);
        },

        reset: function() {
          scope.resetChoices(scope.rawModel);

          scope.seeSolutionExpanded = false;
          scope.correctResponse = undefined;
          scope.response = undefined;
        }
      });

      scope.classForChoice = function(answerAreaId, choice, index) {
        if(scope.response) {
          var result;
          if (scope.response.feedbackPerChoice &&
            _.isArray(scope.response.feedbackPerChoice[answerAreaId])) {
            result = scope.response.feedbackPerChoice[answerAreaId][index];
          }
          return result === 'correct' ? 'correct' : 'incorrect';
        } else {
          return scope.canEdit() ? 'editable' : undefined;
        }
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

      scope.cleanLabel = (function() {
        var wiggiCleanerRe = new RegExp(String.fromCharCode(8203), 'g');
        return function(choice) {
          return (choice.label || '').replace(wiggiCleanerRe, '');
        };
      })();

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
        '    <span class="choice-content" ng-bind-html-unsafe="cleanLabel(choice)"></span>',
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
      '  <div class="see-solution" see-answer-panel="" see-answer-panel-expanded="seeSolutionExpanded" ng-show="correctResponse">',
      '    <div class="correct-answer-area-holder"></div>',
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

          function mouseIsOverElement(event){
            var position = el.offset();
            var x = event.pageX - position.left;
            var y = event.pageY - position.top;
            return x >= 0 && x <= el.width() && y >= 0 && y <= el.height();
          }

          var isOut = false;
          var sortableSize;

          //the sortable changes the height of its dropping area
          //so that the currently dragged item fits in.
          //The calculation does not seem to work properly in our case.
          //When you drag a choice with just a word in it, the area is
          //almost twice as high as necessary.
          //The workaround safes the size of the original item and
          //sets the placeholder to the same size. Also the placeholder
          //is filled with some content, bc. otherwise we see the height
          //changing a few pixels too

          scope.targetSortableOptions = function() {
            return {
              connectWith: "." + renderScope.dragAndDropScopeId,
              disabled: !renderScope.canEdit(),
              tolerance: 'pointer',
              helper: function(event,ui){
                sortableSize = {width:ui.width(),height:ui.height()};
                return ui;
              },
              start: function(event, ui) {
                isOut = false;
                renderScope.targetDragging = true;
                console.log("start",sortableSize);
                ui.placeholder.html('&nbsp;');
                ui.placeholder.width(sortableSize.width);
                ui.placeholder.height(sortableSize.height);
              },
              stop: function(event, ui) {
                renderScope.targetDragging = false;
                if (isOut) {
                  scope.removeChoice(ui.item.sortable.index);
                }
              },
              receive: function(event,ui){
                isOut = false;
              },
              remove: function(event,ui){
                isOut = false;
              },
              beforeStop: function(event, ui) {
                isOut = !mouseIsOverElement(event);
              },
              activate: function(event,ui){
                el.addClass('answer-area-inline-active');
              },
              deactivate: function(event,ui){
                el.removeClass('answer-area-inline-active');
              }

            };
          };

          scope.droppableOptions = {
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
            return renderScope.classForChoice(scope.answerAreaId, choice, index);
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
        '    ng-class="renderScope.dragAndDropScopeId"',
        '    data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
        '    <div class="selected-choice" ng-class="classForChoice(choice, $index)" data-choice-id="{{choice.id}}" ',
        '      ng-repeat="choice in renderScope.landingPlaceChoices[answerAreaId] track by trackId(choice)">',
        '      <div class="selected-choice-content">',
        '        <div class="html-wrapper" ng-bind-html-unsafe="renderScope.cleanLabel(choice)"></div>',
        '        <div class="remove-choice"><i ng-click="removeChoice($index)" class="fa fa-close"></i></div>',
        '      </div>',
        '      <div class="circle">',
        '        <i class="fa" ng-class="classForCorrectness(choice, $index)"></i>',
        '      </div>',
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