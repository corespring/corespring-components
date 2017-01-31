/* global exports */
var main = [
  '$compile',
  '$log',
  '$modal',
  '$rootScope',
  'DragAndDropTemplates',
  'MathJaxService',
  'Msgr',
  function(
    $compile,
    $log,
    $modal,
    $rootScope,
    DragAndDropTemplates,
    MathJaxService,
    Msgr
  ) {

    "use strict";

    /**
     * What is the "renderScope" and "scope-forwarder" business about?
     * The interaction uses the answerAreaInline directive to render the
     * landing area for choices. These landing areas are compiled/rendered
     * from a user defineable xhtml string. (see doRenderAnswerArea)
     * These answerArea components cannot be initialized via bindings
     * because we don't want to add this extra code to the xhtml.
     *
     * To give these components access to various properties of the main
     * component, we are passing the scope of the main component to them.
     * I wonder, if there is a more ng-conform solution to that.
     *
     * Things that are currently shared by answerAreas are
     * scope.canEdit()
     * scope.classForChoice()
     * scope.cleanLabel()
     * scope.dragAndDropScopeId
     * scope.landingPlaceChoices
     */

    function link(scope, element, attrs) {

      scope.$watch('seeSolutionExpanded', function() {
        console.log('scope.seeSolutionExpanded', scope.seeSolutionExpanded);
        scope.$broadcast('setVisible', scope.seeSolutionExpanded ? 1 : 0);
      });

      //we throttle bc. when multiple calls to renderAnswerArea are
      //made rapidly, the rendering breaks, eg. in the regression test rig
      var renderAnswerArea = throttle(doRenderAnswerArea);
      var renderRegularAnswerArea = throttle(doRenderAnswerArea.bind(this, '.answer-area-holder'));
      var renderCorrectAnswerArea = throttle(doRenderAnswerArea.bind(this, '.correct-answer-area-holder'));

      scope.dragAndDropScopeId = "scope-" + Math.floor(Math.random() * 1000);
      scope.draggableJqueryOptions = {
        revert: 'invalid',
        scope: scope.dragAndDropScopeId
      };

      scope.canEdit = canEdit;
      scope.classForChoice = classForChoice;
      scope.cleanChoiceForId = cleanChoiceForId;
      scope.cleanLabel = makeCleanLabelFunction();
      scope.draggableOptionsWithKeep = draggableOptionsWithKeep;
      scope.isPlaceable = isPlaceable;
      scope.onDrag = onDrag;
      scope.onStop = onStop;


      _.extend(scope.containerBridge, {
        getSession: getSession,
        isAnswerEmpty: isAnswerEmpty,
        reset: reset,
        setDataAndSession: setDataAndSession,
        setInstructorData: setInstructorData,
        setMode: setMode,
        setResponse: setResponse,
        setPlayerSkin: function(skin) {
          scope.iconSet = skin.iconSet;
        }
      });

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

      //---------------------

      function setDataAndSession(dataAndSession) {
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
        }

        scope.initUndo();
        renderRegularAnswerArea(scope.$new());
      }

      function getSession() {
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
      }

      function setMode(mode) {
        scope.mode = mode;
        if (mode.trim() === 'gather') {
          resetSolution();
        }
      }

      function isAnswerEmpty() {
        return getSession().numberOfAnswers === 0;
      }

      function setInstructorData(data) {
        $log.debug("[DnD-inline] setInstructorData: ", data);
        scope.instructorData = data;
        _.each(data.correctResponse, function(v, k) {
          scope.landingPlaceChoices[k] = _.map(v, scope.cleanChoiceForId);
        });
        var feedback = _.cloneDeep(data.correctResponse);
        for (var f in feedback) {
          feedback[f] = _.map(feedback[f], function() {
            return "correct";
          });
        }
        scope.response = {
          feedbackPerChoice: feedback
        };
      }

      function setResponse(response) {
        $log.debug("[DnD-inline] setResponse: ", response);
        console.log("[DnD-inline] setResponse: ", response);
        scope.response = _.isEmpty(response) ? undefined : response;
        console.log('response', response);
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
        solutionScope.shouldShowNoAnswersWarning = function() {
          return false;
        };
        solutionScope.cleanLabel = scope.cleanLabel;
        _.each(scope.correctResponse, function(v, k) {
          solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
            return scope.cleanChoiceForId(r);
          });
        });

        renderCorrectAnswerArea(solutionScope);
      }

      function reset() {
        scope.resetChoices(scope.rawModel);
        resetSolution();
        scope.initUndo();
      }

      function resetSolution() {
        console.log('called resetSolution');
        scope.response = undefined;
        scope.correctResponse = undefined;
        scope.instructorData = undefined;
        scope.seeSolutionExpanded = false;
        scope.$broadcast('setVisible', 0);
      }

      function doRenderAnswerArea(targetSelector, scope) {
        console.log('doRenderAnswerArea', targetSelector, scope);
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
        //the scope forwarder passed the scope of
        //the main component to the inlined answer areas
        var answerArea = '<div scope-forwarder-csdndi="">' + answerHtml + '</div>';
        var $answerArea = $holder.html(answerArea);
        $compile($answerArea)(scope);
        renderMath();

        setTimeout(function(){
            console.log('>>', $answerArea[0]);
        }, 2000);
      }

      function draggableOptionsWithKeep(choice) {
        return {
          revert: 'invalid',
          placeholder: 'keep',
          index: _.indexOf(scope.local.choices, choice),
          onDrag: 'onDrag',
          onStart: 'onStart',
          onStop: 'onStop'
        };
      }

      function cleanChoiceForId(id) {
        var choice = scope.choiceForId(id);
        choice = _.clone(choice);
        delete choice.$$hashKey;
        return choice;
      }

      function classForChoice(answerAreaId, index) {
        if (!_.isEmpty(scope.response)) {
          var feedback = getFeedbackForChoice(answerAreaId, index);
          return feedback === 'correct' ? 'correct' : 'incorrect';
        }
        if (scope.canEdit()) {
          return 'editable';
        }
        return undefined;

        //------------------------------

        function getFeedbackForChoice(answerAreaId, index) {
          var result;
          if (scope.response && scope.response.feedbackPerChoice &&
            _.isArray(scope.response.feedbackPerChoice[answerAreaId])) {
            result = scope.response.feedbackPerChoice[answerAreaId][index];
          }
          return result;
        }
      }

      function onStop() {
        scope.isDragging = false;
        Msgr.send("autoScrollStop");
      }

      function onDrag(event, ui){
        Msgr.send("autoScroll", {x: event.clientX, y: event.clientY});
      }

      function canEdit() {
        return scope.editable && !scope.response;
      }

      function isPlaceable(choice) {
        return choice.moveOnDrag === false || choice.moveOnDrag === undefined || !isPlaced(choice);
      }

      function isPlaced(choice) {
        return _.some(scope.landingPlaceChoices, function(c) {
          return _.pluck(c, 'id').indexOf(choice.id) >= 0;
        });
      }

      function makeCleanLabelFunction() {
        var wiggiCleanerRe = new RegExp(String.fromCharCode(8203), 'g');
        return function(choice) {
          return (choice.label || '').replace(wiggiCleanerRe, '');
        };
      }

      function renderMath() {
        MathJaxService.parseDomForMath(10, element[0]);
      }

      function throttle(fn) {
        return _.throttle(fn, 500, {
          trailing: false,
          leading: true
        });
      }

    }

    function template() {
      function choiceArea() {
        return [
          '<div class="choices-holder">',
          '  <div class="label-holder" ng-show="model.config.choiceAreaLabel">',
          '    <div class="choiceAreaLabel" ng-bind-html-unsafe="model.config.choiceAreaLabel"></div>',
          '  </div>',
          '  <div class="choice" ',
          '     data-choice-id="{{choice.id}}"',
          '     data-drag="canEdit() && isPlaceable(choice)"',
          '     data-jqyoui-options="draggableJqueryOptions"',
          '     jqyoui-draggable="draggableOptionsWithKeep(choice)"',
          '     ng-class="{editable:canEdit(), placed:!isPlaceable(choice)}"',
          '     ng-model="local.choices"',
          '     ng-repeat="choice in local.choices">',
          '    <span class="choice-content" ',
          '       ng-bind-html-unsafe="cleanLabel(choice)"></span>',
          '  </div>',
          '</div>'
        ].join('');
      }

      return [
        '<div class="render-csdndi {{mode}}" drag-and-drop-controller>',
        '  <div class="undo-start-over text-center" ng-show="canEdit()" >',
        '    <span cs-undo-button-with-model></span>',
        '    <span cs-start-over-button-with-model></span>',
        '  </div>',
        '  <correct-answer-toggle visible="response.correctResponse && response.correctness !== \'correct\'"',
        '      toggle="seeSolutionExpanded"></correct-answer-toggle>',
        '  <div class="clearfix"></div>',
        '  <div ng-if="model.config.choiceAreaPosition != \'below\'">',
             choiceArea(),
        '  </div>',
        '  <response-wrapper width="100%">',
        '    <div class="answer-area-holder" class="{{response.correctClass}}"></div>',
        '    <div class="correct-answer-area-holder"></div>',
        '  </response-wrapper>',
        '  <div ng-if="model.config.choiceAreaPosition == \'below\'">',
             choiceArea(),
        '  </div>',
        '  <div class="clearfix"></div>',
        '  <div ng-if="response.feedback && !seeSolutionExpanded">',
        '    <div icon-set="{{iconSet}}" feedback="response.feedback" correct-class="{{response.correctClass}}"></div>',
        '  </div>',
        '</div>'
      ].join('');
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
  }];

var answerAreaInline = [
  '$interval',
  function($interval) {
    "use strict";
    return {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, el, attr) {
      scope.answerAreaId = attr.id;

      scope.$emit("get-scope", initWithRenderScope);

      //--------------------------

      function initWithRenderScope(renderScope) {

        var isOut = false;
        var sortableSize;
        var pollingHandle;

        scope.renderScope = renderScope;

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

        scope.classForChoice = classForChoice;
        scope.removeChoice = removeChoice;
        scope.removeHashKeyFromDroppedItem = removeHashKeyFromDroppedItem;
        scope.shouldShowNoAnswersWarning = shouldShowNoAnswersWarning;
        scope.targetSortableOptions = targetSortableOptions;
        scope.$on("$destroy", onDestroy);

        //-------------------------------------------

        function mouseIsOverElement(event) {
          var position = el.offset();
          var x = event.pageX - position.left;
          var y = event.pageY - position.top;
          return x >= 0 && x <= el.width() && y >= 0 && y <= el.height();
        }

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
        function targetSortableOptions() {
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
        }

        /**
         * The dropped item has a $$hashKey property from the repeater in
         * the choices area. To avoid the "duplicate tracking id" error
         * this property is removed here. The repeater in the answer area
         * will set a new value for it.
         */
        function removeHashKeyFromDroppedItem() {
          var items = renderScope.landingPlaceChoices[scope.answerAreaId];
          var lastItem = _.cloneDeep(_.last(items));
          delete lastItem.$$hashKey;
          items[items.length - 1] = lastItem;
        }

        function classForChoice(index) {
          return renderScope.classForChoice(scope.answerAreaId, index);
        }

        function removeChoice(index) {
          renderScope.landingPlaceChoices[scope.answerAreaId].splice(index, 1);
        }

        function shouldShowNoAnswersWarning() {
          return renderScope.response && renderScope.landingPlaceChoices[scope.answerAreaId].length === 0;
        }

        function onDestroy() {
          console.log("answerAreaInline destroy");
          stopPollingHoverState();
        }

      }
    }

    function template() {
      return [
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
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n");
    }
}];

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
