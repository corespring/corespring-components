var calculatorTemplate = [
  'Calculator',
  function(Calculator) {

    var link = function(scope, elm, attrs, container) {
      var calculator = new Calculator(scope);
      calculator.extendScope(scope, 'calculator-template');

      function click(button){
        calculator.click(button);
      }

      scope.click = click;
    };

    function template() {
      return [
        '<div class=\"calculator {{ calculatorType }}\">',
        '  <div class="results">',
        '    <input class="input-results" ng-readonly="true" ng-model="results" />',
        '  </div>',
        '  <div class="buttons-panel">',
        '    <div class="{{ region }}-pad" ng-repeat="region in types[calculatorType].regions">',
        '      <button ng-repeat="button in regions[region].buttons" ',
        '					id="{{button}}-button"',
        '					class="button {{buttons[button].cssClass}}"',
        '					title="{{buttons[button].name}}"',
        '					ng-click="click(buttons[button])"><div ng-bind-html-unsafe="buttons[button].symbol"></div></button>',
        '    </div>',
        '</div>'
      ].join('');
    }
    
    return {
      restrict: 'EA',
      replace: true,
      link: link,
      scope: {
      	calculatorType: '@'
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
