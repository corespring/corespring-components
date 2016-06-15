exports.framework = 'angular';
exports.directive = [
  '$timeout',
  'MathJaxService',
  FunctionEntryDirective
];

function FunctionEntryDirective($timeout, MathJaxService) {

  return {
    link: link,
    replace: true,
    restrict: 'AE',
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    var renderedHelpContent;

    scope.popupVisible = false;
    scope.helpOn = false;
    scope.editable = true;

    scope.containerBridge = {
      answerChangedHandler: answerChangedHandler,
      editable: setEditable,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty,
      reset: reset,
      setDataAndSession: setDataAndSession,
      setInstructorData: setInstructorData,
      setMode: setMode,
      setPlayerSkin: setPlayerSkin,
      setResponse: setResponse
    };

    scope.hasFeedback = hasFeedback;

    scope.$watch('answer', watchAnswer);
    scope.$watch('response', watchResponse);

    element.on('show.bs.popover', triggerIcon(true));
    element.on('hide.bs.popover', triggerIcon(false));

    $('html').click(onClickHtml);
    scope.$on('$destroy', onDestroy);

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    //---------------------------------------------------------------
    // only functions below
    //---------------------------------------------------------------

    function shouldShowFormattingHelp() {
      if (!scope.editable) {
        return false;
      }
      if (scope.question && scope.question.config && scope.question.config.hasOwnProperty('showFormattingHelp')) {
        return !!scope.question.config.showFormattingHelp;
      }

      return true;
    }

    function helpPopover(args) {
      return $(element).find('.text-input').popover(args);
    }

    function resetHintPopover() {
      helpPopover('destroy');

      if (shouldShowFormattingHelp()) {
        helpPopover({
          content: function() {
            if(!renderedHelpContent){
              renderedHelpContent = $($(element).find('.hidden-math').html());
              cleanMathSoItDoesNotGetRenderedAgain(renderedHelpContent);
            }
            return renderedHelpContent;
          },
          title: 'Hints',
          html: true,
          placement: 'bottom'
        }).on('shown.bs.popover', function() {
          $(element).find('.popover').click(hideHelpPopover);
        }).on('hide.bs.popover', function() {
          $(element).find('.popover').unbind('click', hideHelpPopover);
        });
      }
    }

    function cleanMathSoItDoesNotGetRenderedAgain(renderedHelpContent) {
      renderedHelpContent.find('script').remove();
      renderedHelpContent.find('math').remove();
      renderedHelpContent.find('*').removeAttr('id');
      renderedHelpContent.find('*').removeAttr('data-mathml');
    }

    function setPlayerSkin(skin) {
      scope.iconset = skin.iconSet;
    }

    function setDataAndSession(dataAndSession) {
      scope.question = dataAndSession.data.model;
      scope.session = dataAndSession.session || {};
      scope.answer = scope.session.answers;
      resetHintPopover();
    }

    function getSession() {
      return {
        answers: scope.answer
      };
    }

    function setInstructorData(data) {
      scope.answer = data.correctResponse.equation;
      this.setResponse({
        correctness: 'correct'
      });
    }

    // sets the server's response
    function setResponse(response) {
      helpPopover('destroy');
      response.feedback = {
        correctness: response.correctness,
        message: response.feedback
      };
      scope.correctClass = response.correctness;
      if (_.isEmpty(scope.answer)) {
        scope.correctClass = 'warning';
        response.correctness = 'warning';
      }
      scope.feedback = response.feedback;
      scope.response = response;
    }

    function setMode(value) {
      scope.playerMode = value;
    }

    function reset() {
      scope.answer = undefined;
      scope.correctClass = undefined;
      scope.response = undefined;
      resetHintPopover();
    }

    function isAnswerEmpty() {
      return _.isEmpty(this.getSession().answers);
    }

    function answerChangedHandler(callback) {
      scope.$watch("answer", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          callback();
        }
      }, true);
    }

    function setEditable(e) {
      scope.editable = e;
      resetHintPopover();
    }

    function onDestroy() {
      $('html').unbind('click', onClickHtml);
      helpPopover('destroy');
    }

    function onClickHtml(e) {
      if (!($(element).has(e.target).length)) {
        $(element).find('.popover').popover('hide');
      }
    }

    function hideHelpPopover() {
      helpPopover('hide');
    }

    function hasFeedback() {
      return scope.instructorResponse || scope.response;
    }

    function watchAnswer() {
      scope.inputClass = (scope.answer && scope.answer.trim().length > 0) ? 'filled-in' : '';
    }

    function watchResponse() {
      var correctnessMap = {
        'warning': 'nothing-submitted',
        'partial': 'partially-correct'
      };
      scope.iconKey = scope.response ?
        (_.has(correctnessMap, scope.response.correctness) ? correctnessMap[scope.response.correctness] : scope.response.correctness) : '';
    }

    function triggerIcon(popupVisible) {
      return function() {
        scope.popupVisible = popupVisible;
      };
    }
  }

  function helpContent() {
    return [
      '<ul class="help-content" style="text-align:left;padding-left:10px;">',
      '  <li>For \\(2 \\cdot 2\\), enter \\( 2*2 \\)</li>',
      '  <li>For \\( 3y \\), enter \\( 3y \\) or \\( 3*y \\)</li>',
      '  <li>For \\( \\frac{1}{x} \\), enter \\( 1 / x \\)</li>',
      '  <li>For \\( \\frac{1}{xy} \\), enter \\( 1 / (x*y) \\)</li>',
      '  <li>For \\( \\frac{2}{x+3} \\), enter \\( 2 / (x+3) \\)</li>',
      '  <li>For \\( x^{y} \\), enter \\( x \\) ^ \\( y \\)</li>',
      '  <li>For \\( x^{2} \\), enter \\(( x \\) ^ \\( 2 )\\)</li>',
      '  <li>For \\( 1 \\frac{x}{y} \\), enter \\(1 \\) \\( x/y \\)</li>',
      '  <li>For \\( \\sqrt{x} \\), enter \\sqrt(x)</li>',
      '</ul>'
    ].join('');
  }

  function template() {
    return [
      '<div class="view-function-entry"',
      '    ng-class="{\'with-feedback\': hasFeedback()}">',
      '  <span class="text-input">',
      '    <input type="text"',
      '        ng-disabled="!editable"',
      '        ng-model="answer"',
      '        class="form-control {{inputClass}} {{correctClass}}"/>',
      '  </span>',
      '  <div class="feedback-icon"',
      '      feedback-popover="response"',
      '      ng-if="!isInstructorResponse()">',
      '    <svg-icon open="{{popupVisible}}"',
      '        category="{{feedback && feedback.message ? \'feedback\' : \'\'}}"',
      '        key="{{iconKey}}"',
      '        shape="square"',
      '        icon-set="{{iconset}}"/>',
      '  </div>',
      '  <div ng-show="response.comments"',
      '      class="well"',
      '      ng-bind-html-unsafe="response.comments"></div>',
      '  <div class="hidden-math">',
      ' ' + helpContent(),
      '  </div>',
      '</div>'
    ].join('\n');
  }
}