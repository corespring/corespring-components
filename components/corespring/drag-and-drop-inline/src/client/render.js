/* global exports */
var main = ['DragAndDropTemplates','$compile', '$log', '$modal', '$rootScope',
  function(DragAndDropTemplates, $compile, $log, $modal, $rootScope) {

    "use strict";

    var answerArea = [
      '<h5 ng-bind-html-unsafe="model.config.answerAreaLabel"></h5>',
      '<div>',
      '<div style="display: inline; vertical-align: top" ng-repeat="c in model.answerAreas">',
      '  <div style="display: inline-block" ng-bind-html-unsafe="c.textBefore"></div>',
      '  <div style="display: inline-block" answer-area class="inline" landingId="{{c.id}}" answer-area-layout="inline"></div>',
      '  <div style="display: inline-block" ng-bind-html-unsafe="c.textAfter"></div>',
      '  <br ng-show="c.insertBr"/>',
      '</div>',
      '</div>'
    ].join('');

    var link = function(scope, element, attrs) {

      scope._seeSolution = function() {
        scope.seeSolution(answerArea);
      };

      _.extend(scope.containerBridge, {
        setDataAndSession: function(dataAndSession) {
          $log.debug("[DnD-inline] setDataAndSession: ", dataAndSession);

          scope.session = dataAndSession.session || {};
          scope.rawModel = dataAndSession.data.model;
          scope.editable = true;
          scope.local = {};

          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
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

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    };

    var tmpl = [
      '<div class="view-drag-and-drop view-drag-and-drop-inline" drag-and-drop-controller>',
      '  <div ng-show="!correctResponse" class="pull-right">',
      '    <button type="button" class="btn btn-default" ng-click="undo()"><i class="fa fa-undo"></i>  Undo</button>',
      '    <button type="button" class="btn btn-default" ng-click="startOver()">Start over</button>',
      '  </div> <div class="clearfix" />',
      '  <div ng-if="model.config.choiceAreaPosition != \'below\'">', DragAndDropTemplates.choiceArea(), '</div>',
      answerArea,
      '  <div ng-if="model.config.choiceAreaPosition == \'below\'">', DragAndDropTemplates.choiceArea(), '</div>',
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

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
