var main = ['$compile', '$log', '$modal', '$rootScope', '$timeout',
  function($compile, $log, $modal, $rootScope, $timeout) {

    var link = function(scope, element, attrs) {

      scope.landingPlaceChoices = {};
      scope.dragging = {};
      scope.maxWidth = 50;
      scope.maxHeight = 20;
      scope.stack = [];

      scope.propagateDimension = function(w, h) {
        scope.$apply(function() {
          if (w !== scope.maxWidth) {
            scope.maxWidth = w;
          }
          if (h !== scope.maxHeight) {
            scope.maxHeight = h;
          }
          scope.choiceStyle = {
            width: (scope.maxWidth) + 'px',
            height: (scope.maxHeight + 16) + 'px'
          };
        });
      };

      var lastW, lastH, freq = 100;

      setInterval(function() {

        if (!scope.$$phase) {
          var w = 0,
            h = 0;

          $(element).find('.sizerHolder').each(function(idx, e) {
            if ($(e).width() > w) {
              w = $(e).width();
            }
          });
          $(element).find('.sizerHolder').each(function(idx, e) {
            if ($(e).height() > h) {
              h = $(e).height();
            }
          });
          if (lastW !== w || lastH !== h) {
            scope.propagateDimension(w + 18, h);
          }
          lastW = w;
          lastH = h;

          if (freq < 1000) {
            freq += 100;
          }
        }
      }, freq);

      scope.onStart = function(event) {
        scope.dragging.id = $(event.currentTarget).attr('data-id');
        scope.dragging.fromTarget = undefined;
      };

      scope.draggableOptions = {
        onStart: 'onStart',
        revert: 'invalid'
      };

      scope.resetChoices = function(model) {
        // TODO: rewrite this using stash
        var isNew = !scope.model;

        scope.stack = [];
        scope.model = _.cloneDeep(model);
        _.each(scope.landingPlaceChoices, function(lpc, key) {
          scope.landingPlaceChoices[key] = [];
        });

        if (isNew && scope.model.config.shuffle) {
          // TODO: rewrite this using stash
          scope.model.choices = _.shuffle(scope.model.choices);
        }
      };

      scope.startOver = function() {
        scope.stack = [];
        scope.model.choices = _.cloneDeep(scope.originalChoices);
        _.each(scope.landingPlaceChoices, function(lpc, key) {
          scope.landingPlaceChoices[key] = [];
        });
      };

      scope.undo = function() {
        if (scope.stack.length < 2) {
          return;
        }
        var o = scope.stack.pop();
        var state = _.last(scope.stack);
        scope.model.choices = _.cloneDeep(state.choices);
        scope.landingPlaceChoices = _.cloneDeep(state.landingPlaces);
      };

      scope.seeSolution = function() {
        scope.solutionScope.choiceStyle = scope.choiceStyle;
        $modal.open({
          controller: function($scope, $modalInstance) {
            $scope.ok = function() {
              $modalInstance.dismiss('cancel');
            };
          },
          template: [
            '   <div class="modal-header">',
            '     <h3>Correct Answer</h3>',
            '   </div>',
            '   <div class="modal-body">',
            scope.model.answerArea,
            '   </div>',
            '   <div class="modal-footer">',
            '     <button class="btn btn-primary" ng-click="ok()">OK</button>',
            '   </div>'
          ].join(""),
          backdrop: true,
          scope: scope.solutionScope
        });
      };

      scope.$watch('landingPlaceChoices', function(n) {
        var state = {
          choices: _.cloneDeep(scope.model.choices),
          landingPlaces: _.cloneDeep(scope.landingPlaceChoices)
        };
        if (!_.isEqual(state, _.last(scope.stack))) {
          scope.stack.push(state);
        }
      }, true);

      var choiceForId = function(id) {
        var choice = _.find(scope.originalChoices, function(c) {
          return c.id === id;
        });
        return choice;
      };


      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          $log.debug("DnD setting session: ", dataAndSession);

          scope.rawModel = dataAndSession.data.model;
          scope.editable = true;
          scope.resetChoices(scope.rawModel);

          scope.originalChoices = _.cloneDeep(scope.model.choices);

          if (dataAndSession.session && dataAndSession.session.answers) {

            // Build up the landing places with the selected choices
            _.each(dataAndSession.session.answers, function(v, k) {
              scope.landingPlaceChoices[k] = _.map(v, choiceForId);
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

          // Populate solutionScope with the correct response
          scope.solutionScope = $rootScope.$new();
          scope.solutionScope.landingPlaceChoices = {};
          _.each(scope.correctResponse, function(v, k) {
            scope.solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return choiceForId(r);
            });
          });

        },

        setMode: function(newMode) {
        },

        reset: function() {
          scope.resetChoices(scope.rawModel);
          scope.correctResponse = undefined;
          scope.feedback = undefined;
        },

        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function(callback) {
          scope.$watch("landingPlaceChoices", function(newValue, oldValue) {
            if (newValue) {
              callback();
            }
          }, true);
        },

        editable: function(e) {
          scope.$apply(function() {
            scope.editable = e;
          });
        }
      };

      scope.placeholderForChoice = function(choice) {
        return ( !scope.model.config.removeTilesOnDrop ? "'keep'" : "''");
      };

      scope.itemsPerRow = function() {
        if (scope.model.config.choiceAreaLayout === 'vertical') {
          return 1;
        } else {
          return 550 / scope.maxWidth;
        }
      };

      scope.getChoiceRows = function() {
        return _.range(scope.model.choices.length / scope.itemsPerRow());
      };

      scope.getChoicesForRow = function(row) {
        return scope.model.choices.slice(row * scope.itemsPerRow(), row * scope.itemsPerRow() + scope.itemsPerRow());
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);

    };


    var answerArea = [
        '        <h5 ng-bind-html-unsafe="model.config.answerAreaLabel"></h5>',
        '        <div ng-repeat="c in model.categories">',
        '          <div answer-area landingId="{{c.id}}"',
        '                          label="{{c.hasLabel ? c.label : \'\'}}"',
        '                          layout="{{c.layout}}"',
        '                          cardinality="multiple"',
        '                          expandHorizontally="true">',
        '          </div>',
        '        </div>'
      ].join('');

    var choiceArea = function() {
      return [
        '        <div class="choices" >',
        '          <h5 ng-show="model.config.choiceAreaHasLabel" ng-bind-html-unsafe="model.config.choiceAreaLabel"></h5>',
        '          <div class="choices-table">',
        '            <div ng-repeat="row in getChoiceRows()" class="choices-table-row">',
        '              <div ng-repeat="o in getChoicesForRow(row)" class="choice choices-table-cell" ',
        '                   ng-style="choiceStyle"',
        '                   data-drag="editable"',
        '                   ng-disabled="!editable"',
        '                   data-jqyoui-options="{revert: \'invalid\' }"',
        '                   ng-model="model.choices[$parent.$index * itemsPerRow() + $index]"',
        '                   jqyoui-draggable="{placeholder: {{placeholderForChoice(o)}} }"',
        '                   data-id="{{o.id}}">',
        '               <div ng-switch="o.labelType">',
        '                 <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
        '                 <div ng-switch-default="" ng-bind-html-unsafe="o.label" />',
        '               </div>',
        '               <div class="sizerHolder" style="display: none; position: absolute" ng-switch="o.labelType">',
        '                 <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
        '                 <div ng-switch-default="" ng-bind-html-unsafe="o.label" />',
        '               </div>',
        '              </div>',
        '            </div>',
        '          </div>',
        '          </div>'
      ].join('');
    };
    var tmpl = [
      '<div class="view-drag-and-drop-categorize">',
      '  <div ng-show="!correctResponse" class="pull-right">',
      '    <button type="button" class="btn btn-default" ng-click="undo()">Undo</button>',
      '    <button type="button" class="btn btn-default" ng-click="startOver()">Start over</button>',
      '  </div> <div class="clearfix" />',
      '  <div ng-if="model.config.answerAreaPosition != \'above\'">', choiceArea(), '</div>',
      answerArea,
      '  <div ng-if="model.config.answerAreaPosition == \'above\'">', choiceArea(), '</div>',
      '  <div class="pull-right" ng-show="correctResponse"><a href="#" ng-click="seeSolution()">See solution</a></div>',
      '  <div class="clearfix"></div>',
      '  <div class="cs-feedback" ng-bind-html-unsafe="feedback"></div>',
      '</div>'

    ].join("");


    return {
      link: link,
      scope: {},
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
