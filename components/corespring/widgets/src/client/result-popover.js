var def = function() {
  return {
    restrict: "A",
    scope: {
      response: "=resultPopover"
    },
    link: function(scope, element, attrs) {
      scope.$watch('response', function(response) {
        if (_.isUndefined(response)) {
          $(element).popover('destroy');
        } else {
          var title, popoverClass;
          var content = response.feedback;

          if (response.correctness === 'warning') {
            title = 'Oops. Try again.';
            content = "There seems to be an error in your submission";
            popoverClass = 'warning';
          } else if (response.correctness === 'incorrect') {
            title = 'Incorrect.';
            popoverClass = 'incorrect';
          } else if (response.correctness === 'correct') {
            title = 'Correct.';
            popoverClass = 'correct';
          }

          $(element).popover('destroy');
          $(element).popover({
              title: title,
              template: '<div class="popover result-popover popover-' + popoverClass + '" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
              content: content,
              placement: 'bottom',
              html: true}
          ).popover('show');

          $(element).parent().find('.popover').click(function() {
            $(element).popover('hide');
          });

        }
      });
    }
  };
};


exports.framework = "angular";
exports.directive = {
  name: "resultPopover",
  directive: def
};
