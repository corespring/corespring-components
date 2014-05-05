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

        scope.draggableOptions = {
          revert: 'invalid'
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
              scope.propagateDimension(w + 18, h);
            }
            lastW = w;
            lastH = h;

            if (freq < 1000) {
              freq += 100;
            }
          }
        }, freq);

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

        scope.choiceForId = function(id) {
          var choice = _.find(scope.originalChoices, function(c) {
            return c.id === id;
          });
          return choice;
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
            choices: _.cloneDeep(scope.model.choices),
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
