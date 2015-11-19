var main = [

  function() {
    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: function(scope, element, attrs) {
        scope.visible = false;
        scope.open = false;
        scope.showHide = {'true': 'hide', 'false': 'show'};
        scope.toggle = function() {
          scope.open = !scope.open;
        };

        function updateVisible() {
          scope.visible = (scope.mode === 'instructor') && (!_.isEmpty(scope.instructions));
        }

        scope.containerBridge = {

          setDataAndSession: function(dataAndSession) {
          },

          getSession: function() {
            return {};
          },

          setResponse: function(response) {
          },

          setInstructorData: function(data) {
            scope.instructions = data.teacherInstructions;
            updateVisible();
          },

          setMode: function(newMode) {
            scope.mode = newMode;
            updateVisible();
          },

          reset: function() {
            scope.open = false;
          },

          isAnswerEmpty: function() {
            return true;
          },

          answerChangedHandler: function(callback) {
          },

          editable: function(e) {
            scope.editable = e;
          }

        };

        scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      },
      template: [
        '<div class="view-teacher-instructions" ng-click="toggle()" ng-show="visible">',
        '  <div class="toggle-row {{showHide[open.toString()]}}-state">',
        //'    <span class="{{showHide[open]}}-icon"></span>',
        '    <div ng-if="open" style="width: 20px; height: 20px">',
        '      <svg viewBox="-128 129 31 31">',
        '      <rect x="-123.9" y="135.3" style="fill:#D0CAC5;stroke:#E6E3E0;stroke-width:0.75;stroke-linejoin:round;stroke-miterlimit:10;" width="4.1" height="4.1"/>',
        '      <polygon style="fill:#D0CAC5;stroke:#E6E3E0;stroke-width:0.75;stroke-linejoin:round;stroke-miterlimit:10;" points="-119.8,150.4 -119.8,142.2 -125,142.2 -125,144.9 -122.6,144.9 -122.6,150.4 -125.6,150.4-125.6,153.2 -116.8,153.2 -116.8,150.4 				"/>',
        '      <rect x="-124.7" y="134.7" style="fill:#B3ABA4;stroke:#CDC7C2;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" width="4.1" height="4.1"/>',
        '      <polygon style="fill:#B3ABA4;stroke:#CDC7C2;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="-120.6,149.8 -120.6,141.5 -125.8,141.5 -125.8,144.3 -123.3,144.3 -123.3,149.8 -126.4,149.8-126.4,152.5 -117.6,152.5 -117.6,149.8 				"/>',
        '      <rect x="-125.5" y="134" style="fill:#1A9CFF;" width="4.1" height="4.1"/>',
        '      <polygon style="fill:#1A9CFF;" points="-121.4,149.1 -121.4,140.9 -126.5,140.9 -126.5,143.6 -124.1,143.6 -124.1,149.1 -127.1,149.1-127.1,151.9 -118.4,151.9 -118.4,149.1 				"/>',
        '      <line style="fill:none;stroke:#BCE2FF;stroke-width:2;stroke-miterlimit:10;" x1="-98" y1="142" x2="-114.6" y2="142"/>',
        '      <line style="fill:none;stroke:#BCE2FF;stroke-width:2;stroke-miterlimit:10;" x1="-98" y1="146.3" x2="-114.6" y2="146.3"/>',
        '      <line style="fill:none;stroke:#BCE2FF;stroke-width:2;stroke-miterlimit:10;" x1="-104" y1="150.7" x2="-114.6" y2="150.7"/>',
        '      </svg>',
        '    </div>',
        '    <div ng-if="!open" style="width: 20px; height: 20px">',
        '      <svg viewBox="-128 129 31 31">',
        '      <rect x="-123.9" y="135.3" style="fill:#D0CAC5;stroke:#E6E3E0;stroke-width:0.75;stroke-linejoin:round;stroke-miterlimit:10;" width="4.1" height="4.1"/>',
        '      <polygon style="fill:#D0CAC5;stroke:#E6E3E0;stroke-width:0.75;stroke-linejoin:round;stroke-miterlimit:10;" points="-119.8,150.4 -119.8,142.2 -125,142.2 -125,144.9 -122.6,144.9 -122.6,150.4 -125.6,150.4-125.6,153.2 -116.8,153.2 -116.8,150.4 				"/>',
        '      <rect x="-124.7" y="134.7" style="fill:#B3ABA4;stroke:#CDC7C2;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" width="4.1" height="4.1"/>',
        '      <polygon style="fill:#B3ABA4;stroke:#CDC7C2;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="-120.6,149.8 -120.6,141.5 -125.8,141.5 -125.8,144.3 -123.3,144.3 -123.3,149.8 -126.4,149.8-126.4,152.5 -117.6,152.5 -117.6,149.8 				"/>',
        '      <rect x="-125.5" y="134" style="fill:#1A9CFF;" width="4.1" height="4.1"/>',
        '      <polygon style="fill:#1A9CFF;" points="-121.4,149.1 -121.4,140.9 -126.5,140.9 -126.5,143.6 -124.1,143.6 -124.1,149.1 -127.1,149.1-127.1,151.9 -118.4,151.9 -118.4,149.1 				"/>',
        '      <line style="fill:none;stroke:#BCE2FF;stroke-width:2;stroke-miterlimit:10;" x1="-98" y1="142" x2="-114.6" y2="142"/>',
        '      <line style="fill:none;stroke:#BCE2FF;stroke-width:2;stroke-miterlimit:10;" x1="-98" y1="146.3" x2="-114.6" y2="146.3"/>',
        '      <line style="fill:none;stroke:#BCE2FF;stroke-width:2;stroke-miterlimit:10;" x1="-104" y1="150.7" x2="-114.6" y2="150.7"/>',
        '      </svg>',
        '    </div>',
        '    <span class="instructions">Instructions</span>',
        '  </div>',
        '  <div class="text" ng-show="open" ng-bind-html-unsafe="instructions">',
        '  </div>',
        '</div>'
      ].join('')

    };
  }
];

exports.framework = 'angular';
exports.directive = main;