var calculatorTemplate = [
  'Calculator',
  function(Calculator) {

    var calculator;

    var link = function(scope, elm, attrs, container) {

      var inputResults = elm.find('.input-results');
      calculator = new Calculator(scope, inputResults);
      calculator.extendScope(scope, 'calculator-template');

      function click(button, type, logic){
        calculator.click(button, type, logic);
      }

      scope.click = click;
    };

    function template() {
      return [
        '<div class=\"calculator {{ calculatorType }}\">',
        '  <div class="results">',
        '    <input id="results" class="input-results" ng-readonly="true" />',
        '  </div>',
        '  <div class="buttons-panel">',
        '    <div class="{{ region }}-pad" ng-repeat="region in types[calculatorType].regions">',
        '      <button ng-repeat="button in regions[region].buttons" ',
        '					id="{{button}}-button"',
        '					class="button {{buttons[button].cssClass}}"',
        '					title="{{buttons[button].name}}"',
        '					ng-click="click(buttons[button], this)"><div ng-bind-html-unsafe="buttons[button].symbol"></div></button>',
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
