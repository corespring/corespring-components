/* global console, exports */

var main = [
  '$sce', '$log', 'CsUndoModel',
  function($sce, $log, CsUndoModel) {
    'use strict';

    $log = console;

    var def;

    var idEquals = function(choice) {
      return function(c) {
        return c.id === choice.id;
      };
    };

    var choiceEquals = function(choice) {
      return function(c) {
        return c === choice;
      };
    };

    var link = function(scope, element, attrs) {
      scope.editable = true;

      scope.undoModel = new CsUndoModel();
      scope.undoModel.setGetState(getState);
      scope.undoModel.setRevertState(revertState);

      scope.containerBridge = {
        setPlayerSkin: function(skin) {
          scope.iconset = skin.iconSet;
        },

        setDataAndSession: function(dataAndSession) {
          $log.debug("[graphic gap match] setDataAndSession: ", dataAndSession);
          scope.model = dataAndSession.data.model;
          scope.model.config = _.defaults(scope.model.config || {}, {
            choiceAreaPosition: "top",
            snapEnabled: true,
            snapSensitivity: 0.2
          });
          scope.choices = _.cloneDeep(scope.model.choices);
          scope.droppedChoices = [];
          scope.fixedWidth =
            scope.model.config.backgroundImage.fixedWidth === undefined ? true : scope.model.config.backgroundImage.fixedWidth;

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.droppedChoices = _.map(dataAndSession.session.answers, function(answer) {
              var choiceForAnswer = _.find(scope.model.choices, idEquals(answer));
              return _.extend(answer, choiceForAnswer);
            });
            scope.choices = _.reject(scope.choices, function(c) {
              return _(dataAndSession.session.answers).pluck('id').contains(c.id);
            });
          }

          scope.undoModel.init();
        },

        getSession: function() {
          return {
            answers: _(scope.droppedChoices).map(function(o) {
              return _.pick(o, 'id', 'left', 'top', 'width', 'height');
            }).value()
          };
        },

        setInstructorData: function(data) {
            this.setResponse({correctness: 'instructor', correctResponse: data.correctResponse});
        },

        setResponse: function(response) {
          $log.debug('[graphic gap match] setResponse: ', response);
          scope.response = response;
          scope.showCorrectAnswerButton = true;
        },

        setMode: function(newMode) {
          scope.mode = newMode;
        },

        reset: function() {
          scope.droppedChoices = [];
          scope.choices = _.cloneDeep(scope.model.choices);
          scope.response = undefined;
          scope.undoModel.init();
          scope.showCorrectAnswerButton = false;
          scope.bridge.answerVisible = false;
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

      function getState() {
        if (scope.choices && scope.droppedChoices) {
          var state = {
            choices: scope.choices,
            droppedChoices: scope.droppedChoices
          };
          return state;
        }
        return null;
      }

      function revertState(state) {
        scope.choices = _.cloneDeep(state.choices);
        scope.droppedChoices = _.cloneDeep(state.droppedChoices);
      }

      scope.correctClass = function(forChoice) {
        if (scope.response && scope.response.feedback) {
          var choice = _.find(scope.response.feedback.choices, function(c) {
            return (c.id === forChoice.id && c.left === forChoice.left && c.top === forChoice.top);
          });
          if (choice) {
            var result = choice.isCorrect ? "correct" : "incorrect";
            return result;
          }
        }
        return "";
      };

      scope.correctAnswerForHotspot = function(hotspot) {
        if (!scope.response) {
          return;
        }
        return _(scope.response.correctResponse).filter(function(c) {
          return c.hotspot === hotspot.id;
        }).map(function(c) {
          var choice = _.find(scope.model.choices, function(ch) {
            return c.id === ch.id;
          });
          return _.merge(c, choice);
        }).value();
      };

      scope.incorrectChoices = function() {
        var correctIds = (scope.response && scope.response.correctResponse) ?
          _.pluck(scope.response.correctResponse, 'id') : [];

        return _.filter(scope.model.choices, function(choice) {
          if (!_.isEmpty(correctIds)) {
            return !_.contains(correctIds, choice.id);
          } else {
            return false;
          }
        });
      };

      scope.getPlaceholderChoices = function() {
        return _.reject(scope.model.choices, function(c) {
          return !_.isUndefined(_.find(scope.choices, idEquals(c)));
        });
      };

      scope.onDragStart = function(ev, ui, choice) {
        scope.draggedChoice = choice;
      };

      scope.draggableJquiOptions = {
        revert: 'invalid'
      };

      scope.droppableJquiOptions = {
        accept: function() {
          return !_.contains(scope.choices, scope.draggedChoice);
        },
        activeClass: 'dropping'
      };

      scope.getOverlappingPercentage = function(rect1, rect2) {
        var r1Area = rect1.width * rect1.height;
        var r2Area = rect2.width * rect2.height;
        var overlappingRectangle = getOverlappingRectangle(rect1, rect2);
        var overlapArea = overlappingRectangle.width * overlappingRectangle.height;
        var smallerRectArea = Math.min(r1Area, r2Area);
        return overlapArea / smallerRectArea;
      };

      scope.snapRectIntoRect = function(rect1, rect2) {
        var r1 = addBottomAndRight(rect1);
        var r2 = addBottomAndRight(rect2);
        if (r1.left < r2.left) {
          r1.left = r2.left + 2;
        }
        if (r1.right > r2.right) {
          r1.left -= (r1.right - r2.right + 2);
        }
        if (r1.top < r2.top) {
          r1.top = r2.top + 2;
        }
        if (r1.bottom > r2.bottom) {
          r1.top -= (r1.bottom - r2.bottom + 2);
        }
        rect1.left = r1.left + Math.random() / 2;
        rect1.top = r1.top + Math.random() / 2;
      };

      scope.snapToClosestHotspot = function(choice) {
        var closestHotspot = _.max(scope.model.hotspots, function(h) {
          return (h.shape !== 'rect') ? -1 : scope.getOverlappingPercentage(choice, h.coords);
        });
        if (closestHotspot.shape === 'rect') {
          var percentWithClosest = scope.getOverlappingPercentage(choice, closestHotspot.coords);
          if (percentWithClosest > scope.model.config.snapSensitivity) {
            scope.snapRectIntoRect(choice, closestHotspot.coords);
          }
        }
      };

      scope.dropChoice = function(draggedChoice, newChoice) {
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
        if (scope.model.config.snapEnabled) {
          scope.snapToClosestHotspot(newChoice);
        }
        scope.droppedChoices.push(newChoice);
      };

      scope.onDrop = function(ev, ui) {
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

      scope.onChoiceAreaDrop = function(ev, ui) {
        scope.droppedChoices = _.reject(scope.droppedChoices, function(c) {
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

      scope.$watch('droppedChoices', function(n, prev) {
        if (n && !_.isEqual(n, prev) && _.isFunction(scope.answerChangeCallback)) {
          scope.answerChangeCallback(n);
        }
        scope.undoModel.remember();
      }, true);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      function addBottomAndRight(rect) {
        var r = _.cloneDeep(rect);
        r.bottom = r.top + r.height;
        r.right = r.left + r.width;
        return r;
      }

      function getOverlappingRectangle(rect1, rect2) {
        var r1 = addBottomAndRight(rect1);
        var r2 = addBottomAndRight(rect2);
        var overlappingRectangle = {left: NaN, top: NaN, width: 0, height: 0};

        overlappingRectangle.right = Math.min(r1.right, r2.right);
        if (r2.left >= r1.left && r2.left <= r1.right) {
          overlappingRectangle.left = r2.left;
        } else if (r1.left >= r2.left && r1.left <= r2.right) {
          overlappingRectangle.left = r1.left;
        }

        overlappingRectangle.bottom = Math.min(r1.bottom, r2.bottom);
        if (r2.top >= r1.top && r2.top <= r1.bottom) {
          overlappingRectangle.top = r2.top;
        } else if (r1.top >= r2.top && r1.top <= r2.bottom) {
          overlappingRectangle.top = r1.top;
        }

        if (!isNaN(overlappingRectangle.left)) {
          overlappingRectangle.width = overlappingRectangle.right - overlappingRectangle.left;
        }
        if (!isNaN(overlappingRectangle.top)) {
          overlappingRectangle.height = overlappingRectangle.bottom - overlappingRectangle.top;
        }
        delete overlappingRectangle.right;
        delete overlappingRectangle.bottom;
        return overlappingRectangle;
      }

    };

    var choices = function(positons, correctness) {
      correctness = correctness || 'all';
      var choices = (correctness === 'incorrect' ?
        [
          '<div class="choice-wrapper" ng-repeat="choice in incorrectChoices()">',
          '  <div class="choice" ng-bind-html-unsafe="choice.label">',
          '  </div>',
          '</div>'
        ] : [
          '<div class="choice-wrapper" ng-repeat="choice in choices">',
          '  <div class="choice"',
          '       data-drag="editable"',
          '       jqyoui-draggable="{onStart: \'onDragStart(choice)\', placeholder: true}"',
          '       data-jqyoui-options="draggableJquiOptions"',
          '       ng-bind-html-unsafe="choice.label">',
          '  </div>',
          '</div>',
          '<div class="choice-wrapper" ng-repeat="choice in getPlaceholderChoices()">',
          '  <div class="choice placeholder"',
          '       ng-bind-html-unsafe="choice.label">',
          '  </div>',
          '</div>'
        ]).join('');

      return [
        '<div ng-if="model.config.choiceAreaPosition == \'' + positons[0] + '\' || model.config.choiceAreaPosition == \'' + positons[1] + '\'"',
        '       class="choices {{model.config.choiceAreaPosition}}"',
        '       data-drop="true"',
        '       jqyoui-droppable="{onDrop: \'onChoiceAreaDrop()\'}"',
        '       data-jqyoui-options="droppableJquiOptions">',
        choices,
        '  <div class="clearfix"></div>',
        '</div>'
      ].join('');
    };

    var correctAnswer = [
      '    <div class="background-image" ng-class="{\'fixed-width\': fixedWidth}">',
      '      <svg class="hotspots">',
      '        <g ng-repeat="hotspot in model.hotspots">',
      '          <rect ng-if="hotspot.shape == \'rect\'" coords-for-hotspot="hotspot" fill-opacity="0" class="hotspot" />',
      '          <polygon ng-if="hotspot.shape == \'poly\'" coords-for-hotspot="hotspot" fill-opacity="0" class="hotspot" />',
      '        </g>',
      '      </svg>',
      '      <div ng-repeat="hotspot in model.hotspots"',
      '           coords-for-hotspot="hotspot"',
      '           populate="style"',
      '           class="hotspot">',
      '        <div class="choice correct"',
      '             ng-repeat="choice in correctAnswerForHotspot(hotspot)"',
      '             ng-bind-html-unsafe="choice.label">',
      '        </div>',
      '      </div>',
      '      <img ng-src="{{model.config.backgroundImage.path}}" ng-style="{width: model.config.backgroundImage.width, height: model.config.backgroundImage.height}" />',
      '    </div>'
    ].join("");

    def = {
      scope: {},
      replace: true,
      restrict: 'EA',
      link: link,
      template: [
        '<div class="view-graphic-gap-match {{mode}} editable-{{editable}}">',
        '  <correct-answer-toggle visible="showCorrectAnswerButton && response.correctness !== \'instructor\' " toggle="bridge.answerVisible"></correct-answer-toggle>',
        '  <div class="clearfix"></div>',
        '  <div class="undo-startover button-row" ng-hide="response || response.correctness === \'instructor\'"">',
        '    <span cs-undo-button-with-model></span>',
        '    <span cs-start-over-button-with-model></span>',
        '  </div>',
        '  <div class="clearfix"></div>',
        '  <div class="main-container {{model.config.choiceAreaPosition}}" ng-hide="(response && response.correctness === \'instructor\')">',
        choices(['left', 'top']),
        '    <div class="answers">',
        '      <div class="background-image {{response.correctClass}}" ng-class="{\'fixed-width\': fixedWidth}"',
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
        '  <div feedback="response.feedback.message" icon-set="{{iconset}}" correct-class="{{response.correctClass}}"></div>',
        '  <div ng-if="bridge.answerVisible">' + correctAnswer + '</div>',
        '  <div class="instructor-response-holder" ng-if="response && response.correctness === \'instructor\'">',
            choices(['left', 'top'], 'incorrect'),
            correctAnswer,
            choices(['bottom', 'right'], 'incorrect'),
        '  </div>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

var coordsForHotspot = [
  '$sce', '$log',
  function($sce, $log) {
    "use strict";

    var def;
    var link = function(scope, element, attrs) {
      scope.$watch('coordsForHotspot', function(hotspot) {
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
              _.each(hotspot.coords, function(c) {
                points.push(c.x);
                points.push(c.y);
              });
              $(element).attr('points', points.join(','));
            }
          } else {
            var style;
            if (hotspot.shape === 'rect') {
              style = ["left: " + coords.left + "px",
                "top: " + coords.top + "px",
                "width: " + coords.width + "px",
                "height: " + coords.height + "px"
              ].join(';');
            } else {
              var leftTopMostPoints = _.min(hotspot.coords, function(c) {
                return c.x + c.y;
              });

              style = ["left: " + (leftTopMostPoints.x + 5) + "px",
                "top: " + (leftTopMostPoints.y + 5) + "px"
              ].join(';');

            }
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