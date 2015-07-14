var def = ['MathJaxService', '$timeout', function(MathJaxService, $timeout) {
  return {
    restrict: "A",
    scope: {
      response: "=feedbackPopover",
      viewport: '@'
    },
    link: function(scope, element, attrs) {
      scope.firstShow = true;
      scope.originalContent = undefined;
      scope.$watch('response', function(response) {
        if (_.isUndefined(response)) {
          $(element).popover('destroy');
          scope.originalContent = undefined;
          scope.firstShow = true;
          $(element).find('.math-prerender').html('');
        } else {
          var title, popoverClass;
          var content = typeof response.feedback === "object" ? response.feedback.message : response.feedback;

          if (_.isEmpty(content) && response.correctness !== "warning") {
            return;
          }
          if (response.correctness === 'warning') {
            title = '&nbsp;';
            content = content || "You did not enter a response.";
            popoverClass = 'warning';
          } else if (response.correctness === 'incorrect') {
            title = '&nbsp;';
            popoverClass = 'incorrect';
          } else if (response.correctness === 'correct') {
            title = '&nbsp;';
            popoverClass = 'correct';
          }

          if ($(element).find('.math-prerender').length == 0) {
            $(element).append('<div class="math-prerender" style="display: none">' + content + '</div>');
          } else {
            $(element).find('.math-prerender').html(content);
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
              content: function() {
                return scope.originalContent || $(element).find('.math-prerender').html();
              },
              placement: function(popover, sender) {
                var playerElement = $(element).parents('.corespring-player');
                var playerTop = playerElement.offset().top;
                var elementTop = $(element).offset().top;
                return (elementTop - playerTop > 100) ? "top" : "bottom";
              },
              html: true}
          ).on('show.bs.popover', function(event) {
              $timeout(function() {
                scope.viewport = scope.viewport || $(element).parents('.player-body');
                if (scope.viewport && $(scope.viewport).length > 0) {
                  var $popover = $(event.target).siblings('.popover');
                  var $viewport = $(scope.viewport);

                  if ($popover.offset().left < $viewport.offset().left) {
                    var deltaLeft = parseFloat($viewport.offset().left) - parseFloat($popover.offset().left);
                    $popover.css('left', '+=' + deltaLeft + 'px');
                    if (scope.firstShow) {
                      $('.arrow', $popover).css('left', "-=" + deltaLeft + 'px');
                    }
                  }
                  if ($popover.offset().left + $popover.width() > $viewport.offset().left + $viewport.width()) {
                    var deltaRight = parseFloat($popover.offset().left + $popover.width()) - parseFloat($viewport.offset().left + $viewport.width());
                    $popover.css('left', '-=' + deltaRight + 'px');
                    if (scope.firstShow) {
                      $('.arrow', $popover).css('left', "+=" + deltaRight + 'px');
                    }
                  }
                  scope.firstShow = false;
                }
              });
            }).on('shown.bs.popover', function() {
              scope.originalContent = $(element).find('.math-prerender').html();
              $(element).find('.math-prerender').html('');
            }).on('hidden.bs.popover', function() {
              $(element).find('.math-prerender').html(scope.originalContent);
            });

          $('html').click(function(e) {
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
