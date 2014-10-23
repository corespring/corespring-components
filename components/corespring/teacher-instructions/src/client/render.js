var main = [

  /** The directive does nothing at the moment, it basically just removes itself. **/
  function() {
    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: function() {},
      template: ''
    };
  }

];

exports.framework = 'angular';
exports.directive = main;