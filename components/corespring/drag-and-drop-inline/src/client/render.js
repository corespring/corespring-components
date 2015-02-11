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
    $timeout
  ) {

    "use strict";

    return {
      scope: false,
      restrict: 'AE',
      replace: true,
      template: template(),
      link: function(scope, element, attrs) {

        function answerAreaTemplate(){
          var answerHtml = scope.model.answerAreasXhtml;
          var answerArea = "<div scope-passer=''> " + answerHtml + "</div>";
          return answerArea;
        }

        scope._seeSolution = function() {
          scope.seeSolution(answerAreaTemplate());
        };

        //scope has been initialised by drag-and-drop-controller already
        _.extend(scope.containerBridge, {
          setDataAndSession: function(dataAndSession) {
            console.log("[DnD-inline] setDataAndSession: ", dataAndSession);

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

            //resetChoices sets up scope.model
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
            console.debug("[DnD-inline] setResponse: ", response);
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
            console.debug("[DnD-inline] setResponse: ", scope.solutionScope);
          }
        });

        scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
      }
    };

    function template() {
      var tmpl = [
        '<div class="view-drag-and-drop view-drag-and-drop-inline" drag-and-drop-controller>',
        '  <div ng-show="!correctResponse" class="pull-right">',
        '    <button type="button" class="btn btn-default" ng-click="undo()"><i class="fa fa-undo"></i>  Undo</button>',
        '    <button type="button" class="btn btn-default" ng-click="startOver()">Start over</button>',
        '  </div> <div class="clearfix" />',
        '  <div ng-if="model.config.choiceAreaPosition != \'below\'">', DragAndDropTemplates.choiceArea(), '</div>',
        '  <div id="answer-area-holder"></div>',
        '  <div ng-if="model.config.choiceAreaPosition == \'below\'">', DragAndDropTemplates.choiceArea(), '</div>',
        '  <div class="pull-right" ng-show="correctResponse"><a ng-click="_seeSolution()">See solution</a></div>',
        '  <div class="clearfix"></div>',
        '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
        '</div>'

      ].join("");
      return tmpl;
    }

  }];

var scopePasser = [
  function() {

    "use strict";

    return {
      scope: false,
      restrict: 'A',
      replace: false,
      controller: function($scope) {
        $scope.$on("getScope", function(event, callback) {
          console.log("getScope");
          callback($scope);
        });
      }
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
      template: template(),
      link: function(scope, el, attr) {
        console.log("link", attr.id);
        scope.$emit("getScope", function(renderScope) {
          console.log("getScope", renderScope);
          scope.answerAreaId = attr.id;
          scope.answerArea = _.find(renderScope.model.answerAreas, {
            id: scope.answerAreaId
          });
          scope.landingPlaceChoices = renderScope.landingPlaceChoices;

          scope.targetSortableOptions = {
            start: function() {
              renderScope.targetDragging = true;
            },
            stop: function() {
              renderScope.targetDragging = false;
            }
          };

          scope.droppableOptions = {
            accept: function() {
              return !renderScope.targetDragging;
            }
          };

          var TARGET_ID = 100;

          //to avoid the duplicate id error in the repeater of the answerArea
          //we are using our own tracking id function, which never returns the same id again
          scope.targetId = function(choice) {
            return TARGET_ID++;
          };

        });
      }
    };

    function template() {
      return [
        '<div class="answer-area-inline">',
        '  <ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions"',
        '      ng-model="landingPlaceChoices[answerAreaId]"',
        '      data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
        '    <li class="sortable-choice" data-choice-id="{{choice.id}}',
        '       ng-repeat="choice in landingPlaceChoices[answerAreaId] track by targetId(choice)">',
        '      <span ng-bind-html-unsafe="choice.label"></span>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join("\n");
    }
  }
];



exports.framework = 'angular';
exports.directives = [{
  directive: main
}, {
  name: 'scopePasser',
  directive: scopePasser
}, {
  name: 'answerAreaInline',
  directive: answerAreaInline
}];