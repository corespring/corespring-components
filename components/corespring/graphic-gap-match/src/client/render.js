/* global console, exports */

var main = [
  '$sce', '$log',
  function ($sce, $log) {
    'use strict';

    $log = console;

    var def;

    var idEquals = function (choice) {
      return function (c) {
        return c.id === choice.id;
      };
    };

    var choiceEquals = function (choice) {
      return function (c) {
        return c === choice;
      };
    };

    var link = function (scope, element, attrs) {
      scope.editable = true;
      scope.stack = [];
      scope.containerBridge = {
        setDataAndSession: function (dataAndSession) {
          $log.debug("[graphic gap match] setDataAndSession: ", dataAndSession);
          scope.model = dataAndSession.data.model;
          scope.model.config = _.defaults(scope.model.config || {}, {choiceAreaPosition: "top"});
          scope.choices = _.cloneDeep(scope.model.choices);
          scope.droppedChoices = [];

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.droppedChoices = _.map(dataAndSession.session.answers, function (answer) {
              var choiceForAnswer = _.find(scope.model.choices, idEquals(answer));
              return _.extend(answer, choiceForAnswer);
            });
            scope.choices = _.reject(scope.choices, function (c) {
              return _(dataAndSession.session.answers).pluck('id').contains(c.id);
            });
          }

          scope.stack.push(_.cloneDeep({choices: scope.choices, droppedChoices: scope.droppedChoices}));
        },

        getSession: function () {
          return {
            answers: _(scope.droppedChoices).map(function (o) {
              return _.pick(o, 'id', 'left', 'top', 'width', 'height');
            }).value()
          };
        },

        setResponse: function (response) {
          $log.debug('[graphic gap match] setResponse: ', response);
          scope.response = response;
        },

        setMode: function (newMode) {
        },

        reset: function () {
          scope.droppedChoices = [];
          scope.choices = _.cloneDeep(scope.model.choices);
          scope.response = undefined;
          scope.stack = [_.first(scope.stack)];
        },

        isAnswerEmpty: function () {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function (callback) {
          scope.answerChangeCallback = callback;
        },

        editable: function (e) {
          scope.editable = e;
        }
      };

      scope.undo = function () {
        if (scope.stack.length > 1) {
          scope.stack.pop();
          var state = _.last(scope.stack);
          scope.choices = _.cloneDeep(state.choices);
          scope.droppedChoices = _.cloneDeep(state.droppedChoices);
        }
      };

      scope.startOver = function () {
        scope.stack = [_.first(scope.stack)];
        var state = _.last(scope.stack);
        scope.choices = _.cloneDeep(state.choices);
        scope.droppedChoices = _.cloneDeep(state.droppedChoices);
      };

      scope.correctClass = function (forChoice) {
        if (scope.response && scope.response.feedback) {
          var choice = _.find(scope.response.feedback.choices, function (c) {
            return (c.id === forChoice.id && c.left === forChoice.left && c.top === forChoice.top);
          });
          if (choice) {
            var result = choice.isCorrect ? "correct" : "incorrect";
            return result;
          }
        }
        return "";
      };

      scope.correctAnswerForHotspot = function (hotspot) {
        return _(scope.response.correctResponse).filter(function (c) {
          return c.hotspot === hotspot.id;
        }).map(function (c) {
          var choice = _.find(scope.model.choices, function (ch) {
            return c.id === ch.id;
          });
          return _.merge(c, choice);
        }).value();
      };

      scope.getPlaceholderChoices = function () {
        return _.reject(scope.model.choices, function (c) {
          return !_.isUndefined(_.find(scope.choices, idEquals(c)));
        });
      };

      scope.onDragStart = function (ev, ui, choice) {
        scope.draggedChoice = choice;
      };

      scope.draggableJquiOptions = {
        revert: 'invalid'
      };

      scope.droppableJquiOptions = {
        accept: function () {
          return !_.contains(scope.choices, scope.draggedChoice);
        },
        activeClass: 'dropping'
      };


      scope.dropChoice = function (draggedChoice, newChoice) {
        scope.droppedChoices = _.reject(scope.droppedChoices, choiceEquals(draggedChoice));
        var numberOfDroppedChoices = _(scope.droppedChoices).filter(idEquals(draggedChoice)).size();
        var removeFromChoices = draggedChoice.matchMax && numberOfDroppedChoices >= draggedChoice.matchMax - 1;
        if (removeFromChoices) {
          scope.choices = _.reject(scope.choices, idEquals(draggedChoice));
        } else {
          var currentPosition = _.findIndex(scope.choices, idEquals(draggedChoice));
          scope.choices = _.reject(scope.choices, idEquals(draggedChoice));
          scope.choices.splice(currentPosition, 0, _.pick(draggedChoice, 'id', 'label', 'matchMax'));

        }
        scope.droppedChoices.push(newChoice);
      };

      scope.onDrop = function (ev, ui) {
        var MARGIN = 1;
        var offsetX = ev.clientX - ui.helper.offset().left;
        var offsetY = ev.clientY - ui.helper.offset().top;
        var imageOffset = $(element).find('.background-image').offset();
        var imageWidth = $(element).find('.background-image').width();
        var imageHeight = $(element).find('.background-image').height();

        var choiceWidth = ui.helper.outerWidth();
        var choiceHeight = ui.helper.outerHeight();

        var constrain = function(value, range, maxValue) {
          if (value < 0) {
            return (1 + Math.random() / 2);
          }
          if ((value + range) > maxValue) {
            return maxValue - range - (1 + Math.random() / 2);
          }
          return value;
        };

        var newChoice = _.extend(_.cloneDeep(scope.draggedChoice), {
          left: constrain(ev.clientX - imageOffset.left - offsetX - MARGIN, choiceWidth, imageWidth),
          top: constrain(ev.clientY - imageOffset.top - offsetY - MARGIN, choiceHeight, imageHeight),
          width: ui.helper.outerWidth(),
          height: ui.helper.outerHeight()
        });
        scope.dropChoice(scope.draggedChoice, newChoice);
      };

      scope.onChoiceAreaDrop = function (ev, ui) {
        scope.droppedChoices = _.reject(scope.droppedChoices, function (c) {
          return c === scope.draggedChoice;
        });

        if (!_.find(scope.choices, idEquals(scope.draggedChoice))) {
          var newChoice = _.cloneDeep(scope.draggedChoice);
          delete newChoice.left;
          delete newChoice.top;
          delete newChoice.width;
          delete newChoice.height;
          scope.choices.push(newChoice);
        }
      };

      scope.$watch('droppedChoices', function (n, prev) {
        if (!_.isEqual(n, prev) && _.isFunction(scope.answerChangeHandler)) {
          scope.answerChangeCallback(n);
        }
        var state = _.cloneDeep({choices: scope.choices, droppedChoices: scope.droppedChoices});
        if (!_.isEqual(state, _.last(scope.stack))) {
          scope.stack.push(state);
        }

      }, true);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };

    var choices = function (positons) {
      return [
        '<div ng-if="model.config.choiceAreaPosition == \'' + positons[0] + '\' || model.config.choiceAreaPosition == \'' + positons[1] + '\'"',
        '       class="choices {{model.config.choiceAreaPosition}}"',
        '       data-drop="true"',
        '       jqyoui-droppable="{onDrop: \'onChoiceAreaDrop()\'}"',
        '       data-jqyoui-options="droppableJquiOptions">',
        '  <div class="choice-wrapper" ng-repeat="choice in choices">',
        '    <div class="choice"',
        '         data-drag="editable"',
        '         jqyoui-draggable="{onStart: \'onDragStart(choice)\', placeholder: true}"',
        '         data-jqyoui-options="draggableJquiOptions"',
        '         ng-bind-html-unsafe="choice.label">',
        '    </div>',
        '  </div>',
        '  <div class="choice-wrapper" ng-repeat="choice in getPlaceholderChoices()">',
        '    <div class="choice placeholder"',
        '         ng-bind-html-unsafe="choice.label">',
        '    </div>',
        '  </div>',
        '  <div class="clearfix"></div>',
        '</div>'
      ].join('');
    };

    def = {
      scope: {},
      replace: true,
      restrict: 'EA',
      link: link,
      template: [
        '<div class="view-graphic-gap-match">',
        '  <div class="button-row">',
        '    <button class="btn btn-default" ng-disabled="!editable" ng-click="undo()">Undo</button>',
        '    <button class="btn btn-default" ng-disabled="!editable" ng-click="startOver()">Start Over</button>',
        '  </div>',
        '  <div class="clearfix"></div>',
        '  <div class="main-container {{model.config.choiceAreaPosition}}">',
        choices(['left', 'top']),
        '    <div class="answers">',
        '      <div class="background-image {{response.correctClass}}"',
        '           data-drop="true"',
        '           jqyoui-droppable="{onDrop: \'onDrop()\'}" jqyoui-options="{activeClass: \'dropping\'}" >',
        '        <svg ng-if="model.config.showHotspots" class="hotspots">',
        '          <g ng-repeat="hotspot in model.hotspots">',
        '            <rect ng-if="hotspot.shape == \'rect\'" coords-for-hotspot="hotspot" fill-opacity="0" class="hotspot" />',
        '            <polygon ng-if="hotspot.shape == \'poly\'" coords-for-hotspot="hotspot" fill-opacity="0" class="hotspot" />',
        '          </g>',
        '        </svg>',
        '        <div class="dropped choice {{correctClass(choice)}}"',
        '             ng-repeat="choice in droppedChoices"',
        '             ng-style="{left: choice.left, top: choice.top}"',
        '             data-drag="editable"',
        '             jqyoui-draggable="{onStart: \'onDragStart(choice)\'}"',
        '             data-jqyoui-options="draggableJquiOptions"',
        '             ng-bind-html-unsafe="choice.label">',
        '        </div>',
        '        <img ng-src="{{model.config.backgroundImage.path}}" ng-style="{width: model.config.backgroundImage.width, height: model.config.backgroundImage.height}"/>',
        '      </div>',
        '    </div>',
        choices(['bottom', 'right']),
        '  </div>',
        '  <div feedback="response.feedback.message" correct-class="{{response.correctClass}}"></div>',
        '  <div see-answer-panel ng-if="response && response.correctness === \'incorrect\'">',
        '    <div class="background-image">',
        '      <div ng-repeat="hotspot in model.hotspots"',
        '           coords-for-hotspot="hotspot"',
        '           populate="style"',
        '           class="hotspot"',
        '           ng-class="{withBorder: model.config.showHotspots}">',
        '        <div class="choice correct"',
        '             ng-repeat="choice in correctAnswerForHotspot(hotspot)"',
        '             ng-bind-html-unsafe="choice.label">',
        '        </div>',

        '      </div>',
        '      <img ng-src="{{model.config.backgroundImage.path}}" ng-style="{width: model.config.backgroundImage.width, height: model.config.backgroundImage.height}" />',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

var coordsForHotspot = [
  '$sce', '$log',
  function ($sce, $log) {
    "use strict";

    var def;
    var link = function (scope, element, attrs) {
      scope.$watch('coordsForHotspot', function (hotspot) {
        if (hotspot) {
          var populate = scope.populate || "tag";
          var coords = hotspot.coords;
          if (populate === "tag") {
            if (hotspot.shape === 'rect') {
              $(element).attr('x', coords.left);
              $(element).attr('y', coords.top);
              $(element).attr('width', coords.width);
              $(element).attr('height', coords.height);
            } else if (hotspot.shape === 'poly') {
              var points = [];
              _.each(hotspot.coords, function (c) {
                points.push(c.x);
                points.push(c.y);
              });
              $(element).attr('points', points.join(','));
            }
          } else {
            var style = ["left: " + coords.left + "px",
              "top: " + coords.top + "px",
              "width: " + coords.width + "px",
              "height: " + coords.height + "px"
            ].join(';');
            $(element).attr('style', style);
          }
        }
      });
    };

    def = {
      scope: {
        coordsForHotspot: "=",
        populate: "@"
      },
      restrict: 'EA',
      link: link
    };

    return def;
  }
];


exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: 'coordsForHotspot',
    directive: coordsForHotspot
  }
];