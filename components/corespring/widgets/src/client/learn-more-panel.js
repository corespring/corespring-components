var def = function() {
  return {
    restrict: "AE",
    transclude: true,
    replace: true,
    template: [
      '<div class="panel panel-default learn-more-panel">',
      '  <div class="panel-heading">',
      '    <a data-toggle="collapse" href="#learn-more-feedback">',
      '      <i class="fa fa-lightbulb-o"></i>Learn More',
      '    </a>',
      '  </div>',
      '  <div id="learn-more-feedback" class="panel-body panel-collapse collapse">',
      '    <div ng-transclude></div>',
      '  </div>',
      '</div>'
    ].join('')
  };
};


exports.framework = "angular";
exports.directive = {
  name: "learnMorePanel",
  directive: def
};
