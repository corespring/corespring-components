/* global console,exports */
var main = ['DragAndDropTemplates', '$compile', '$log', '$modal', '$rootScope', '$timeout',
  function(DragAndDropTemplates, $compile, $log, $modal, $rootScope, $timeout) {

    "use strict";

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
        if (scope.response && scope.response.correctResponse) {
          if (scope.response.correctResponse.length > idx && scope.response.correctResponse[idx] === id) {
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
          scope.rawModel.config = _.defaults(scope.rawModel.config || {}, {choiceAreaLayout: 'vertical'});
          scope.editable = true;
          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
          scope.cardinality = 'ordered';
          scope.local = {};
          scope.resetChoices(scope.rawModel);


          if (dataAndSession.session && dataAndSession.session.answers) {
            if (scope.model.config.placementType === 'placement') {
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
            } else {
              var choices = [];
              _.each(dataAndSession.session.answers, function(a) {
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
          scope.response = response;
          if (response.correctness !== 'correct') {
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

      scope.$watch('local.choices', function(n, o) {
        var state = { choices: _.cloneDeep(scope.local.choices),
          landingPlaces: []
        };
        if (n && !_.isEqual(state, _.last(scope.stack))) {
          scope.stack.push(state);
        }
      }, true);

      scope.sortableOptions = {
        disabled: false,
        start: function(e, ui) {
          if (scope.model.config.choiceAreaLayout === "horizontal") {
            $(e.target).data("ui-sortable").floating = true;
          }
        }
      };
      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    };

    var inplaceTemplate = [
      '  <div ng-if="model.config.placementType != \'placement\'" class="view-ordering {{model.config.choiceAreaLayout}}">',

      '    <div class="button-row {{model.config.choiceAreaLayout}}">',
      '      <button type="button" ng-disabled="correctResponse" class="btn btn-default" ng-click="undo()"><i class="fa fa-undo"></i>  Undo</button>',
      '      <button type="button" ng-disabled="correctResponse" class="btn btn-default" ng-click="startOver()">Start over</button>',
      '      <div ng-if="model.config.choiceAreaLayout == \'vertical\'" ng-show="correctResponse" class="pull-right show-correct-button" ng-click="$parent.correctAnswerVisible = !!!$parent.correctAnswerVisible">',
      '        <h5><i class="fa fa-eye-slash"></i>&nbsp;{{$parent.correctAnswerVisible ? \'Hide\' : \'Show\'}} Correct Answer</h5>',
      '      </div>',
      '    </div>',

      '    <div class="clearfix" />',

      '    <div ng-bind-html-unsafe="model.config.choiceAreaLabel" class="choice-area-label"></div>',
      '    <div class="answer-area-container">',
      '      <div class="container-border">',
      '        <ul class="clearfix" ng-model="local.choices" ui-sortable="sortableOptions">',
      '          <li ng-repeat="choice in local.choices">',
      '            <div class="choice {{classForChoice(choice.id, $index)}}" ',
      '              ng-bind-html-unsafe="choice.label">',
      '          </li>',
      '        </ul>',
      '      </div>',

      '      <div ng-if="model.config.choiceAreaLayout == \'vertical\'" ng-show="correctResponse && $parent.correctAnswerVisible" class="correct-answer">',
      '        <ul class="clearfix">',
      '          <li ng-repeat="choice in correctChoices">',
      '            <div class="choice {{classForChoice(choice.id, $index)}}" ',
      '              ng-bind-html-unsafe="choice.label">',
      '          </li>',
      '        </ul>',
      '      </div>',
      '    </div>',

      '    <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
      '    <div see-answer-panel ng-if="model.config.choiceAreaLayout == \'horizontal\'" ng-show="correctResponse" >',
      '      <ul class="clearfix">',
      '        <li ng-repeat="choice in correctChoices">',
      '          <div class="choice correct" ',
      '            ng-bind-html-unsafe="choice.label">',
      '        </li>',
      '      </ul>',
      '    </div>',
      '  </div>'
    ].join('\n');

    var dragAndDropTemplate = [
      '  <div ng-if="model.config.placementType == \'placement\'" class="view-placement-ordering main-table {{model.config.choiceAreaLayout}}">',
      '    <div class="main-row">',
      '      <div class="choice-area">', DragAndDropTemplates.choiceArea(), '</div>',
        '      <div class="answer-area">' + answerArea + '</div>',
      '    </div>',
      '  </div>'
    ].join('\n');

    var tmpl = [
      '<div class="view-drag-and-drop" drag-and-drop-controller>',

      dragAndDropTemplate,
      inplaceTemplate,

      '  <div class="clearfix"></div>',
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
