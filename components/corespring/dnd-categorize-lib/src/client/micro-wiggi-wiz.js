/**
 * A local derivate of mini wiggi without automatic activation/deactivation
 */

(function () {
  var module;

  try {
    module = angular.module('corespring.wiggi-wiz');
  }
  catch (err) {
    module = angular.module('corespring.wiggi-wiz', []);
  }

  module.directive('microWiggiWiz', [
    'WiggiWizController',
    'WiggiWizDef',
    function (WiggiWizController, WiggiWizDef) {

      var def = new WiggiWizDef(template, link, true);

      return {
        controller: new WiggiWizController(),
        link: def.link,
        replace: true,
        require: 'ngModel',
        restrict: 'A',
        scope: {
          active: '=?',
          dialogLauncher: '@',
          externalFeatures: '&features',
          featureOverrides: '&',
          formattingDisplay: '@',
          imageService: '&',
          onEditorClick: '&',
          parentSelector: '@'
        }
      };

      function link(scope, $element) {

        scope.originalBottomPadding = parseInt($element.css('padding-bottom'), 10);
        scope.lineHeight = 22;

        scope.active = scope.active === true;

        $element.on('keyup', adjustHeight);
        $element.on('keydown', adjustHeight);

        scope.$watch('active', onChangeActive);


        //---------------------------------

        function onChangeActive(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          if (newValue) {
            adjustHeight();
            if (scope.focusCaretAtEnd) {
              scope.focusCaretAtEnd();
            }
          } else {
            shrink();
          }
        }

        /**
         * Adds padding to the bottom of the wiggi-wiz-editable div if there is only
         * one "line" of text, or sets the bottom padding to the original value if
         * there is > 1 "line" of text.
         */
        function adjustHeight() {
          // TODO: This will become unreliable when we have images
          function lineCount() {
            var lineHeight = parseInt($textField().css('font-size') + 2, 10);
            var overallHeight = parseInt($textField().height(), 10);
            return Math.round(overallHeight / lineHeight);
          }

          if (lineCount() === 1) {
            $textField().css({
              'padding-bottom': scope.originalBottomPadding + scope.lineHeight + 'px'
            });
          } else {
            shrink();
          }
        }

        function $textField() {
          return $('.wiggi-wiz-editable', $element);
        }

        function shrink() {
          $textField().css({
            'padding-bottom': scope.originalBottomPadding + 'px'
          });
        }
      }

      function template(config) {
        var placeholder = config.placeholder;
        return [
          '<div class="mini-wiggi-wiz" ng-class="{active: active}">',
          '  <div class="wiggi-wiz-editable"',
          (placeholder ? 'placeholder="' + placeholder + '"' : ''),
          '    contenteditable="true"></div>',
          '  <div class="toolbar">',
          '    <micro-wiggi-toolbar></micro-wiggi-toolbar>',
          '  </div>',
          '</div>'
        ].join('\n');
      }
    }
  ]);
})();