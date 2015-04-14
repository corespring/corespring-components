/* global console, exports */

var main = [
  '$sce', '$log',
  function($sce, $log) {

    "use strict";

    var def;

    var link = function(scope, element, attrs) {

      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          $log.debug("hotspot", dataAndSession);
          scope.model = dataAndSession.data.model;
          scope.choices = _.cloneDeep(scope.model.choices);
          scope.droppedChoices = [];
        },

        getSession: function() {
          return {
            answers: scope.response
          };
        },

        setResponse: function(response) {
          console.log('hotspot response ', response);
        },

        setMode: function(newMode) {
        },

        reset: function() {
          scope.serverResponse = undefined;
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

      scope.dropChoiceDone = function(data, evt) {
        var imagePosition = $('.background-image').offset();
        console.log("img", imagePosition);
        console.log("evt", evt);
        data.left = evt.x - imagePosition.left - evt.event.offsetX - 5;
        data.top = evt.y - imagePosition.top - evt.event.offsetY - 5;
        console.log("Dropped: ", data.left, data.top);
        scope.droppedChoices.push(data);
      }
      ;
      scope.dropDroppedChoiceDone = function(data, evt) {
        delete data.left;
        delete data.top;
        scope.choices.push(data);
      };

      scope.dragChoiceDone = function(data, evt) {
        console.log("drag start: ", evt);
        scope.choices = _.reject(scope.choices, data);
      };

      scope.dragDroppedChoiceDone = function(data, evt) {
        scope.droppedChoices = _.reject(scope.droppedChoices, data);
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      replace: true,
      restrict: 'EA',
      link: link,
      template: [
        '<div class="view-hotspot">',
        '  <div class="background-image" ng-drop="true" ng-drop-success="dropChoiceDone($data,$event)">',
        '    <svg class="hotspots">',
        '      <rect ng-repeat="hotspot in model.hotspots" coords-for-hotspot="hotspot"  style="stroke:#ff0000; fill: #0000ff" />',
        '    </svg>',
        '    <div class="dropped choice" ng-repeat="choice in droppedChoices" style="left: {{choice.left}}px; top: {{choice.top}}px" ng-drag="true" ng-drag-data="choice" ng-drag-success="dragDroppedChoiceDone($data,$event)">{{choice.label}}</div>',
        '    <img src="http://www.newthinktank.com/wp-content/uploads/2011/08/US-Map-Detailed-EPS.png" />',
        '  </div>',
        '  <div class="choices" ng-drop="true" ng-drop-success="dropDroppedChoiceDone($data,$event)">',
        '    <div class="choice" ng-repeat="choice in choices" ng-drag="true" ng-drag-data="choice" ng-drag-success="dragChoiceDone($data,$event)">{{choice.label}}</div>',
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