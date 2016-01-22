/* global exports */
exports.framework = 'angular';

exports.directive = [
  '$animate',
  '$document',
  '$timeout',
  '$window',
  'ChoiceTemplates',
  function(
    $animate,
    $document,
    $timeout,
    $window,
    ChoiceTemplates
  ) {

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, $element, $attrs) {

      ChoiceTemplates.extendScope(scope, 'corespring-select-text');

      var blastOptions = {
        aria: false,
        customClass: 'cs-token'
      };

      var $theContent = null;
      var ignoreChanges = false;
      var passageNeedsUpdate = false;
      var allowAssigningCleanPassage = false;

      scope.formattedPassage = '';
      scope.mode = 'editor';
      scope.passage = '';
      scope.showPassageEditingWarning = false;

      scope.onClickAddFormatting = onClickAddFormatting;
      scope.onClickEditContent = onClickEditContent;
      scope.onClickSetAnswers = onClickSetAnswers;
      scope.onClickSetCorrectAnswers = onClickSetCorrectAnswers;
      scope.onClickWords = onClickWords;
      scope.onClickSentences = onClickSentences;
      scope.onClickClearSelections = onClickClearSelections;
      scope.onFormattedPassageChanged = onFormattedPassageChanged;
      scope.onPasteIntoContentArea = onPasteIntoContentArea;


      scope.containerBridge = {
        getModel: getModel,
        setModel: setModel
      };

      scope.$watch('fullModel.correctResponse.value.length', watchCorrectResponseLength);
      scope.$watch('model.choices.length', watchChoicesLength);
      scope.$watch('model.cleanPassage', watchCleanPassage);
      scope.$watch('model.config.maxSelections', watchMaxSelections);

      scope.$emit('registerConfigPanel', $attrs.id, scope.containerBridge);

      //-----------------------------------------------------------------------------

      function getModel() {
        var fullModel = _.cloneDeep(scope.fullModel);
        return fullModel;
      }

      function setModel(fullModel) {
        //we have to use the fullModel bc. the outer scope is watching it for changes
        scope.fullModel = ensureModelStructure(fullModel);
        scope.model = scope.fullModel.model;
        scope.passage = scope.model.config.passage || '';
        passageNeedsUpdate = _.isEmpty(scope.passage);

        $theContent = $element.find('.passage-preview .ng-binding');
        bindTokenEvents();

        scope.updateNumberOfCorrectResponses(getNumberOfCorrectResponses());
        setMode('editor');

        $timeout(initUi, 100);
      }

      function initUi() {
        classifyTokens(scope.model.choices, 'choice');
        classifyTokens(scope.fullModel.correctResponse.value, 'selected');
      }

      function bindTokenEvents() {
        $theContent.off('click');
        $theContent.on('click', onClickText);
        $theContent.off('click', csTokenSelector());
        $theContent.on('click', csTokenSelector(), onClickToken);
      }

      function onClickText(e) {
        if (scope.mode === 'answers') {
          if ($(e.currentTarget).is('div')) {
            if (wrapSelection()) {
              updatePassage();
              updateChoices();
              updateCorrectResponses();
            }
          }
        }

        function wrapSelection() {
          var selection = $window.getSelection();
          if (selection.isCollapsed || selection.rangeCount !== 1 || csTokenInSelection(selection)) {
            return false;
          }
          var element = $('<span class="blast cs-token choice"/>');
          selection.getRangeAt(0).surroundContents(element[0]);
          return true;
        }

        function csTokenInSelection(selection) {
          return $(selection.anchorNode.parentNode).hasClass('cs-token') ||
            $(selection.focusNode.parentNode).hasClass('cs-token');
        }
      }

      function onClickToken() {
        var $token = $(this);

        if (scope.mode === 'answers') {
          $token.removeClass('selected');
          $token.removeClass('choice');
          $token.prop('outerHTML', $token.html());
          updatePassage();
          updateChoices();
          updateCorrectResponses();
        } else if (scope.mode === 'correct-answers') {
          if ($token.hasClass('selected')) {
            $token.removeClass('selected');
          } else {
            $token.addClass('selected');
          }
          updateCorrectResponses();
          scope.updateNumberOfCorrectResponses(getNumberOfCorrectResponses());
        }
      }

      function getCleanPassage() {
        var $cleanPassage = $theContent.clone();
        $cleanPassage.find(csTokenSelector()).each(function (index, token) {
          $(token).removeClass('choice');
          $(token).removeClass('selected');
        });
        return $cleanPassage.prop('innerHTML');
      }

      function updatePassage() {
        scope.passage = scope.model.config.passage = $theContent.prop('innerHTML');
      }

      function updateChoices() {
        var tokens = $theContent.find(csTokenSelector());
        scope.model.choices = _.range(tokens.length);
      }

      function updateCorrectResponses() {
        var tokens = $theContent.find(csTokenSelector());
        var result = [];
        tokens.each(function(index, token) {
          if ($(token).hasClass('selected')) {
            result.push(index);
          }
        });
        scope.fullModel.correctResponse.value = result;
      }

      function ensureModelStructure(fullModel) {
        if (!_.isObject(fullModel.correctResponse)) {
          fullModel.correctResponse = {};
        }
        if (!_.isArray(fullModel.correctResponse.value)) {
          fullModel.correctResponse.value = [];
        }
        if (!fullModel.model) {
          fullModel.model = {};
        }
        if (!_.isString(fullModel.model.cleanPassage)) {
          fullModel.model.cleanPassage = '';
        }
        if (!_.isArray(fullModel.model.choices)) {
          fullModel.model.choices = [];
        }
        if (!_.isObject(fullModel.model.config)) {
          fullModel.model.config = {};
        }
        if (isNaN(fullModel.model.config.maxSelections)) {
          fullModel.model.config.maxSelections = 0;
        }
        if (!_.isString(fullModel.model.config.label)) {
          fullModel.model.config.label = '';
        }
        if (!_.isString(fullModel.model.config.passage)) {
          fullModel.model.config.passage = '';
        }
        return fullModel;
      }

      function initPassageFromCleanPassage() {
        passageNeedsUpdate = false;
        scope.model.choices = [];
        scope.fullModel.correctResponse.value = [];
        scope.passage = scope.model.config.passage = plainTextToHtml(removeHtmlTags(scope.model.cleanPassage));
        $theContent.html(scope.passage);
      }

      function removeHtmlTags(content) {
        //replace p, div and h tags with double line break
        content = content.replace(/<\/(p|div|h\d)>/gi, '\n\n');
        //replace br tags with single line break
        content = content.replace(/<br>/gi, '\n');
        content = content.replace(/<br\/>/gi, '\n');
        //remove all other tags
        content = content.replace(/<[^\>]+>/g, '');
        return content;
      }

      function plainTextToHtml(text) {
        return text.replace(/\n/g, '<br>');
      }

      function csTokenSelector() {
        return '.' + blastOptions.customClass;
      }

      function getNumberOfCorrectResponses() {
        return scope.fullModel.correctResponse.value.length;
      }

      function watchCleanPassage(newValue, oldValue) {
        if (newValue === oldValue || oldValue === undefined) {
          return;
        }
        if (allowAssigningCleanPassage) {
          allowAssigningCleanPassage = false;
          return;
        }
        if (!passageNeedsUpdate && hasAnswers()) {
          warnAboutContentChange(oldValue);
        } else {
          passageNeedsUpdate = true;
        }
      }

      function warnAboutContentChange(oldValue) {
        scope.showPassageEditingWarning = true;
        scope.confirmPassageEditing = function confirmPassageEditing(allow) {
          scope.showPassageEditingWarning = false;
          if (allow) {
            passageNeedsUpdate = true;
          } else {
            allowAssigningCleanPassage = true;
            scope.model.cleanPassage = oldValue;
            passageNeedsUpdate = false;
          }
        };
      }

      function onClickEditContent() {
        setMode('editor');
      }

      function onClickSetAnswers() {
        if (passageNeedsUpdate) {
          initPassageFromCleanPassage();
        }
        if (scope.mode === 'editor' && getNumberOfCorrectResponses() > 0) {
          setMode('correct-answers');
        } else {
          setMode('answers');
        }
      }

      function onClickSetCorrectAnswers() {
        setMode('correct-answers');
      }

      function onClickAddFormatting() {
        scope.formattedPassage = getCleanPassage();
        setMode('add-formatting');
      }

      function onClickWords() {
        initPassageFromCleanPassage();
        tokenize('word');
        setMode('correct-answers');
      }

      function onClickSentences() {
        initPassageFromCleanPassage();
        tokenize('sentence');
        setMode('correct-answers');
      }

      function onClickClearSelections() {
        initPassageFromCleanPassage();
      }

      function setMode(mode) {
        scope.mode = mode;
      }

      function hasAnswers() {
        return scope.model.choices.length || scope.fullModel.correctResponse.value.length;
      }

      function tokenize(type) {
        blastOptions.delimiter = type;
        $theContent.blast(blastOptions);

        $theContent.find(csTokenSelector()).each(
          function(index, token) {
            scope.model.choices.push(index);
          }
        );

        scope.model.config.passage = $theContent.prop('innerHTML');
        $timeout(renderChoices, 100);
      }

      function renderChoices() {
        classifyTokens(scope.model.choices, 'choice');
      }

      function classifyTokens(collection, tokenClass) {
        console.log("classifyTokens", collection, tokenClass);
        $theContent.find(csTokenSelector()).each(function(index, choice) {
          if (_.contains(collection, index)) {
            $(choice).addClass(tokenClass);
          } else {
            $(choice).removeClass(tokenClass);
          }
        });
      }

      function animateBadge(nv, ov, badgeSelector) {
        if (nv !== ov) {
          var c = nv > ov ? 'grow' : 'shrink';
          var badge = $element.find(badgeSelector);
          $animate.addClass(badge, c, function() {
            $timeout(function() {
              $animate.removeClass(badge, c);
            });
          });
        }
      }

      function watchCorrectResponseLength(newValue, oldValue) {
        animateBadge(newValue, oldValue, '.answers-count');
        if (scope.model.config.maxSelections > 0 && scope.model.config.maxSelections < newValue) {
          scope.model.config.maxSelections = newValue;
        }
      }

      function watchChoicesLength(newValue, oldValue) {
        animateBadge(newValue, oldValue, '.choices-count');
      }

      function watchMaxSelections(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (newValue !== 0 && newValue < scope.fullModel.correctResponse.value.length) {
            scope.model.config.maxSelections = oldValue;
          }
        }
      }

      function onPasteIntoContentArea(event) {
        console.log(event.originalEvent.clipboardData.getData('text/plain'));
      }

      function onFormattedPassageChanged(event, editor) {
        //console.log("onFormattedPassageChanged", event[1].getValue());
        scope.passage = scope.model.config.passage = event[1].getValue();
        $theContent.html(scope.passage);
      }

    }

    function template() {
      return [
          '<div class="corespring-select-text-config">',
          '  <div navigator-panel="Design">',
          designPanel(),
          '  </div>',
          '  <div navigator-panel="Scoring">',
          ChoiceTemplates.scoring(),
          '  </div>',
          '</div>'
        ].join("");
    }

    function designPanel() {
      return [
        '<div class="container-fluid">',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        introText(),
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        modeButtons(),
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        helpText(),
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <div class="editor-wrapper"',
        '          ng-show="mode === \'editor\'">',
        '        <div class="confirm-action"',
        '            ng-show="showPassageEditingWarning">',
        '          <div class="action-description">',
        '            <h4>Important</h4>',
        '            <p>If you edit the content, selections and correct answers will be lost.</p>',
        '            <p>Do you want to proceed?</p>',
        '            <p class="confirm-passage-editing-buttons">',
        '              <button class="btn btn-danger"',
        '                  ng-click="confirmPassageEditing(true)">Yes',
        '              </button>',
        '              <button class="btn btn-default"',
        '                  ng-click="confirmPassageEditing(false)">No',
        '              </button>',
        '            </p>',
        '          </div>',
        '        </div>',
        '        <textarea',
        '            class="plain-text-area"',
        '            ng-model="model.cleanPassage"',
        '            ng-paste="onPasteIntoContentArea($event)"',
        '            ></textarea>',
        '      </div>',
        '      <div ng-show="mode === \'add-formatting\'">',
        '        <div ',
        '          class="xhtml-preview"',
        '          ng-bind-html-unsafe="formattedPassage"',
        '          ></div>',
        '        <div ',
        '          class="xhtml-editor"',
        '          ng-model="formattedPassage"',
        '          ui-ace="{mode: \'html\', useWrapMode : true, onChange: onFormattedPassageChanged}"',
        '          ></div>',
        '      </div>',
        '      <div class="answers-config-wrapper"',
        '          ng-show="mode === \'answers\' || mode === \'correct-answers\'">',
        '        <div class="confirm-action"',
        '            ng-show="showSelectionUnitWarning">',
        '          <div class="action-description">',
        '            <h4>Important</h4>',
        '            <p>If you make this change, selections and correct answers will be lost.</p>',
        '            <p>Do you want to proceed?</p>',
        '            <p>',
        '              <button class="btn btn-danger"',
        '                  ng-click="allowSelectionUnitChange()">Yes',
        '              </button>',
        '              <button class="btn btn-default"',
        '                  ng-click="revertSelectionUnitChange()">No',
        '              </button>',
        '            </p>',
        '          </div>',
        '        </div>',
        '        <div ',
        '          ng-hide="mode === \'correct-answers\'"',
        '          >',
        '          <span class="help">Auto-select (optional): </span>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-click="onClickWords()"',
        '              ng-disabled="mode !== \'answers\'"',
        '              >Words',
        '          </button>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-click="onClickSentences()"',
        '              ng-disabled="mode !== \'answers\'"',
        '              >Sentences',
        '          </button>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-click="onClickClearSelections()"',
        '              ng-disabled="mode !== \'answers\'"',
        '              >Clear Selections',
        '          </button>',
        '        </div>',
        '        <div class="passage-wrapper">',
        '          <div class="passage-preview"',
        '              ng-bind-html-unsafe="passage"></div>',
        '        </div>',
        '        <div class="answer-summary">',
        '          <table>',
        '            <tr>',
        '              <td class="text-label">Selections available:</td>',
        '              <td><span class="badge choices-count">{{model.choices.length}}</span></td>',
        '              <td class="spacer"> </td>',
        '              <td class="text-label">Correct answers:</td>',
        '              <td><span class="badge answers-count">{{fullModel.correctResponse.value.length}}</span></td>',
        '            </tr>',
        '          </table>',
        '        </div>',
        '        <div class="max-selections form-inline">',
        '          <div class="form-group">',
        '            <p class="form-control-static">Maximum number of selections student is allowed to choose (optional):</p>',
        '          </div>',
        '          <div class="form-group">',
        '            <input type="number"',
        '                name="userMaxSelections"',
        '                class="form-control"',
        '                ng-model="model.config.maxSelections"',
        '                min="{{fullModel.correctResponse.value.length}}"/>',
        '          </div>',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        feedbackPanel(),
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    }

    function introText() {
      return [
        '<p>',
        '  In Select Text Evidence, a student is asked to highlight evidence to support ',
        '  their evidence.',
        '</p>'
      ].join('');
    }

    function helpText() {
      return [
        '<p class="help" ng-show="mode === \'editor\'">',
        '  Add content to window below by typing or cut and pasting. Text formatting will ',
        '  not be retained. To format text, please set your selections, then use the ',
        '  formatting button to add HTML tags to content.',
        '</p>',
        '<p class="help" ng-show="mode === \'answers\'">',
        '  Highlight words, sentences, or a combination to make available for selection by ',
        '  students. Click again to unselect or use the clear selections button to start over. ',
        '  Optionally, use the auto-select button to make all words or sentences available for ',
        '  selection.',
        '</p>',
        '<p class="help" ng-show="mode === \'correct-answers\'">',
        '  Indicate the correct answers by clicking on the appropriate selection. You can ',
        '  unselect a correct answer by clicking again. (*or you can clear all correct answers ',
        '  by clicking the clear answers button.*- see my question about adding this feature)',
        '</p>',
        '<p class="help" ng-show="mode === \'add-formatting\'">',
        '  To format text, please add HTML tags to content. For the selections to properly work ',
        '  make sure, that the order and structure of the cs-token span tags is kept intact.',
        '</p>'
      ].join('\n');
    }

    function modeButtons() {
      return [
        '<div class="btn-group content" role="group">',
        '  <button type="button"',
        '      class="btn btn-default"',
        '      ng-class="{active: mode === \'editor\'}"',
        '      ng-click="onClickEditContent()"',
        '      >Edit Content',
        '  </button>',
        '</div>',
        '<div class="btn-group selections" role="group">',
        '  <button type="button"',
        '      class="btn btn-default"',
        '      ng-class="{active: mode === \'answers\'}"',
        '      ng-click="onClickSetAnswers()"',
        '      ng-disabled="model.cleanPassage === \'\'"',
        '      >Set Selections',
        '  </button>',
        '  <button type="button"',
        '      class="btn btn-default btn-correct-answers"',
        '      ng-class="{active: mode === \'correct-answers\'}"',
        '      ng-click="onClickSetCorrectAnswers()"',
        '      ng-hide="mode === \'editor\'"',
        '      ng-disabled="model.choices.length === 0"',
        '      >Set Correct Answers',
        '  </button>',
        '</div>',
        '<div class="btn-group formatting" role="group">',
        '  <button type="button"',
        '      class="btn btn-default"',
        '      ng-class="{active: mode === \'add-formatting\'}"',
        '      ng-click="onClickAddFormatting()"',
        '      ng-disabled="fullModel.correctResponse.value.length === 0"',
        '      >Add Formatting',
        '  </button>',
        '</div>'
      ].join('');
    }


    function feedbackPanel() {
      return [
        '<div feedback-panel>',
        '  <div feedback-selector',
        '      fb-sel-label="If correct, show"',
        '      fb-sel-class="correct"',
        '      fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
        '      fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
        '      fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
        '  </div>',
        '  <div feedback-selector',
        '      fb-sel-label="If partially correct, show"',
        '      fb-sel-class="partial"',
        '      fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
        '      fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
        '      fb-sel-default-feedback="{{defaultPartialFeedback}}">',
        '  </div>',
        '  <div feedback-selector',
        '      fb-sel-label="If incorrect, show"',
        '      fb-sel-class="incorrect"',
        '      fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
        '      fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
        '      fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
        '  </div>',
        '</div>'
      ].join('');
    }
  }
];