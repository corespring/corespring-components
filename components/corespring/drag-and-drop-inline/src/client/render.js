/* global exports */
var main = [
  'DragAndDropTemplates',
  'MathJaxService',
  '$compile',
  '$log',
  '$modal',
  '$rootScope',
  function(DragAndDropTemplates,
    MathJaxService,
    $compile,
    $log,
    $modal,
    $rootScope) {

    "use strict";

    function link(scope, element, attrs) {

      scope.dragAndDropScopeId = "scope-" + Math.floor(Math.random() * 1000);

      function renderMath() {
        MathJaxService.parseDomForMath(10, element[0]);
      }

      function throttle(fn) {
        return _.throttle(fn, 500, {
          trailing: true,
          leading: false
        });
      }

      function withoutPlacedChoices() {

        /**
         * Remove the choices which have moveOnDrag true and which are placed
         */
        function findVisibleChoices() {
          return _.filter(scope.originalChoices, function(choice) {
            if (!choice.moveOnDrag) {
              return true;
            }
            var landingPlaceWithChoice = _.find(scope.landingPlaceChoices, function(c) {
              return _.pluck(c, 'id').indexOf(choice.id) >= 0;
            });
            return _.isUndefined(landingPlaceWithChoice);
          });
        }

        /**
         * Map the choices to the current choices so that
         * the $$hashKey is retained. This is to avoid
         * unnecessary updates of the repeater
         */
        function mapToCurrentChoices(visibleChoices) {
          return _.map(visibleChoices, function(choice) {
            var matchingChoice = _.find(scope.local.choices, {
              id: choice.id
            });
            if (!matchingChoice) {
              matchingChoice = _.clone(choice);
              delete choice.$$hashKey;
            }
            return matchingChoice;
          });
        }

        var visibleChoices = findVisibleChoices();
        var returnValue = mapToCurrentChoices(visibleChoices);
        return returnValue;
      }

      //we throttle bc. when multiple calls to renderAnswerArea are
      //made rapidly, the rendering breaks, eg. in the regression test rig
      var renderAnswerArea = throttle(function(targetSelector, scope) {
        var $holder = element.find(targetSelector);

        //if the answer area exists already
        if ($holder[0].childNodes.length) {
          //get the scope of it
          var existingScope = angular.element($holder[0].childNodes[0]).scope();
          //and destroy the scope, if it is different from the one we are going to use
          if (existingScope !== scope) {
            existingScope.$destroy();
          }
        }
        var answerHtml = scope.model.answerAreaXhtml;
        var answerArea = '<div scope-forwarder-csdndi="">' + answerHtml + '</div>';
        var $answerArea = $holder.html(answerArea);
        $compile($answerArea)(scope);
        renderMath();
      });


      scope.cleanChoiceForId = function(id) {
        var choice = scope.choiceForId(id);
        choice = _.clone(choice);
        delete choice.$$hashKey;
        return choice;
      };

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
              scope.landingPlaceChoices[k] = _.map(v, scope.cleanChoiceForId);
            });

            // Remove choices that are in landing place area
            scope.local.choices = withoutPlacedChoices();
          }

          scope.undoModel.init();

          renderAnswerArea(".answer-area-holder", scope.$new());
        },

        getSession: function() {
          var numberOfAnswers = 0;
          var answer = {};
          _.each(scope.landingPlaceChoices, function(v, k) {
            if (k) {
              answer[k] = _.pluck(v, 'id');
              numberOfAnswers += answer[k].length;
            }
          });
          return {
            answers: answer,
            numberOfAnswers: numberOfAnswers
          };
        },

        isAnswerEmpty: function(){
          return this.getSession().numberOfAnswers === 0;
        },

        setResponse: function(response) {
          $log.debug("[DnD-inline] setResponse: ", response);
          scope.response = response;
          scope.correctResponse = response.correctness === 'incorrect' ? response.correctResponse : null;

          // Populate solutionScope with the correct response
          var solutionScope = $rootScope.$new();
          solutionScope.landingPlaceChoices = {};
          solutionScope.model = scope.model;
          solutionScope.canEdit = function() {
            return false;
          };
          solutionScope.classForChoice = function() {
            return "";
          };
          solutionScope.shouldShowNoAnswersWarning = function(){
            return false;
          };
          solutionScope.cleanLabel = scope.cleanLabel;
          _.each(scope.correctResponse, function(v, k) {
            solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return scope.cleanChoiceForId(r);
            });
          });

          renderAnswerArea(".correct-answer-area-holder", solutionScope);
        },

        reset: function() {
          scope.resetChoices(scope.rawModel);

          scope.seeSolutionExpanded = false;
          scope.correctResponse = undefined;
          scope.response = undefined;

          scope.undoModel.init();
        }
      });

      scope.classForChoice = function(answerAreaId, index) {
        if (scope.response) {
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

      scope.draggableJqueryOptions = function(choice) {
        return {
          revert: 'invalid',
          scope: scope.dragAndDropScopeId
        };
      };

      //called by dnd engine, when landingPlaceChoices has changed
      scope.answerChangeCallback = function() {
        scope.local.choices = withoutPlacedChoices();
      };

      scope.canEdit = function() {
        return scope.editable && !scope.response;
      };

      scope.cleanLabel = (function() {
        var wiggiCleanerRe = new RegExp(String.fromCharCode(8203), 'g');
        return function(choice) {
          return (choice.label || '').replace(wiggiCleanerRe, '');
        };
      })();

      scope.$on("get-scope", function(event, callback) {
        callback(scope);
      });

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
    }

    function template() {
      function choiceArea() {
        return [
          '<div class="choices-holder" >',
          '  <div class="label-holder" ng-show="model.config.choiceAreaLabel">',
          '    <div class="choiceAreaLabel" ng-bind-html-unsafe="model.config.choiceAreaLabel"></div>',
          '  </div>',
          '  <div ng-repeat="choice in local.choices"',
          '    class="choice" ',
          '    ng-class="{editable:canEdit()}"',
          '    data-drag="canEdit()"',
          '    data-jqyoui-options="draggableJqueryOptions(choice)"',
          '    ng-model="local.choices"',
          '    jqyoui-draggable="draggableOptions(choice)"',
          '    data-choice-id="{{choice.id}}">',
          '    <span class="choice-content" ng-bind-html-unsafe="cleanLabel(choice)"></span>',
          '  </div>',
          '</div>'
        ].join('');
      }

      return [
        '<div class="render-csdndi" drag-and-drop-controller>',
        '  <div ng-show="canEdit()" class="undo-start-over pull-right">',
        '    <span cs-undo-button-with-model></span>',
        '    <span cs-start-over-button-with-model></span>',
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
    }

    return {
      link: link,
      scope: false,
      restrict: 'AE',
      replace: true,
      template: template()
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

var answerAreaInline = ['$interval',
  function($interval) {
    "use strict";
    return {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: function(scope, el, attr) {
        scope.answerAreaId = attr.id;

        scope.$emit("get-scope", function(renderScope) {
          scope.renderScope = renderScope;

          function mouseIsOverElement(event) {
            var position = el.offset();
            var x = event.pageX - position.left;
            var y = event.pageY - position.top;
            return x >= 0 && x <= el.width() && y >= 0 && y <= el.height();
          }

          var isOut = false;
          var sortableSize;
          var pollingHandle;

          function startPollingHoverState(placeholder) {
            var lastPlaceholderParent = placeholder.parents('.answer-area-inline');
            lastPlaceholderParent.addClass('answer-area-inline-hover');
            pollingHandle = $interval(function() {
              var newParent = placeholder.parents('.answer-area-inline');
              if (newParent !== lastPlaceholderParent) {
                lastPlaceholderParent.removeClass('answer-area-inline-hover');
                newParent.addClass('answer-area-inline-hover');
                lastPlaceholderParent = newParent;
              }
            }, 100);
          }

          function stopPollingHoverState() {
            if (!_.isUndefined(pollingHandle)) {
              $interval.cancel(pollingHandle);
              pollingHandle = undefined;
            }
          }

          function initPlaceholder(placeholder) {
            placeholder.html('&nbsp;');
            placeholder.width(sortableSize.width);
            placeholder.height(sortableSize.height);
          }

          //the sortable changes the height of its dropping area
          //so that the currently dragged item fits in.
          //The calculation does not seem to work properly in our case.
          //When you drag a choice with just a word in it, the area is
          //almost twice as high as necessary.
          //The workaround safes the size of the original item and
          //sets the placeholder to the same size. Also the placeholder
          //is filled with &nbsp;, bc. otherwise its height nyit is
          //changing a few pixels too

          scope.targetSortableOptions = function() {
            return {
              connectWith: "." + renderScope.dragAndDropScopeId,
              disabled: !renderScope.canEdit(),
              tolerance: 'pointer',
              helper: function(event, ui) {
                sortableSize = {
                  width: ui.width(),
                  height: ui.height()
                };
                return ui;
              },
              start: function(event, ui) {
                isOut = false;
                renderScope.targetDragging = true;
                initPlaceholder(ui.placeholder);
                startPollingHoverState(ui.placeholder);
              },
              stop: function(event, ui) {
                renderScope.targetDragging = false;
                stopPollingHoverState();

                if (isOut) {
                  scope.removeChoice(ui.item.sortable.index);
                }
              },
              receive: function(event, ui) {
                isOut = false;
              },
              remove: function(event, ui) {
                isOut = false;
              },
              beforeStop: function(event, ui) {
                isOut = !mouseIsOverElement(event);
              },
              activate: function(event, ui) {
                el.addClass('answer-area-inline-active');
              },
              deactivate: function(event, ui) {
                el.removeClass('answer-area-inline-active');
                el.removeClass('answer-area-inline-hover');
              }
            };
          };

          /**
           * The dropped item has a $$hashKey property from the repeater in
           * the choices area. To avoid the "duplicate tracking id" error
           * this property is removed here. The repeater in the answer area
           * will set a new value for it.
           */
          scope.removeHashKeyFromDroppedItem = function() {
            var items = scope.renderScope.landingPlaceChoices[scope.answerAreaId];
            var lastItem = _.cloneDeep(_.last(items));
            delete lastItem.$$hashKey;
            items[items.length - 1] = lastItem;
          };

          scope.droppableOptions = {
            onDrop: 'removeHashKeyFromDroppedItem'
          };

          scope.droppableJqueryOptions = {
            activeClass: 'answer-area-inline-active',
            distance: 5,
            hoverClass: 'answer-area-inline-hover',
            scope: renderScope.dragAndDropScopeId,
            tolerance: 'pointer'
          };

          scope.classForChoice = function(index) {
            return renderScope.classForChoice(scope.answerAreaId, index);
          };

          scope.classForCorrectness = function(index) {
            var choiceClass = scope.classForChoice(index);
            if (choiceClass === "correct") {
              return 'fa-check-circle';
            } else if (choiceClass === "incorrect") {
              return 'fa-times-circle';
            }
          };

          scope.removeChoice = function(index) {
            scope.renderScope.landingPlaceChoices[scope.answerAreaId].splice(index, 1);
          };

          scope.shouldShowNoAnswersWarning = function() {
            return renderScope.response && renderScope.landingPlaceChoices[scope.answerAreaId].length === 0;
          };

          scope.$on("$destroy", function() {
            stopPollingHoverState();
          });

        });
      },
      template: [
        '<div class="answer-area-inline" ng-switch="shouldShowNoAnswersWarning()">',
        '  <div ui-sortable="targetSortableOptions()"',
        '    ng-switch-default',
        '    ng-model="renderScope.landingPlaceChoices[answerAreaId]"',
        '    ng-class="renderScope.dragAndDropScopeId"',
        '    data-drop="true" ',
        '    jqyoui-droppable="droppableOptions" ',
        '    data-jqyoui-options="droppableJqueryOptions">',
        '    <div class="selected-choice" ng-class="classForChoice($index)" data-choice-id="{{choice.id}}" ',
        '      ng-repeat="choice in renderScope.landingPlaceChoices[answerAreaId]">',
        '      <div class="selected-choice-content">',
        '        <div class="html-wrapper" ng-bind-html-unsafe="renderScope.cleanLabel(choice)"></div>',
        '      </div>',
        '      <div class="circle">',
        '        <i class="fa" ng-class="classForCorrectness($index)"></i>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="empty-answer-area-warning" ng-switch-when="true"><i class="fa fa-exclamation-triangle"></i></div>',
        '</div>'
      ].join("\n")
    };
  }
];
exports.framework = 'angular';
exports.directives = [{
  directive: main
}, {
  name: 'scopeForwarderCsdndi',
  directive: scopeForwarder
}, {
  name: 'answerAreaInlineCsdndi',
  directive: answerAreaInline
}];