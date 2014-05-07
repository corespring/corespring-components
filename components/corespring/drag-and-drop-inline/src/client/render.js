var main = ['DragAndDropTemplates','$compile', '$log', '$modal', '$rootScope', '$timeout',
  function(DragAndDropTemplates, $compile, $log, $modal, $rootScope, $timeout) {

    var answerArea = [
      '<h5 ng-bind-html-unsafe="model.config.answerAreaLabel"></h5>',
      '<div style="display: inline; vertical-align: top" ng-repeat="c in model.answerAreas">',
      '  <div style="display: inline-block" ng-bind-html-unsafe="c.textBefore"></div>',
      '  <div style="display: inline-block" answer-area class="inline" landingId="{{c.id}}" answer-area-layout="inline"></div>',
      '  <div style="display: inline-block" ng-bind-html-unsafe="c.textAfter"></div>',
      '</div>'
    ].join('');

    var link = function(scope, element, attrs) {

      scope._seeSolution = function() {
        scope.seeSolution(answerArea);
      };

      _.extend(scope.containerBridge, {
        setDataAndSession: function(dataAndSession) {
          $log.debug("DnD setting session: ", dataAndSession);

          scope.rawModel = dataAndSession.data.model;
          scope.editable = true;

          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
          scope.resetChoices(scope.rawModel);

          scope.originalChoices = _.cloneDeep(scope.model.choices);

          if (dataAndSession.session && dataAndSession.session.answers) {

            // Build up the landing places with the selected choices
            _.each(dataAndSession.session.answers, function(v, k) {
              scope.landingPlaceChoices[k] = _.map(v, scope.choiceForId);
            });

            // Remove choices that are in landing place area
            scope.model.choices = _.filter(scope.model.choices, function(choice) {
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
          console.log("set response for DnD", response);
          scope.correctResponse = response.correctResponse;
          scope.feedback = response.feedback;
          scope.correctClass = response.correctness;

          // Populate solutionScope with the correct response
          scope.solutionScope = $rootScope.$new();
          scope.solutionScope.landingPlaceChoices = {};
          scope.solutionScope.model = scope.model;
          _.each(scope.correctResponse, function(v, k) {
            scope.solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return scope.choiceForId(r);
            });
          });

        },

        setMode: function(newMode) {
        },

        reset: function() {
          scope.resetChoices(scope.rawModel);
          scope.correctResponse = undefined;
          scope.feedback = undefined;
        }

      });

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);

    };

    var tmpl = [
      '<div class="view-drag-and-drop-inline" drag-and-drop-controller>',
      '  <div ng-show="!correctResponse" class="pull-right">',
      '    <button type="button" class="btn btn-default" ng-click="undo()">Undo</button>',
      '    <button type="button" class="btn btn-default" ng-click="startOver()">Start over</button>',
      '  </div> <div class="clearfix" />',
      '  <div ng-if="model.config.answerAreaPosition != \'above\'">', DragAndDropTemplates.choiceArea(), '</div>',
      answerArea,
      '  <div ng-if="model.config.answerAreaPosition == \'above\'">', DragAndDropTemplates.choiceArea(), '</div>',
      '  <div class="pull-right" ng-show="correctResponse"><a ng-click="_seeSolution()">See solution</a></div>',
      '  <div class="clearfix"></div>',
      '  <div ng-show="feedback" class="feedback-{{correctClass}}" ng-bind-html-unsafe="feedback"></div>',
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
