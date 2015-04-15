var main = [
  'LogFactory',
  'WiggiWizController',
  'WiggiWizDef',
  function(LogFactory, WiggiWizController, WiggiWizDef) {

    var $log = LogFactory.getLogger('MicroWiggi');

    return {
      restrict: 'A',
      replace: true,
      require: 'ngModel',
      controller: new WiggiWizController(),
      link: new WiggiWizDef(template, link, true).link,
      scope: {
        active: '=?',
        dialogLauncher: '@',
        externalFeatures: '&features',
        featureOverrides: '&',
        formattingDisplay: '@',
        imageService: '&',
        lockedActiveState: '@', //string, if set, lock active to this state
        parentSelector: '@'
      }
    };

    function link(scope, element) {

      scope.lineHeight = 22;
      scope.originalBottomPadding = parseDecimal(element.css('padding-bottom'));

      if (_.isUndefined(scope.lockedActiveState)) {
        scope.active = scope.active === true;
      } else {
        scope.active = scope.lockedActiveState === 'true';
      }

      scope.activate = activate;
      scope.deactivate = deactivate;
      scope.$watch('active', onChangeActive);

      element.on('keyup', adjustHeight);
      element.on('keydown', adjustHeight);

      $('body').on('click', function(e) {
        if (scope.active && $(e.target).closest(element).length === 0) {
          scope.deactivate();
        }
      });

      /**
       * Adds padding to the bottom of the wiggi-wiz-editable div if there is only
       * one "line" of text, or sets the bottom padding to the original value if
       * there is > 1 "line" of text.
       */
      function adjustHeight() {
        if (lineCount() === 1) {
          expand();
        } else {
          shrink();
        }
      }

      function expand(){
        setBottomPadding(scope.originalBottomPadding + scope.lineHeight);
      }

      function shrink(){
        setBottomPadding(scope.originalBottomPadding);
      }

      function setBottomPadding(value) {
        $textField().css({
          'padding-bottom': value + 'px'
        });
      }

      // TODO: This will become unreliable when we have images
      function lineCount() {
        var overallHeight = parseDecimal($textField().height());
        var lineHeight = parseDecimal($textField().css('font-size') + 2);
        return Math.round(overallHeight / lineHeight);
      }

      function parseDecimal(s) {
        return parseInt(s, 10);
      }

      function $textField() {
        return $('.wiggi-wiz-editable', element);
      }

      function activate() {
        $log.debug("activate");
        if (_.isUndefined(scope.lockedActiveState)) {
          scope.active = true;
        }
      }

      function deactivate() {
        $log.debug("deactivate");
        if (_.isUndefined(scope.lockedActiveState)) {
          scope.active = false;
        }
      }

      function onChangeActive(newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        $log.debug("onChangeActive", newValue);
        if (newValue) {
          adjustHeight();
          if (scope.focusCaretAtEnd) {
            scope.focusCaretAtEnd();
          }
        } else {
          shrink();
        }
      }

    }

    function template(config) {
      var placeholderAttr = config.placeholder ? 'placeholder="' + config.placeholder + '"' : '';
      return [
        '<div class="mini-wiggi-wiz" ng-class="{active: active}">',
        '  <div class="wiggi-wiz-editable"',
        placeholderAttr,
        '    contenteditable="true" ',
        '    ng-click="activate()"',
        '   ></div>',
        '  <div class="toolbar">',
        '    <micro-wiggi-toolbar></micro-wiggi-toolbar>',
        '  </div>',
        '</div>'
      ].join('\n');
    }
  }
];

exports.framework = 'angular';
exports.directive = {
  name: "microWiggi",
  directive: main
};