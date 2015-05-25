var calculatorScientific = [

  function() {
    var link = function(scope, elm, attrs, container) {      

    }

    function template() {
      return [
        '<div class=\"calculator-scientific\">Scientific calculator template',
        '  <div>Not yet implemented</div>',
        '</div>',
      ].join('');
    }
    
    return {
      restrict: 'EA',
      replace: true,
      link: link,
      scope: {
      },
      template: template()
    };
  }
];

exports.framework = 'angular';
exports.directive = {
  name: "calculatorScientific",
  directive: calculatorScientific
};
