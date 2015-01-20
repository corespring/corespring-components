var answerArea = [
  function() {

    var def = {
      scope: true,
      restrict: 'AE',
      replace: true,
      link: function(scope, element, attrs) {

        scope['class'] = attrs['class'];

        var updateLayout = function(newLayout) {
          var maxWidth = Math.max(Math.min(scope.maxWidth + 25, 550), 120);
          if (newLayout === 'inline') {
            scope.elementStyle = {
              height: (scope.maxHeight + 30) + "px",
              "min-width": maxWidth + "px"
            };
          } else if (newLayout === 'horizontal') {
            scope.elementStyle = {
              "min-height": (scope.maxHeight + 30) + "px",
              "min-width": maxWidth + "px"
            };
          } else {
            scope.elementStyle = {
              "min-height": (scope.maxHeight + 20) + "px",
              "width": maxWidth + "px"
            };
          }
        };

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

        bindAttribute('answerAreaLabel', 'answerAreaLabel');
        bindAttribute('answerAreaLayout', 'layout', updateLayout);

        scope.columnsPerRow = attrs.columnsperrow || 3;

        scope.isMultiple = function() {
          return attrs.cardinality !== 'single';
        };

        var nonEmptyElement = function(c) {
          return c && c.id;
        };

        scope.$watch('editable', function(e) {
          scope.sortableOptions.disabled = !e;
        });

        scope.onDrop = function() {
          scope.dragging.isOut = false;
          scope.local.choices = _.filter(scope.local.choices, nonEmptyElement);
          _.each(scope.landingPlaceChoices, function(lpc, key) {
            scope.landingPlaceChoices[key] = _.filter(lpc, nonEmptyElement);
          });
          scope.$emit('rerender-math', {delay: 1});
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
            var choiceInChoiceArea = _.find(scope.local.choices, function(c) {
              return c.id === scope.dragging.id;
            });
            if (!choiceInChoiceArea) {
              scope.local.choices.push(choiceInLandingPlace);
            }
            scope.landingPlaceChoices[scope.id] = _.filter(scope.landingPlaceChoices[scope.id], function(e) {
              return e.id !== scope.dragging.id;
            });
          });
          scope.$emit('rerender-math', {delay: 1});
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
            if (scope.dragging) {
              if (scope.dragging.fromTarget === scope.id) {
                return false;
              }
              var elem = _.find(scope.landingPlaceChoices[scope.id], function(c) {
                 return c.id === scope.dragging.id;
              });
              return _.isUndefined(elem);
            }
            return true;
          },
          onDrop: 'onDrop',
          onOver: 'overCallback',
          onOut: 'outCallback',
          multiple: true
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
          updateLayout(scope.layout);
        });

        scope.classForChoice = function(choice, idx) {
          if (!scope.correctResponse) {
            return;
          }
          var correctResponse = _.isArray(scope.correctResponse) ? scope.correctResponse : scope.correctResponse[scope.id];
          if (!correctResponse) {
            return;
          }
          var isCorrect;
          if (scope.cardinality === "ordered") {
            isCorrect = correctResponse.indexOf(choice.id) === idx;
          } else {
            isCorrect = correctResponse.indexOf(choice.id) >= 0;
          }

          return isCorrect ? "correct" : "incorrect";
        };


      },
      template: [
        '<div data-drop="true" ng-model="landingPlaceChoices[id]" jqyoui-droppable="droppableOptions"',
        '         data-jqyoui-options="droppableOptions" class="landing-place {{class}}" ng-style="elementStyle" >',
        '    <div class="label-holder" ng-show="answerAreaLabel"><div class="landingLabel">{{answerAreaLabel}}</div>&nbsp;</div>',
        '    <div',
        '      ui-sortable="sortableOptions" ',
        '      ng-model="landingPlaceChoices[id]"',
        '      >',
        '        <div ng-repeat="choice in landingPlaceChoices[id]"',
        '             ng-style="choiceStyle" ',
        '             jqyoui-draggable="{index: {{$index}}, placeholder: true}"',
        '             data-jqyoui-options=""',
        '             ng-model="landingPlaceChoices[id][$index]"',
        '             data-id="{{choice.id}}"',
        '             class="choice {{classForChoice(choice, $index)}}"',
        '             ng-switch="choice.labelType">',
        '           <img class="choice-image" ng-switch-when="image" ng-src="{{choice.imageName}}" />',
        '           <div ng-switch-default="" ng-bind-html-unsafe="choice.label" />',
        '           <div class="sizerHolder" ng-switch="choice.labelType">',
        '             <img class="choice-image" ng-switch-when="image" ng-src="{{choice.imageName}}" />',
        '             <div ng-switch-default="" class="html-holder" ng-bind-html-unsafe="choice.label" />',
        '           </div>',

        '        </div>',
        '    </div>',
        '    <div class="clearfix" />',
        '    <div ng-show="landingPlaceChoices[id].length == 0">&nbsp;</div>',
        '</div>'].join("")

    };
    return def;
  }];


exports.framework = "angular";
exports.directive = {
  name: "answerArea",
  directive: answerArea
};
