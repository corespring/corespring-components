var landingPlace = [
  function() {

    var def = {
      scope: true,
      restrict: 'AE',
      replace: true,
      link: function(scope, element, attrs) {

        scope['class'] = attrs['class'];

        var bindAttribute = function(attrName, scopeKey, callback) {
          attrs.$observe(attrName, function(n) {
            if (n) {
              scope[scopeKey] = n;
              if (_.isFunction(callback)) {
                callback(n);
              }
            }
          });
        };

        bindAttribute('landingid', 'id', function(n) {
          scope.landingPlaceChoices[n] = scope.landingPlaceChoices[n] || [];
        });

        bindAttribute('label', 'label');
        bindAttribute('cardinality', 'cardinality', function(n) {
          scope.isMultiple = n !== 'single';
        });

        scope.columnsPerRow = attrs.columnsperrow || 3;

        var nonEmptyElement = function(c) {
          return c && c.id;
        };

        scope.$watch('editable', function(e) {
          scope.sortableOptions.disabled = !e;
        });

        scope.onDrop = function() {
          scope.dragging.isOut = false;
          scope.model.choices = _.filter(scope.model.choices, nonEmptyElement);
          _.each(scope.landingPlaceChoices, function(lpc, key) {
            scope.landingPlaceChoices[key] = _.filter(lpc, nonEmptyElement);
          });
          scope.$emit('rerender-math', 1);
        };

        scope.onStart = function(event) {
          scope.dragging.id = $(event.currentTarget).attr('data-id');
          scope.dragging.fromTarget = scope.id;
        };

        scope.revertFunction = function(isValid) {
          if (isValid) {
            return false;
          }
          scope.$apply(function() {
            var choiceInLandingPlace = _.find(scope.landingPlaceChoices[scope.id], function(c) {
              return c.id === scope.dragging.id;
            });
            var choiceInChoiceArea = _.find(scope.model.choices, function(c) {
              return c.id === scope.dragging.id;
            });
            if (!choiceInChoiceArea) {
              scope.model.choices.push(choiceInLandingPlace);
            }
            scope.landingPlaceChoices[scope.id] = _.filter(scope.landingPlaceChoices[scope.id], function(e) {
              return e.id !== scope.dragging.id;
            });
          });
          scope.$emit('rerender-math', 1);
          return true;
        };

        scope.overCallback = function() {
          scope.dragging.isOut = false;
        };

        scope.outCallback = function() {
          scope.dragging.isOut = true;
        };

        scope.droppableOptions = {
          accept: function(a, b) {
            if (scope.cardinality === 'single' && scope.landingPlaceChoices[scope.id].length > 0) {
              return false;
            }
            return scope.dragging && (scope.dragging.fromTarget !== scope.id);
          },
          onDrop: 'onDrop',
          onOver: 'overCallback',
          onOut: 'outCallback',
          multiple: scope.isMultiple
        };

        scope.sortableOptions = {
          start: function(ev, b) {
            scope.$apply(function() {
              scope.dragging.id = $(b.item).attr('data-id');
              scope.dragging.fromTarget = scope.id;
              scope.revertNext = false;
            });
          },
          beforeStop: function() {
            scope.revertNext = scope.dragging.isOut;

            scope.model.choices = _.filter(scope.model.choices, nonEmptyElement);
            _.each(scope.landingPlaceChoices, function(lpc, key) {
              scope.landingPlaceChoices[key] = _.filter(lpc, nonEmptyElement);
            });

          },
          stop: function() {
            if (scope.revertNext) {
              scope.revertFunction();
            }
            scope.dragging.fromTarget = undefined;

          },

          out: scope.outCallback,
          over: scope.overCallback,
          revert: false
        };

        scope.$watch("maxWidth + maxHeight", function(n) {
          var mw = scope.maxWidth + 25;
          var maxWidth = scope.isMultiple ? (mw * scope.columnsPerRow) : mw;
          if (scope.expandHorizontal) {
            scope.style = "min-height: " + (scope.maxHeight + 20) + "px; min-width: " + maxWidth + "px";
          } else {
            scope.style = "min-height: " + (scope.maxHeight + 20) + "px; width: " + maxWidth + "px";
          }
        });

        scope.classForChoice = function(choice, idx) {
          if (!scope.correctResponse) {
            return;
          }
          var isCorrect;
          if (scope.cardinality === "ordered") {
            isCorrect = scope.correctResponse[scope.id].indexOf(choice.id) === idx;
          } else {
            isCorrect = scope.correctResponse[scope.id].indexOf(choice.id) >= 0;
          }

          return isCorrect ? "correct" : "incorrect";
        };


      },
      template: [
        '    <div data-drop="true" ng-model="landingPlaceChoices[id]" jqyoui-droppable="droppableOptions"',
        '         data-jqyoui-options="droppableOptions" class="landing-place {{class}}" style="{{style}}" >',
        '    <div class="label-holder"><div class="landingLabel">{{label}}</div>&nbsp;</div>',
        '    <div',
        '      ui-sortable="sortableOptions" ',
        '      ng-model="landingPlaceChoices[id]"',
        '      >',
        '        <div ng-repeat-start="choice in landingPlaceChoices[id]"',
        '             ng-style="choiceStyle" ',
        '             jqyoui-draggable="{index: {{$index}}, placeholder: true}"',
        '             data-jqyoui-options=""',
        '             ng-model="landingPlaceChoices[id][$index]"',
        '             data-id="{{choice.id}}"',
        '             class="choice {{classForChoice(choice, $index)}}"',
        '             ng-bind-html-unsafe="choice.label">',
        '        </div>',
        '        <div ng-repeat-end="" class="sizerHolder" style="display: none; position: absolute" ng-bind-html-unsafe="choice.content" />',
        '    </div>',
        '    </div>'].join("")

    };
    return def;
  }];


exports.framework = "angular";
exports.directive = {
  name: "landingPlace",
  directive: landingPlace
};
