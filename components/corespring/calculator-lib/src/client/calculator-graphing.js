var calculatorGraphing = [

  function() {
    var link = function(scope, elm, attrs, container) {      

    }

    function template() {
      return [
        '<div class=\"calculator-graphing\">Graphing calculator template',
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
  name: "calculatorGraphing",
  directive: calculatorGraphing
};
