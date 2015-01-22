var main = ['DragAndDropTemplates', '$compile', '$log', '$modal', '$rootScope', '$timeout',
  function(DragAndDropTemplates, $compile, $log, $modal, $rootScope, $timeout) {

    var answerArea = [
      '<div>',
      '  <div answer-area landingId="answer"',
      '                  answer-area-label="{{model.config.answerAreaLabel}}"',
      '                  answer-area-layout="{{model.config.choiceAreaLayout}}"',
      '  >',
      '  </div>',
      '</div>'
    ].join('');

    var link = function(scope, element, attrs) {

      scope._seeSolution = function() {
        scope.seeSolution(answerArea);
      };

      scope.classForChoice = function(id, idx) {
        if (scope.correctResponse) {
          if (scope.correctResponse.length > idx && scope.correctResponse[idx] === id) {
            return 'correct';
          }

          return 'incorrect';

        }

      };

      _.extend(scope.containerBridge, {
        setDataAndSession: function(dataAndSession) {
          $log.debug("Placement Ordering setting session: ", dataAndSession);

          scope.session = dataAndSession.session || {};
          scope.rawModel = dataAndSession.data.model;
          scope.editable = true;
          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
          scope.cardinality = 'ordered';
          scope.local = {};
          scope.resetChoices(scope.rawModel);

          scope.originalChoices = _.cloneDeep(scope.model.choices);

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
          var choices = (scope.model.config.placementType === 'placement') ? scope.landingPlaceChoices.answer : scope.local.choices;
          return {
            answers: _.pluck(choices, 'id')
          };
        },

        reset: function() {
          scope.resetChoices(scope.rawModel);
          scope.correctResponse = undefined;
          scope.comments = undefined;
          scope.feedback = undefined;
        },

        setResponse: function(response) {
          console.log("set response for DnD", response);
          scope.correctResponse = response.correctResponse;
          scope.feedback = response.feedback;
          scope.correctClass = response.correctClass;
          scope.comments = response.comments;

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
        disabled: false
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    };

    var tmpl = [
      '<div class="view-placement-ordering view-drag-and-drop" drag-and-drop-controller>',
      '  <div ng-show="!correctResponse && model.config.placementType == \'placement\'" class="pull-right">',
      '    <button type="button" class="btn btn-default" ng-click="undo()">Undo</button>',
      '    <button type="button" class="btn btn-default" ng-click="startOver()">Start over</button>',
      '  </div> <div class="clearfix" />',
      '  <div ng-if="model.config.placementType == \'placement\'" class="main-table {{model.config.choiceAreaLayout}}">',
      '    <div class="main-row">',
      '      <div class="choice-area">', DragAndDropTemplates.choiceArea(), '</div>',
      '      <div class="answer-area">' + answerArea + '</div>',
      '    </div>',
      '  </div>',
      '  <div ng-if="model.config.placementType != \'placement\'" class="view-ordering">',
      '    <ul class="choices" ng-model="local.choices" ui-sortable="sortableOptions">',
      '      <li ng-repeat="choice in local.choices">',
      '        <div class="choice {{classForChoice(choice.id, $index)}}" ',
      '          ng-bind-html-unsafe="choice.label"> </div>',
      '      </li>',
      '    </ul>',
      '  </div>',

      '  <div class="clearfix"></div>',
      '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
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
