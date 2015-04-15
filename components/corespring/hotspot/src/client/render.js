/* global console, exports */

var main = [
  '$sce', '$log',
  function($sce, $log) {
    $log = console;

    "use strict";

    var def;

    var link = function(scope, element, attrs) {

      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          $log.debug("hotspot", dataAndSession);
          scope.model = dataAndSession.data.model;
          scope.choices = _.cloneDeep(scope.model.choices);
          scope.droppedChoices = [];

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.droppedChoices = _.map(dataAndSession.session.answers, function(a) {
              var choiceForAnswer = _.find(scope.model.choices, function(c) {
                return c.id === a.id;
              });
              return _.extend(a, choiceForAnswer);
            });
            scope.choices = _.reject(scope.choices, function(c) {
              return _(dataAndSession.session.answers).pluck('id').contains(c.id);
            });
          }
        },

        getSession: function() {
          return {
            answers: _(scope.droppedChoices).map(function(o) {
              return _.pick(o, 'id', 'left', 'top')
            }).value()
          };
        },

        setResponse: function(response) {
          console.log('hotspot response ', response);
        },

        setMode: function(newMode) {
        },

        reset: function() {
          scope.droppedChoices = [];
          scope.choices = _.cloneDeep(scope.model.choices);
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

      scope.onDragStart = function(ev, ui, choice) {
        console.log('drag start');
        scope.draggedChoice = choice;

      };

      scope.draggableJquiOptions = {
        revert: 'invalid'
      };

      var idEquals = function(choice) {
        return function(c) {
          return c.id === choice.id;
        }
      };

      scope.onDrop = function(ev, ui) {
        var MARGIN = 5;
        var offsetX = ev.clientX - ui.helper.offset().left;
        var offsetY = ev.clientY - ui.helper.offset().top;

        var imageOffset = $('.background-image').offset();
        var newChoice = _.extend(scope.draggedChoice, {
          left: ev.clientX - imageOffset.left - offsetX - MARGIN,
          top: ev.clientY - imageOffset.top - offsetY - MARGIN
        });
        scope.choices = _.reject(scope.choices, idEquals(scope.draggedChoice));
        scope.droppedChoices = _.reject(scope.droppedChoices, idEquals(scope.draggedChoice));
        scope.droppedChoices.push(newChoice);
      };

      scope.onChoiceAreaDrop = function(ev, ui) {
        console.log("Dropping In Choice Area: ", scope.draggedChoice);
        scope.droppedChoices = _.reject(scope.droppedChoices, idEquals(scope.draggedChoice));
        var newChoice = _.cloneDeep(scope.draggedChoice);
        delete newChoice.left;
        delete newChoice.top;
        scope.choices.push(newChoice);
      };


      scope.$watch('droppedChoices', function(n, prev) {
        if (_.isFunction(scope.answerChangeHandler) && !_.isEqual(n, prev)) {
          scope.answerChangeCallback(n);
        }
      }, true);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      replace: true,
      restrict: 'EA',
      link: link,
      template: [
        '<div class="view-hotspot">',
        '  {{droppedChoices}}',
        '  <div class="background-image" data-drop="true" jqyoui-droppable="{onDrop: \'onDrop()\'}">',
        '    <svg class="hotspots">',
        '      <rect ng-repeat="hotspot in model.hotspots" coords-for-hotspot="hotspot" fill-opacity="0" style="stroke:#ff0000" />',
        '    </svg>',
        '    <div class="dropped choice" ng-repeat="choice in droppedChoices" style="left: {{choice.left}}px; top: {{choice.top}}px" data-drag="true" jqyoui-draggable="{onStart: \'onDragStart(choice)\'}" data-jqyoui-options="draggableJquiOptions">{{choice.label}}</div>',
        '    <img ng-src="{{model.config.backgroundImage}}" />',
        '  </div>',
        '  <div class="choices" data-drop="true" jqyoui-droppable="{onDrop: \'onChoiceAreaDrop()\'}">',
        '    <div class="choice" ng-repeat="choice in choices" data-drag="true" jqyoui-draggable="{onStart: \'onDragStart(choice)\'}" data-jqyoui-options="draggableJquiOptions">{{choice.label}}</div>',
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
      scope.coords = function(hotspot) {
        return hotspot.coords;
        var coords = hotspot.coords.split(",");
        return {
          x: coords[0],
          y: coords[1],
          x1: coords[2],
          y1: coords[3],
          height: coords[3] - coords[1],
          width: coords[2] - coords[0]
        };
      };

      scope.$watch('coordsForHotspot', function(hotspot) {
        console.log('h', hotspot);
        if (hotspot) {
          var coords = scope.coords(hotspot);
          $(element).attr('x', coords.left);
          $(element).attr('y', coords.top);
          $(element).attr('width', coords.width);
          $(element).attr('height', coords.height);
        }
      });
    };
    def = {
      scope: {
        coordsForHotspot: "="
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