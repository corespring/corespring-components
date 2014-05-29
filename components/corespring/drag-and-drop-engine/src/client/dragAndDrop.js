var dragAndDropController = [
  '$modal',
  function($modal) {

    var def = {
      scope: true,
      restrict: 'AE',
      link: function(scope, element, attrs) {

        scope.dragging = {};
        scope.maxWidth = 50;
        scope.maxHeight = 20;
        scope.stack = [];

        scope.onStart = function(event) {
          scope.dragging.id = $(event.currentTarget).attr('data-id');
          scope.dragging.fromTarget = undefined;
        };

        scope.draggableOptions = function(choice) {
          return {
            revert: 'invalid',
            placeholder: (!choice || choice.moveOnDrag) ? false : 'keep',
            onStart: 'onStart'
          };
        };

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
              scope.propagateDimension(w + 8, h);
            }
            lastW = w;
            lastH = h;

            if (freq < 1000) {
              freq += 100;
            }
          }
        }, freq);

        var layoutChoices = function(choices, order) {
          if (!order) {
            var shuffled = _.shuffle(_.cloneDeep(choices));
            return shuffled;
          } else {
            var ordered = _(order).map(function(v) {
              return _.find(choices, function(c) {
                return c.id === v;
              });
            }).filter(function(v) {
              return v;
            }).value();

            var missing = _.difference(choices, ordered);
            return _.union(ordered, missing);
          }
        };

        var stashOrder = function(choices) {
          return _.map(choices, function(c) {
            return c.id;
          });
        };

        scope.resetChoices = function(model) {
          scope.stack = [];
          scope.model = _.cloneDeep(model);
          _.each(scope.landingPlaceChoices, function(lpc, key) {
            scope.landingPlaceChoices[key] = [];
          });

          var stash = scope.session.stash = scope.session.stash || {};
          var shuffle = scope.model.config.shuffle;
          if (stash.shuffledOrder && shuffle) {
            scope.local.choices = layoutChoices(model.choices, stash.shuffledOrder);
          } else if (shuffle) {
            scope.local.choices = layoutChoices(model.choices);
            stash.shuffledOrder = stashOrder(scope.local.choices);
            scope.$emit('saveStash', attrs.id, stash);
          } else {
            scope.local.choices = _.cloneDeep(model.choices);
          }

          scope.originalChoices = _.cloneDeep(scope.choices);
        };

        scope.choiceForId = function(id) {
          var choice = _.find(scope.originalChoices, function(c) {
            return c.id === id;
          });
          return choice;
        };

        scope.startOver = function() {
          scope.stack = [];
          scope.local.choices = _.cloneDeep(scope.originalChoices);
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
          scope.local.choices = _.cloneDeep(state.choices);
          scope.landingPlaceChoices = _.cloneDeep(state.landingPlaces);
        };

        scope.itemsPerRow = function() {
          if (scope.model.config.choiceAreaLayout === 'vertical') {
            return 1;
          } else if (scope.model.config.choiceAreaLayout === 'tile') {
            return Number(scope.model.config.itemsPerRow) || (550 / scope.maxWidth);
          } else {
            return 550 / scope.maxWidth;
          }
        };

        scope.getChoiceRows = function() {
          var choices = scope.local.choices;
          return _.range(choices.length / scope.itemsPerRow());
        };

        scope.getChoicesForRow = function(row) {
          var choices = scope.local.choices;
          return choices.slice(row * scope.itemsPerRow(), row * scope.itemsPerRow() + scope.itemsPerRow());
        };

        scope.seeSolution = function(answerArea) {
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
              answerArea,
              '   </div>',
              '   <div class="modal-footer">',
              '     <button class="btn btn-primary" ng-click="ok()">OK</button>',
              '   </div>'
            ].join(""),
            backdrop: true,
            scope: scope.solutionScope
          });
        };

        /* Common container bridge implementations */
        scope.containerBridge = {
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
            scope.editable = e;
          }
        };

        scope.$watch('landingPlaceChoices', function(n) {
          var state = {
            choices: _.cloneDeep(scope.choices),
            landingPlaces: _.cloneDeep(scope.landingPlaceChoices)
          };
          if (!_.isEqual(state, _.last(scope.stack))) {
            scope.stack.push(state);
          }
        }, true);

      }
    };
    return def;
  }];


exports.framework = "angular";
exports.directive = {
  name: "dragAndDropController",
  directive: dragAndDropController
};
