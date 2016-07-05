/* global console,exports */
var main = ['$compile', '$log', '$modal', '$rootScope', '$timeout',
  function($compile, $log, $modal, $rootScope, $timeout) {

    "use strict";

    function link (scope, element, attrs) {

      var PlacementType = {
        inPlace: 'inPlace',
        placement: 'placement'
      };

      function clearLandingPlaceChoices() {
        _.each(scope.landingPlaceChoices, function(v, k) {
          scope.landingPlaceChoices[k] = {};
        });
      }

      scope.top = {};
      scope.display = {
        showCorrectAnswer: false
      };

      scope.choiceHidden = function(choice) {
        return choice.moveOnDrag && !_.isUndefined(_.find(scope.landingPlaceChoices, function(lc) {
            return lc && lc.id === choice.id;
          }));
      };

      scope.dragOptions = function(choice) {
        return {
          revert: 'invalid',
          placeholder: 'keep',
          index: _.indexOf(scope.local.choices, choice),
          onStart: 'onStart',
          containment: element,
          distance: 5
        };
      };

      scope.answerDragOptions = function(index) {
        return {
          revert: function(isValid) {
            if (!isValid) {
              scope.$apply(function() {
                scope.landingPlaceChoices[index] = {};
              });
              return true;
            }
          },
          revertDuration: 0,
          index: index,
          placeholder: true,
          distance: 5,
          containment: element
        };
      };


      scope.onDrop = function() {
        scope.dragging.isOut = false;
        for (var i = 0; i < scope.local.choices.length; i++) {
          scope.local.choices[i] = scope.local.choices[i] || {};
        }
        scope.$emit('rerender-math', {delay: 1, element: element[0]});
      };

      scope.droppableOptions = {
        hoverClass: 'drop-hover',
        onDrop: 'onDrop'
      };


      scope.classForChoice = function(id, idx) {
        if (_.isEmpty(id)) {
          return "";
        }
        if (scope.response && scope.response.correctResponse && scope.response.correctness !== 'warning') {
          if (scope.response.correctResponse.length > idx && scope.response.correctResponse[idx] === id) {
            return 'correct';
          }

          return 'incorrect';
        }
      };

      scope.showCorrectResponse = function() {
        return scope.correctResponse && scope.top.correctAnswerVisible;
      };

      scope.hasResponse = function() {
        return scope.response !== undefined;
      };

      scope.choiceLabelVisible = function() {
        if (scope.model.config.choiceAreaLayout === 'vertical') {
          return !_.isEmpty(scope.model.config.choiceAreaLabel) || !_.isEmpty(scope.model.config.answerAreaLabel);
        } else {
          return !_.isEmpty(scope.model.config.choiceAreaLabel);
        }
      };

      scope.answerLabelVisible = function() {
        if (scope.model.config.choiceAreaLayout === 'vertical') {
          return !_.isEmpty(scope.model.config.choiceAreaLabel) || !_.isEmpty(scope.model.config.answerAreaLabel);
        } else {
          return !_.isEmpty(scope.model.config.answerAreaLabel);
        }
      };

      scope.putBackChoice = function(idx) {
        scope.landingPlaceChoices[idx] = {};
      };

      function restoreChoicesFromAnswer(answers) {
        if (scope.model.config.placementType === PlacementType.placement) {
          _.each(answers, function(k, idx) {
            scope.landingPlaceChoices[idx] = scope.choiceForId(k) || {};
          });
        } else {
          var choices = [];
          _.each(answers.choices || answers, function(a) {
            var choice = _.find(scope.local.choices, function(c) {
              return c.id === a;
            });
            if (choice) {
              choices.push(choice);
            }
          });
          scope.local.choices = choices;
        }
      }

      _.extend(scope.containerBridge, {
        setPlayerSkin: function(skin) {
          scope.iconset = skin.iconSet;
        },

        setDataAndSession: function(dataAndSession) {
          $log.debug("Placement Ordering setting session: ", dataAndSession);
          console.log('dataAndSession', dataAndSession);

          scope.session = dataAndSession.session || {};
          scope.rawModel = dataAndSession.data.model;
          scope.display = {
            showCorrectAnswer: false
          };
          scope.rawModel.config = _.defaults(scope.rawModel.config || {}, {choiceAreaLayout: 'vertical'});

          scope.local = {};
          scope.resetChoices(scope.rawModel);

          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
          scope.cardinality = 'ordered';
          scope.userHasInteracted = false;

          for (var i = 0; i < scope.rawModel.choices.length; i++) {
            scope.landingPlaceChoices[i] = {};
          }

          if (dataAndSession.session && dataAndSession.session.answers) {
            restoreChoicesFromAnswer(dataAndSession.session.answers);
          }

          scope.initUndo();
        },

        setMode: function(mode) {
          scope.mode = mode;
        },

        getSession: function() {
          if (scope.model.config.placementType === PlacementType.placement) {
            var choices = [];
            for (var i = 0; i < scope.originalChoices.length; i++) {
              if (scope.landingPlaceChoices[i] && scope.landingPlaceChoices[i].id) {
                choices[i] = scope.landingPlaceChoices[i].id;
              }
            }
            return {
              answers: choices
            };
          } else {
            return {
              answers: scope.userHasInteracted ? _.pluck(scope.local.choices, 'id') : []
            };
          }
        },

        reset: function() {
          scope.resetChoices(scope.rawModel);
          clearLandingPlaceChoices();
          scope.correctResponse = undefined;
          scope.correctChoices = undefined;
          scope.correctClass = undefined;
          scope.response = undefined;
          scope.comments = undefined;
          scope.feedback = undefined;
          scope.top = {};
          scope.userHasInteracted = false;
          scope.initUndo();
        },

        isAnswerEmpty: function() {
          if(scope.model.config.placementType === PlacementType.placement) {
            return _.isEmpty(this.getSession().answers);
          } else {
            return false;
          }
        },

        setInstructorData: function(data) {
          restoreChoicesFromAnswer(data.correctResponse);
          this.setResponse({correctness: 'correct', correctResponse: data.correctResponse});
        },

        setResponse: function(response) {
          console.log('response', response);
          scope.response = response;
          if (response.correctness === 'incorrect') {
            scope.correctResponse = response.correctResponse;
          }
          scope.correctChoices = _.map(response.correctResponse, function(c) {
            return _.find(scope.local.choices, function(lc) {
              return lc.id === c;
            });
          });
          scope.feedback = response.feedback;
          scope.correctClass = response.correctClass;
          scope.comments = response.comments;
        },

        answerChangedHandler: function(callback) {
          scope.$watch("landingPlaceChoices", function(newValue, oldValue) {
            if (newValue !== oldValue) {
              callback();
            }
          }, true);

          scope.$watch("local.choices", function(newValue, oldValue) {
            if (newValue !== oldValue) {
              callback();
            }
          }, true);
        },

        editable: function(e) {
          scope.editable = e;
          scope.sortableOptions.disabled = !e;
        }
      });

      scope.sortableOptions = {
        disabled: false,
        start: function(e, ui) {
          ui.placeholder.html(ui.item.html());
          if (scope.model.config.choiceAreaLayout === "horizontal") {
            $(e.target).data("ui-sortable").floating = true;
          }
        },
        update: function(e, ui) {
          scope.userHasInteracted = true;
        }
      };

      scope.showPlacementArea = function() {
        var horizontal = scope.model.config.choiceAreaLayout === 'horizontal';
        var below = scope.model.config.choiceAreaPosition === 'below';
        return !horizontal || !below;
      };

      scope.$watch(function() {
        var h = element.find('.vertical .choices-inner-holder').outerHeight();
        if (h && scope.lastChoiceAreaHeight !== h) {
          element.find('.vertical .answer-area-table').outerHeight(h);
          scope.lastChoiceAreaHeight = h;
        }
      });

      scope.$watch('display.showCorrectAnswer', function() {
        scope.$broadcast('setVisible', scope.display.showCorrectAnswer ? 1 : 0);
      });

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    }

    var buttonRow = function(attrs) {
      return [
        '  <div ng-if="mode != \'view\'" class="button-row btn-group-md text-center {{model.config.choiceAreaLayout}}" ' + (attrs || "") + '>',
        '    <span cs-undo-button-with-model ng-hide="response"></span>',
        '    <span cs-start-over-button-with-model ng-hide="response"></span>',
        '  </div>',
        '  <div class="{{model.config.choiceAreaLayout}}" ' + (attrs || "") + '>',
        '    <correct-answer-toggle visible="correctResponse" toggle="display.showCorrectAnswer"></correct-answer-toggle>',
        '  </div>'
      ].join('\n');
    };
    var answerArea = [
      '<div class="answer-area-holder">',
      '<div class="clearfix" ng-if="model.config.choiceAreaLayout == \'horizontal\' && model.config.choiceAreaPosition == \'below\'"></div>',
      '  <div class="answer-area-label" ng-show="answerLabelVisible()" ng-if="!showCorrectResponse() && model.config.choiceAreaLayout == \'horizontal\'" ng-bind-html-unsafe="model.config.answerAreaLabel"></div>',
      '  <div class="answer-area-table {{correctClass}} user-choices">',
      '    <div ng-repeat="o in originalChoices" class="choice-wrapper" data-drop="true"',
      '         ng-model="landingPlaceChoices[$index]" jqyoui-droppable="droppableOptions" data-jqyoui-options="droppableOptions">',
      '      <div class="drop-wrapper {{classForChoice(landingPlaceChoices[$index].id, $index)}}" >',
      '        <div class="ordering-number" ng-if="model.config.showOrdering" ng-hide="landingPlaceChoices[$index].label">{{$index+1}}</div>',
      '        <div class="choice" ng-class="{choiceHolder: !landingPlaceChoices[$index].id}"',
      '            data-drag="editable && landingPlaceChoices[$index].id" jqyoui-draggable="answerDragOptions($index)" data-jqyoui-options="answerDragOptions($index)" ng-model="landingPlaceChoices[$index]" >',
      '          <div ng-bind-html-unsafe="landingPlaceChoices[$index].label"></div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    var correctAnswerArea = function() {
      return [
        '<div class="choices">',
        '  <div class="choices-holder">',
        '    <div class="choices-inner-holder clearfix correct-choices">',
        '      <div ng-repeat="o in correctChoices" class="choice-wrapper"> ',
        '        <div class="drop-wrapper correct">',
        '          <div class="choice">',
        '            <div ng-bind-html-unsafe="o.label"></div>',
        '          </div>',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    };

    var choices = [
      '<div class="choices user-choices" >',
      '  <div class="choices-holder" ng-if="!hasResponse()">',
      '<div class="clearfix"></div>',
      '<div class="choice-area-label" ng-show="choiceLabelVisible()" ng-if="!hasResponse() && model.config.choiceAreaLayout == \'horizontal\'" ng-bind-html-unsafe="model.config.choiceAreaLabel"></div>',
      '    <div class="choices-inner-holder clearfix">',
      '      <div ng-repeat="o in local.choices" class="choice-wrapper">',
      '        <div class="choice" ng-class="{hiddenChoice: choiceHidden(o)}"',
      '             data-drag="editable"',
      '             ng-disabled="!editable"',
      '             data-jqyoui-options="dragOptions(o)"',
      '             ng-model="local.choices"',
      '             jqyoui-draggable="dragOptions(o)"',
      '             ng-bind-html-unsafe="o.label"',
      '             data-id="{{o.id}}">',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    var inplaceTemplate = [
      '  <div ng-if="model.config.placementType != \'placement\'" class="view-ordering {{model.config.choiceAreaLayout}}">',
      buttonRow(),
      '    <div class="clearfix"/>',
      '    <div ng-show="model.config.choiceAreaLabel" ng-bind-html-unsafe="model.config.choiceAreaLabel" class="choice-area-label"></div>',
      '    <div class="answer-area-container">',
      '      <response-wrapper>',
      '        <div class="container-border {{correctClass}} user-answer">',
      '          <ul class="clearfix user-choices" ng-model="local.choices" ui-sortable="sortableOptions">',
      '            <li ng-repeat="choice in local.choices">',
      '              <div class="choice {{classForChoice(choice.id, $index)}}" ng-bind-html-unsafe="choice.label"></div>',
      '              <div class="sizerHolder">',
      '                <div class="html-holder choice" ng-bind-html-unsafe="choice.label"></div>',
      '              </div>',
      '            </li>',
      '          </ul>',
      '        </div>',
      '        <div class="see-correct-answer correct-answer">',
      '          <ul class="clearfix correct-choices">',
      '            <li ng-repeat="choice in correctChoices">',
      '              <div class="choice {{classForChoice(choice.id, $index)}}" ',
      '                ng-bind-html-unsafe="choice.label">',
      '            </li>',
      '          </ul>',
      '        </div>',
      '      </response-wrapper>',
      '    </div>',
      '    <div class="clearfix" />',
      '    <div ng-show="feedback" feedback="feedback" icon-set="{{iconset}}" correct-class="{{correctClass}}"></div>',
      '    <div ng-if="model.config.choiceAreaLayout == \'horizontal\'">',
      '      <ul class="clearfix correct-choices" ng-class="showCorrectResponse() ? \'shown\' : \'not-shown\'">',
      '        <li ng-repeat="choice in correctChoices">',
      '          <div class="choice correct" ng-bind-html-unsafe="choice.label"></div>',
      '        </li>',
      '      </ul>',
      '    </div>',
      '  </div>'
    ].join('\n');

    var placementTemplate = [
      '<div ng-if="model.config.placementType == \'placement\'" class="view-placement-ordering main-table {{model.config.choiceAreaLayout}}">',
      buttonRow(),
      '  <div class="main-row">',
      '    <div ng-show="choiceLabelVisible()" class="label-row" ng-if="model.config.choiceAreaLayout == \'vertical\'">',
      '      <div class="choice-area-label" ng-show="choiceLabelVisible()" ng-bind-html-unsafe="model.config.choiceAreaLabel"></div>',
      '      <div class="answer-area-label" ng-show="answerLabelVisible()" ng-bind-html-unsafe="model.config.answerAreaLabel"></div>',
      '    </div>',
      '    <div class="placement-areas" ng-if="showPlacementArea()">',
      '    <div class="choice-area">', choices, '</div>',
      '      <response-wrapper>',
      '        <div class="answer-area">', answerArea, '</div>',
      '        <div class="see-answer-area choice-area pull-right">' + correctAnswerArea() + '</div>',
      '      </response-wrapper>',
      '    </div>',
      '    <div class="placement-areas" ng-if="model.config.choiceAreaLayout == \'horizontal\' && model.config.choiceAreaPosition == \'below\'">',
      '      <div class="answer-area">', answerArea, '</div>',
      '      <div class="choice-area">', choices, '</div>',
      '      <div class="see-answer-area choice-area pull-right">' + correctAnswerArea() + '</div>',
      '    </div>',
      '    <div class="feedback-holder" ng-if="model.config.choiceAreaLayout == \'horizontal\'">',
      '      <div ng-show="feedback" feedback="feedback" icon-set="{{iconset}}" correct-class="{{correctClass}}"></div>',
      '    </div>',
      '  </div>',
      '  <div ng-if="model.config.choiceAreaLayout == \'vertical\'">',
      '    <div ng-show="feedback" feedback="feedback" icon-set="{{iconset}}" correct-class="{{correctClass}}"></div>',
      '  </div>',
      '</div>'
    ].join('\n');

    var tmpl = [
      '<div drag-and-drop-controller class="{{mode}}-mode corespring-ordering">',

      placementTemplate,
      inplaceTemplate,

      '  <div ng-show="comments" class="well" ng-bind-html-unsafe="comments"></div>',
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

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
