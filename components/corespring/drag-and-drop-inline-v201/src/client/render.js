/* global exports */
var main = [
  'DragAndDropTemplates',
  '$compile',
  '$log',
  '$modal',
  '$rootScope',
  '$timeout',
  function(
    DragAndDropTemplates,
    $compile,
    $log,
    $modal,
    $rootScope,
    $timeout) {

    "use strict";

    function link(scope, element, attrs) {

      function answerAreaTemplate(attributes){
        attributes = (attributes? ' ' + attributes : '');
        var answerHtml = scope.model.answerAreaXhtml;
        var answerArea = "<div scope-forwarder-v201=''" + attributes + ">" + answerHtml + "</div>";
        return answerArea;
      }

      scope._seeSolution = function() {
        scope.seeSolution(answerAreaTemplate("class='corespring-drag-and-drop-inline-see-solution-v201'"));
      };

      _.extend(scope.containerBridge, {
        setDataAndSession: function(dataAndSession) {
          $log.debug("[DnD-inline] setDataAndSession: ", dataAndSession);

          scope.session = dataAndSession.session || {};
          scope.rawModel = dataAndSession.data.model;
          scope.editable = true;
          scope.local = {};

          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
          _.forEach(dataAndSession.data.model.answerAreas, function(area){
            if(!_.isArray(scope.landingPlaceChoices[area.id])){
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
            scope.local.choices = _.filter(scope.local.choices, function(choice) {
              var landingPlaceWithChoice = _.find(scope.landingPlaceChoices, function(c) {
                return _.pluck(c, 'id').indexOf(choice.id) >= 0;
              });
              return _.isUndefined(landingPlaceWithChoice);
            });
          }

          var $answerArea = element.find("#answer-area-holder").html(answerAreaTemplate());
          $timeout(function() {
            $compile($answerArea)(scope.$new());
          });
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
          scope.feedback = response.feedback;
          scope.correctness = response.correctness;
          scope.correctClass = response.correctClass;
          scope.correctResponse = response.correctness === 'incorrect' ? response.correctResponse : null;

          // Populate solutionScope with the correct response
          scope.solutionScope = $rootScope.$new();
          scope.solutionScope.landingPlaceChoices = {};
          scope.solutionScope.model = scope.model;
          _.each(scope.correctResponse, function(v, k) {
            scope.solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return scope.choiceForId(r);
            });
          });

        }
      });

      scope.classForChoice = function(answerAreaId, choice, targetIndex) {
        if (!scope.correctResponse) {
          return;
        }
        var correctResponse = scope.correctResponse[answerAreaId];
        if (!correctResponse) {
          return;
        }

        var actualIndex = correctResponse.indexOf(choice.id);
        var isCorrect = actualIndex >= 0;
        return isCorrect ? "correct" : "incorrect";
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
    }

    function choiceArea(){
      return [
        '<div class="choices-wrapper" >',
        '  <div class="label-holder" ng-show="model.config.choiceAreaLabel">',
        '    <div class="choiceAreaLabel">{{model.config.choiceAreaLabel}}</div>',
        '  </div>',
        '  <div ng-repeat="choice in local.choices"',
        '    class="choice" ',
        '    data-drag="editable"',
        '    ng-disabled="!editable"',
        '    data-jqyoui-options="draggableOptions(choice)"',
        '    ng-model="local.choices"',
        '    jqyoui-draggable="draggableOptions(choice)"',
        '    data-id="{{choice.id}}">',
        '    <span class="choice-content" ng-bind-html-unsafe="choice.label"></span>',
        '  </div>',
        '</div>'
      ].join('');
    }

    var tmpl = [
      '<div class="corespring-drag-and-drop-inline-render-v201" drag-and-drop-controller>',
      '  <div ng-show="!correctResponse" class="undo-start-over pull-right">',
      '    <button type="button" class="btn btn-default" ng-click="undo()"><i class="fa fa-undo"></i> Undo</button>',
      '    <button type="button" class="btn btn-default" ng-click="startOver()">Start over</button>',
      '  </div>',
      '  <div class="clearfix"></div>',
      '  <div ng-if="model.config.choiceAreaPosition != \'below\'">', choiceArea(), '</div>',
      '  <div id="answer-area-holder"></div>',
      '  <div ng-if="model.config.choiceAreaPosition == \'below\'">', choiceArea(), '</div>',
      '  <div class="pull-right" ng-show="correctResponse"><a ng-click="_seeSolution()">See solution</a></div>',
      '  <div class="clearfix"></div>',
      '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
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
      replace: false,
      controller: ['$scope', function($scope) {
        $scope.$on("getScope", function(event, callback) {
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
        scope.$emit("getScope", function(renderScope) {
          scope.renderScope = renderScope;
          scope.answerAreaId = attr.id;

          scope.canEdit = function(){
            return !renderScope.correctResponse && renderScope.editable;
          };

          scope.targetSortableOptions = function(){
            return {
              disabled: !scope.canEdit(),
              start: function () {
                renderScope.targetDragging = true;
              },
              stop: function () {
                renderScope.targetDragging = false;
              }
            };
          };

          scope.droppableOptions = {
            accept: function() {
              return !renderScope.targetDragging;
            },
            activeClass: 'answer-area-inline-active',
            hoverClass: 'answer-area-inline-hover',
            tolerance: "pointer"
          };
          scope.trackId = function(choice) {
            return _.uniqueId();
          };
          scope.classForChoice = function(choice, index){
            return renderScope && renderScope.classForChoice ? renderScope.classForChoice(scope.answerAreaId, choice, index) : undefined;
          };
          scope.classForCorrectness = function(choice, index){
            var choiceClass = scope.classForChoice(choice, index);
            if(!choiceClass){
              return;
            }
            return choiceClass === 'correct' ? 'fa-check-circle' : 'fa-times-circle';
          };
          scope.choiceLabel = function(choice){
            return choice.label + ' <span class="close"><i ng-click="removeChoice($index)" class="fa fa-close"></i></span>';
          };
          scope.removeChoice = function(index){
            scope.renderScope.landingPlaceChoices[scope.answerAreaId].splice(index,1);
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
        '        <span class="remove-choice" ng-hide="!canEdit()"><i ng-click="removeChoice($index)" class="fa fa-close"></i></span>',
        '      </div>',
        '      <i class="circle fa" ng-class="classForCorrectness(choice)"></i>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n")
    };
  }
];
exports.framework = 'angular';
exports.directives = [{
  directive: main
}, {
  name: 'scopeForwarderV201',
  directive: scopeForwarder
}, {
  name: 'answerAreaInlineV201',
  directive: answerAreaInline
}];