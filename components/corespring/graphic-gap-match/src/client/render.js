/* global console, exports */

var main = [
  '$sce', '$log',
  function($sce, $log) {
    $log = console;

    "use strict";

    var def;

    var idEquals = function(choice) {
      return function(c) {
        return c.id === choice.id;
      }
    };


    var link = function(scope, element, attrs) {
      scope.editable = true;
      scope.stack = [];
      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          $log.debug("[graphic gap match] setDataAndSession: ", dataAndSession);
          scope.model = dataAndSession.data.model;
          scope.choices = _.cloneDeep(scope.model.choices);
          scope.droppedChoices = [];

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.droppedChoices = _.map(dataAndSession.session.answers, function(answer) {
              var choiceForAnswer = _.find(scope.model.choices, idEquals(answer));
              return _.extend(answer, choiceForAnswer);
            });
            scope.choices = _.reject(scope.choices, function(c) {
              return _(dataAndSession.session.answers).pluck('id').contains(c.id);
            });
          }

          scope.stack.push(_.cloneDeep({choices: scope.choices, droppedChoices: scope.droppedChoices}));
        },

        getSession: function() {
          return {
            answers: _(scope.droppedChoices).map(function(o) {
              return _.pick(o, 'id', 'left', 'top', 'width', 'height')
            }).value()
          };
        },

        setResponse: function(response) {
          $log.debug('[graphic gap match] setResponse: ', response);
          scope.response = response;
        },

        setMode: function(newMode) {
        },

        reset: function() {
          scope.droppedChoices = [];
          scope.choices = _.cloneDeep(scope.model.choices);
          scope.response = undefined;
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

      scope.undo = function() {
        if (scope.stack.length > 1) {
          scope.stack.pop();
          var state = _.last(scope.stack);
          scope.choices = _.cloneDeep(state.choices);
          scope.droppedChoices = _.cloneDeep(state.droppedChoices);
        }
      };

      scope.startOver = function() {
        scope.stack = [_.first(scope.stack)];
        var state = _.last(scope.stack);
        scope.choices = _.cloneDeep(state.choices);
        scope.droppedChoices = _.cloneDeep(state.droppedChoices);
      };

      scope.correctClass = function(forChoice) {
        if (scope.response && scope.response.feedback) {
          var choice = _.find(scope.response.feedback.choices, function(c) {
            return c.id === forChoice.id;
          });
          if (choice) {
            return choice.isCorrect ? "correct" : "incorrect";
          }
        }
        return "";
      };

      scope.correctAnswerForHotspot = function(hotspot) {
        return _(scope.response.correctResponse).filter(function(c) {
          return c.hotspot === hotspot.id;
        }).map(function(c) {
          var choice = _.find(scope.model.choices, function(ch) {
            return c.id === ch.id;
          });
          return _.merge(c, choice);
        }).value();
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
        }
      };

      scope.onDrop = function(ev, ui) {
        var MARGIN = 2;
        var offsetX = ev.clientX - ui.helper.offset().left;
        var offsetY = ev.clientY - ui.helper.offset().top;

        var imageOffset = $(element).find('.background-image').offset();
        var newChoice = _.extend(scope.draggedChoice, {
          left: ev.clientX - imageOffset.left - offsetX - MARGIN,
          top: ev.clientY - imageOffset.top - offsetY - MARGIN,
          width: ui.helper.outerWidth(),
          height: ui.helper.outerHeight()
        });
        scope.choices = _.reject(scope.choices, idEquals(scope.draggedChoice));
        scope.droppedChoices = _.reject(scope.droppedChoices, idEquals(scope.draggedChoice));
        scope.droppedChoices.push(newChoice);
      };

      scope.onChoiceAreaDrop = function(ev, ui) {
        scope.droppedChoices = _.reject(scope.droppedChoices, idEquals(scope.draggedChoice));
        var newChoice = _.cloneDeep(scope.draggedChoice);
        delete newChoice.left;
        delete newChoice.top;
        delete newChoice.width;
        delete newChoice.height;
        scope.choices.push(newChoice);
      };

      scope.$watch('droppedChoices', function(n, prev) {
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

    var choices = function(positons) {
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
        '  <div class="choice-wrapper" ng-repeat="choice in droppedChoices">',
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
        '    <button class="btn btn-default" ng-click="undo()">Undo</button>',
        '    <button class="btn btn-default" ng-click="startOver()">Start Over</button>',
        '  </div>',
        '  <div class="clearfix"></div>',
        '  <div class="main-container {{model.config.choiceAreaPosition}}">',
        choices(['left', 'top']),
        '    <div class="background-image" data-drop="true" jqyoui-droppable="{onDrop: \'onDrop()\'}">',
        '      <svg ng-if="model.config.showHotspots" class="hotspots">',
        '        <rect ng-repeat="hotspot in model.hotspots" coords-for-hotspot="hotspot" fill-opacity="0" class="hotspot" />',
        '      </svg>',
        '      <div class="dropped choice {{correctClass(choice)}}"',
        '           ng-repeat="choice in droppedChoices"',
        '           style="left: {{choice.left}}px; top: {{choice.top}}px"',
        '           data-drag="editable"',
        '           jqyoui-draggable="{onStart: \'onDragStart(choice)\'}"',
        '           data-jqyoui-options="draggableJquiOptions"',
        '           ng-bind-html-unsafe="choice.label">',
        '      </div>',
        '      <img ng-src="{{model.config.backgroundImage}}" />',
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
       '             ng-class="{withBorder: model.config.showHotspots}">',
        '      <div class="choice correct"',
        '           ng-repeat="choice in correctAnswerForHotspot(hotspot)"',
        '           ng-bind-html-unsafe="choice.label">',
        '      </div>',

        '      </div>',
        '      <img ng-src="{{model.config.backgroundImage}}" />',
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
  function($sce, $log) {
    "use strict";

    var def;
    var link = function(scope, element, attrs) {
      scope.$watch('coordsForHotspot', function(hotspot) {
        if (hotspot) {
          var populate = scope.populate || "tag";
          var coords = hotspot.coords;
          if (populate == "tag") {
            $(element).attr('x', coords.left);
            $(element).attr('y', coords.top);
            $(element).attr('width', coords.width);
            $(element).attr('height', coords.height);
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