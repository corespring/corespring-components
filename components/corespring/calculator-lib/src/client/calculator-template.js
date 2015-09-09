var calculatorTemplate = [
  'Calculator',
  function(Calculator) {

    var link = function(scope, elm, attrs, container) {
      var calculator = new Calculator(scope);
      calculator.extendScope(scope, 'calculator-template');

      function mouseup(button){
        scope.pressedButton = '';
        calculator.click(button);
      }

      function mousedown(button){
        scope.pressedButton = button;
      }

      function isPressed(button){
        return scope.pressedButton === button;
      }

      scope.mouseup = mouseup;
      scope.mousedown = mousedown;
      scope.isPressed = isPressed;
    };

    function template() {
      return [
        '<div class="calculator" ng-class="calculatorType">',
        '  <i class="close-icon fa fa-times-circle" ng-click="onCloseCallback()"></i>',
        '  <div class="results">',
        '    <input class="input-results" ng-readonly="true" ng-model="results" />',
        '  </div>',
        '  <div class="buttons-panel">',
        '    <div class="{{ regions[region].cssClass }}-pad" ng-repeat="region in types[calculatorType].regions">',
        '      <button ng-repeat="button in regions[region].buttons" ',
        '					id="{{button}}-button"',
        '					class="button {{buttons[button].cssClass}}"',
        '         ng-class="{active : isPressed(button)}"',
        '					title="{{buttons[button].name}}"',
        '					ng-mousedown="mousedown(button)"',
        '         ng-mouseup="mouseup(buttons[button])"><div ng-bind-html="buttons[button].symbol"></div></button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    }
    
    return {
      restrict: 'EA',
      replace: true,
      link: link,
      scope: {
      	calculatorType: '@',
        onCloseCallback: '&onCloseCallback'
      },
      template: template()
    };
  }
];

exports.framework = 'angular';
exports.directive = {
  name: "calculatorTemplate",
  directive: calculatorTemplate
};
