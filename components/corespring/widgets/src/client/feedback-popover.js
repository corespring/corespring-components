exports.framework = "angular";
exports.directive = {
  name: "feedbackPopover",
  directive: ['MathJaxService', '$timeout', FeedbackPopoverDirective]
};

function FeedbackPopoverDirective(MathJaxService, $timeout) {

  return {
    restrict: "A",
    scope: {
      response: "=feedbackPopover",
      state: '=?feedbackPopoverState',
      viewport: '@'
    },
    link: link
  };


  function link(scope, element, attrs) {

    scope.firstShow = true;
    scope.originalContent = undefined;
    scope.state = 'closed';
    $(element).append('<div class="math-prerender" style="display: none"></div>');

    function destroy() {
      scope.originalContent = undefined;
      scope.firstShow = true;
      $('html').unbind('click', onClickHtml);
      $(element).find('.math-prerender').html('');
      $(element).popover('destroy');
    }

    function onClickHtml(e) {
      if ($(e.target).parents('[feedback-popover]').length === 0 && _.isEmpty($(e.target).attr('feedback-popover'))) {
        $(element).popover('hide');
      }
    }

    scope.$on('$destroy', function() {
      destroy();
    });

    scope.$watch('response', function(response) {
      if (_.isUndefined(response)) {
        hidePopover();
      } else {
        showPopover(response);
      }
    });

    function hidePopover() {
      destroy();
    }

    function showPopover(response) {
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
      } else if (response.correctness === 'partial') {
        title = '&nbsp;';
        popoverClass = 'partial';
      } else if (response.correctness === 'instructor') {
        popoverClass = 'instructor';
      }

      var cls = attrs['class'] ? (_.map(attrs['class'].split(' '), function(cls) {
        return cls.trim() + '-popover';
      }).join(' ')) : '';
      popoverClass = popoverClass + ' ' + cls;

      $(element).find('.math-prerender').html(content);
      MathJaxService.parseDomForMath(0, $(element).find('.math-prerender')[0]);

      $(element).popover('destroy');
      var popoverId = 'corespring-popover-' + _.uniqueId();
      var popover = $(element).popover({
        title: title,
        template: [
                '<div class="popover tip-popover feedback-popover popover-' + popoverClass + ' ' + popoverId + '" role="tooltip">',
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
      });

      if (popover) {
        popover.on('show.bs.popover', function(event) {
          $timeout(function() {
            $('[feedback-popover]').each(function() {
              if (element[0] !== this) {
                $(this).popover('hide');
              }
            });
            scope.viewport = scope.viewport || $(element).parents('.player-body');
            if (scope.viewport && $(scope.viewport).length > 0) {
              var $popover = $(element).parents('.corespring-player').find('.popover.' + popoverId);
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
        });
        popover.on('shown.bs.popover', function() {
          scope.originalContent = $(element).find('.math-prerender').html();
          $(element).find('.math-prerender').html('');
          $('html').click(onClickHtml);
        });
        popover.on('hide.bs.popover', function() {
          $('html').unbind('click', onClickHtml);
          scope.state = 'closed';
        });
        popover.on('hidden.bs.popover', function() {
          $(element).find('.math-prerender').html(scope.originalContent);
        });
      }
    }
  }
}