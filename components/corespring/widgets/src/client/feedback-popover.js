var def = ['MathJaxService', '$timeout', function(MathJaxService, $timeout) {
  return {
    restrict: "A",
    scope: {
      response: "=feedbackPopover",
      viewport: '@'
    },
    link: function(scope, element, attrs) {
      scope.$watch('response', function(response) {
        if (_.isUndefined(response)) {
          $(element).popover('destroy');
        } else {
          var title, popoverClass;
          var content = typeof response.feedback === "object" ? response.feedback.message : response.feedback;

          if (_.isEmpty(content) && response.correctness !== "warning") {
            return;
          }

          if (response.correctness === 'warning') {
            title = '&nbsp;';
            content = content || "Please select your answer and press submit.";
            popoverClass = 'warning';
          } else if (response.correctness === 'incorrect') {
            title = '&nbsp;';
            popoverClass = 'incorrect';
          } else if (response.correctness === 'correct') {
            title = '&nbsp;';
            popoverClass = 'correct';
          }

          $(element).popover('destroy');
          $(element).popover({
              title: title,
              template: [
                '<div class="popover feedback-popover popover-' + popoverClass + '" role="tooltip">',
                '  <div class="arrow"></div>',
                '  <h3 class="popover-title"></h3>',
                '  <div class="popover-content"></div>',
                '</div>'
              ].join('\n'),
              content: content,
              placement: 'bottom',
              html: true}
          ).on('show.bs.popover', function(event) {
            $timeout(function() {
              if (scope.viewport && $(scope.viewport).length > 0) {
                var $popover = $(event.target).siblings('.popover');
                var $viewport = $(scope.viewport);

                while ($popover.offset().left < $viewport.offset().left) {
                  $popover.css('left', '+=1px');
                  $('.arrow', $popover).css('left', '-=1px');
                }
                while ($popover.offset().left + $popover.width() >  $viewport.offset().left + $viewport.width()) {
                  $popover.css('left', '-=1px');
                  $('.arrow', $popover).css('left', '+=1px');
                }
              }
            });
          }).on('shown.bs.popover', function() {
            MathJaxService.parseDomForMath(0);
          });

          $('html').click(function(e) {
            if ($(e.target).parents('[feedback-popover]').length === 0
                && _.isEmpty($(e.target).attr('feedback-popover'))) {
              $(element).popover('hide');
            }
          });

        }
      });
    }
  };
}];


exports.framework = "angular";
exports.directive = {
  name: "feedbackPopover",
  directive: def
};
