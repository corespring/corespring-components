var def = ['MathJaxService', '$timeout', function(MathJaxService, $timeout) {
  return {
    restrict: "A",
    scope: {
      response: "=feedbackPopover",
      viewport: '@',
      state: '=?feedbackPopoverState'
    },
    link: function(scope, element, attrs) {
      scope.firstShow = true;
      scope.originalContent = undefined;
      scope.state = 'closed';
      $(element).append('<div class="math-prerender" style="display: none"></div>');
      scope.$watch('response', function(response) {
        if (_.isUndefined(response)) {
          $(element).popover('destroy');
          scope.originalContent = undefined;
          scope.firstShow = true;
          $(element).find('.math-prerender').html('');
        } else {
          var title, popoverClass;
          var content = typeof response.feedback === "object" ? response.feedback.message : response.feedback;
          var cls = attrs.class ? (_.map(attrs.class.split(' '), function(cls) {
            return cls.trim() + '-popover';
          }).join(' ')) : '';

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
          } else if (response.correctness === 'partial') {
            title = '&nbsp;';
            popoverClass = 'partial';
          } else if (response.correctness === 'instructor') {
            popoverClass = 'instructor';
          }

          popoverClass = popoverClass + ' ' + cls;

          $(element).find('.math-prerender').html(content);
          MathJaxService.parseDomForMath(0, $(element).find('.math-prerender')[0]);
          $(element).popover('destroy');
          $(element).popover({
              title: title,
              template: [
                '<div class="popover tip-popover feedback-popover popover-' + popoverClass + '" role="tooltip">',
                '  <div class="arrow"></div>',
                '  <h3 class="popover-title"></h3>',
                '  <div class="popover-content"></div>',
                '</div>'
              ].join('\n'),
              container: element.parents('.corespring-player'),
              content: function() {
                return scope.originalContent || $(element).find('.math-prerender').html();
              },
              placement: function(popover, sender) {
                var playerElement = $(element).parents('.corespring-player');
                var playerTop = playerElement.offset().top;
                var elementTop = $(element).offset().top;
                return (elementTop - playerTop > 100) ? "top" : "bottom";
              },
              html: true
            }
          ).on('show.bs.popover', function(event) {
            $timeout(function() {
              $('[feedback-popover]').each(function () {
                if (element[0] !== this) {
                  $(this).popover('hide');
                }
              });
              scope.viewport = scope.viewport || $(element).parents('.player-body');
              if (scope.viewport && $(scope.viewport).length > 0) {
                var $popover = $(event.target).siblings('.popover');
                var $viewport = $(scope.viewport).parent();
                var padding = 5;

                if (scope.firstShow) {
                  scope.arrowPosition = parseFloat($('.arrow', $popover).css('left'));
                  scope.firstShow = false;
                }

                if ($popover.offset().left < $viewport.offset().left + padding) {
                  var deltaLeft = parseFloat($viewport.offset().left) - parseFloat($popover.offset().left) + padding;
                  $popover.css('left', '+=' + deltaLeft + 'px');
                  $('.arrow', $popover).css('left', scope.arrowPosition - deltaLeft);
                }
                if ($popover.offset().left + $popover.width() > $viewport.offset().left + $viewport.width() - padding) {
                  var deltaRight = parseFloat($popover.offset().left + $popover.width()) - parseFloat($viewport.offset().left + $viewport.width()) + padding;
                  $popover.css('left', '-=' + deltaRight + 'px');
                  $('.arrow', $popover).css('left', scope.arrowPosition + deltaRight);
                }
              }
              scope.state = 'open';
            });
          }).on('shown.bs.popover', function() {
            scope.originalContent = $(element).find('.math-prerender').html();
            $(element).find('.math-prerender').html('');
          }).on('hide.bs.popover', function() {
            scope.state = 'closed';
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
