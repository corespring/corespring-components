var def = ['MathJaxService', function(MathJaxService) {
  return {
    restrict: "A",
    scope: {
      response: "=feedbackPopover"
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
              template: '<div class="popover feedback-popover popover-' + popoverClass + '" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
              content: content,
              placement: function(popover, sender) {
                var playerElement = $(element).parents('.corespring-player');
                var playerTop = playerElement.offset().top;
                var elementTop = $(element).offset().top;
                return (elementTop - playerTop > 100) ? "top" : "bottom";
              },
              viewport: ".player-body",
              html: true}
          ).on('shown.bs.popover', function() {
              MathJaxService.parseDomForMath(0);
            }
          );

          $(element).parents('.corespring-player').click(function(e) {
            if ($(e.target).parents('[feedback-popover]').length === 0 && _.isEmpty($(e.target).attr('feedback-popover'))) {
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
