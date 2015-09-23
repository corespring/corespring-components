/* global console,exports */
var dragAndDropController = [
  '$modal',
  '$timeout',
  'CsUndoModel',
  function($modal, $timeout, CsUndoModel) {

    "use strict";

    var def = {
      scope: true,
      restrict: 'AE',
      link: function(scope, element, attrs) {

        scope.dragging = {};
        scope.playerWidth = 550;
        scope.maxWidth = 50;
        scope.maxHeight = 20;

        scope.undoModel = new CsUndoModel();
        scope.undoModel.setGetState(getUndoState);
        scope.undoModel.setRevertState(revertToUndoState);

        scope.onStart = function(event) {
          scope.isDragging = true;
          scope.dragging.id = $(event.currentTarget).attr('data-id');
          scope.dragging.fromTarget = undefined;
        };

        scope.onStop = function(event) {
          scope.isDragging = false;
        };

        scope.draggableOptions = function(choice) {
          return {
            revert: 'invalid',
            placeholder: (!choice || choice.moveOnDrag) ? false : 'keep',
            index: _.indexOf(scope.local.choices, choice),
            onStart: 'onStart',
            onStop: 'onStop'
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

        function updateLayout() {
          if (freq < 1000) {
            freq += 100;
          }
          $timeout(updateLayout, freq);

          if (scope.$$phase || scope.isDragging) {
            return;
          }

          var w = 0,
            h = 0;

          var htmlHolders = $(element).find('.html-holder');
          htmlHolders.each(function(idx, e) {
            var $e = $(e);
            if ($e.outerWidth() > w) {
              w = $e.outerWidth();
            }
            if ($e.outerHeight() > h) {
              h = $e.outerHeight();
            }
          });

          //CO-83 make sure the change applies to vertical placement only
          if (scope.model.config.placementType === 'placement' && scope.model.config.choiceAreaLayout === 'vertical') {
            w = Math.min(w + 8, (scope.playerWidth - 50) / 2);
          }

          if (lastW !== w || lastH !== h) {
            scope.propagateDimension(w, h);
            freq = 100;
          }

          lastW = w;
          lastH = h;
        }

        $timeout(updateLayout, freq);


        function layoutChoices(choices, order) {
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
        }

        function stashOrder(choices) {
          return _.map(choices, function(c) {
            return c.id;
          });
        }

        scope.resetChoices = function(model) {
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

          scope.originalChoices = _.cloneDeep(scope.local.choices);
          scope.$emit('rerender-math', {
            delay: 10,
            element: element[0]
          });
        };

        scope.choiceForId = function(id) {
          var choice = _.find(scope.originalChoices, function(c) {
            return c.id === id;
          });
          return choice;
        };

        scope.itemsPerRow = function() {
          var layout = scope.model.config.choiceAreaLayout;
          if (layout === 'vertical') {
            return 1;
          } else if (layout === 'tile') {
            return Number(scope.model.config.itemsPerRow) || (scope.playerWidth / scope.maxWidth);
          } else {
            //we need to reduce the playerWidth a bit due to paddings, margins, etc.
            return (scope.playerWidth - 50) / scope.maxWidth;
          }
        };

        scope.getChoiceRows = function() {
          var choices = scope.local.choices;
          if (choices) {
            var rows = _.range(choices.length / scope.itemsPerRow());
            return rows;
          }
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
              ' <div class="view-drag-and-drop see-solution">',
              '   <div class="modal-header">',
              '     <h3>Correct Answer</h3>',
              '   </div>',
              '   <div class="modal-body">',
              answerArea,
              '   </div>',
              '   <div class="modal-footer">',
              '     <button class="btn btn-primary" ng-click="ok()">OK</button>',
              '   </div>',
              ' </div>'
            ].join(""),
            backdrop: true,
            scope: scope.solutionScope
          });
          scope.$emit('rerender-math', {
            delay: 100
          });
        };

        /* Common container bridge implementations */
        scope.containerBridge = {
          setMode: function(newMode) {},

          reset: function() {
            scope.resetChoices(scope.rawModel);
            scope.correctResponse = undefined;
            scope.feedback = undefined;
            scope.response = undefined;
            scope.initUndo();
          },

          isAnswerEmpty: function() {
            return _.isEmpty(this.getSession().answers);
          },

          answerChangedHandler: function(callback) {
            scope.answerChangeCallback = callback;
          },

          editable: function(e) {
            scope.editable = e;
          }
        };

        scope.$watch('landingPlaceChoices', function(n, old) {
          if (!_.isEmpty(old) && !_.isEqual(old, n) && _.isFunction(scope.answerChangeCallback)) {
            scope.answerChangeCallback();
          }
          scope.rememberUndoState();
        }, true);

        scope.$watch('local.choices', function(n, old) {
          if (!_.isEmpty(old) && !_.isEqual(old, n) && _.isFunction(scope.answerChangeCallback)) {
            scope.answerChangeCallback();
          }
          scope.rememberUndoState();
        }, true);

        scope.initUndo = function() {
          scope.undoModel.init();
        };

        scope.rememberUndoState = function(){
          scope.undoModel.remember();
        };

        scope.startOver = function() {
          scope.undoModel.startOver();
        };

        scope.undo = function() {
          scope.undoModel.undo();
        };

        function getUndoState() {
          if (scope.local && scope.local.choices && scope.landingPlaceChoices) {
            var state = {
              choices: scope.local.choices,
              landingPlaces: scope.landingPlaceChoices
            };
            return state;
          }
        }

        function revertToUndoState(state) {
          if (state) {
            scope.local.choices = state.choices;
            scope.landingPlaceChoices = state.landingPlaces;
          }
          scope.$emit('rerender-math', {
            delay: 10,
            element: element[0]
          });
        }

      }
    };
    return def;
  }];


exports.framework = "angular";
exports.directive = {
  name: "dragAndDropController",
  directive: dragAndDropController
};