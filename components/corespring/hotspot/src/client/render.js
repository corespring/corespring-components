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

      function removeExplicitStyles() {
        $(element).find('.choices').attr('style', '');
        $(element).find('.background-image').attr('style', '');
      }

      function alignChoiceAreaToImage() {
        if (_.contains(['left', 'right'], scope.model.config.choiceAreaPosition)) {
          removeExplicitStyles();
          var imgHeight = $(".background-image img").outerHeight();
          var choicesHeight = $(element).find('.choices').outerHeight();
          var biggerHeight = Math.max(imgHeight, choicesHeight);
          $(element).find('.choices').height(biggerHeight);
          $(element).find('.background-image').height(biggerHeight);
        }
      }

      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          $log.debug("[hotspot] setDataAndSession: ", dataAndSession);
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

          removeExplicitStyles();
          alignChoiceAreaToImage();
        },

        getSession: function() {
          return {
            answers: _(scope.droppedChoices).map(function(o) {
              return _.pick(o, 'id', 'left', 'top')
            }).value()
          };
        },

        setResponse: function(response) {
          $log.debug('[hotspot] setResponse: ', response);
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
          console.log('e', e);
          scope.editable = e;
        }
      };

      scope.onDragStart = function(ev, ui, choice) {
        scope.draggedChoice = choice;
      };

      scope.draggableJquiOptions = {
        revert: 'invalid',
      };

      scope.droppableJquiOptions = {
        accept: function() {
          return !_.contains(scope.choices, scope.draggedChoice);
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

      scope.$watch(function() {
        alignChoiceAreaToImage();
      });

      $(element).find('.background-image img').load(function() {
        alignChoiceAreaToImage();
      });

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
        '         jqyoui-draggable="{onStart: \'onDragStart(choice)\'}"',
        '         data-jqyoui-options="draggableJquiOptions"',
        '         ng-bind-html-unsafe="choice.label">',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    };

    def = {
      scope: {},
      replace: true,
      restrict: 'EA',
      link: link,
      template: [
        '<div class="view-hotspot">',
        choices(['left', 'top']),
        '  <div class="background-image" data-drop="true" jqyoui-droppable="{onDrop: \'onDrop()\'}">',
        '    <svg ng-if="" class="hotspots">',
        '      <rect ng-repeat="hotspot in model.hotspots" coords-for-hotspot="hotspot" fill-opacity="0" style="stroke:#ff0000" />',
        '    </svg>',
        '    <div class="dropped choice"',
        '         ng-repeat="choice in droppedChoices"',
        '         style="left: {{choice.left}}px; top: {{choice.top}}px"',
        '         data-drag="editable"',
        '         jqyoui-draggable="{onStart: \'onDragStart(choice)\'}"',
        '         data-jqyoui-options="draggableJquiOptions"',
        '         ng-bind-html-unsafe="choice.label">',
        '    </div>',
        '    <img ng-src="{{model.config.backgroundImage}}" />',
        '  </div>',
        choices(['bottom', 'right']),
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
          var coords = hotspot.coords;
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