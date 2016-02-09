/* global exports */
exports.framework = 'angular';

exports.directive = [
  '$animate',
  '$document',
  '$timeout',
  '$window',
  function(
    $animate,
    $document,
    $timeout,
    $window
  ) {

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, $element, $attrs) {

      var blastOptions = {
        aria: false,
        customClass: 'cst'
      };

      var $theContent = null;
      var ignoreChanges = false;
      var passageNeedsUpdate = false;
      var disableContentChangeWarning = false;

      scope.mode = 'editor';
      scope.numberOfCorrectResponses = 0;
      scope.showPassageEditingWarning = false;

      scope.onClickClearCorrectAnswers = onClickClearCorrectAnswers;
      scope.onClickClearSelections = onClickClearSelections;
      scope.onClickEditContent = onClickEditContent;
      scope.onClickFormatSource = onClickFormatSource;
      scope.onClickSentences = onClickSentences;
      scope.onClickSetAnswers = onClickSetAnswers;
      scope.onClickSetCorrectAnswers = onClickSetCorrectAnswers;
      scope.onClickWords = onClickWords;
      scope.onFormattedPassageChanged = onFormattedPassageChanged;
      scope.onPasteIntoContentArea = onPasteIntoContentArea;

      scope.containerBridge = {
        getModel: getModel,
        setModel: setModel
      };

      scope.$watch('model.cleanPassage', watchCleanPassage);
      scope.$watch('fullModel.correctResponse.value.length', watchCorrectResponseLength);
      scope.$watch('model.choices.length', watchChoicesLength);
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
        passageNeedsUpdate = _.isEmpty(scope.model.passage);
        $theContent = $element.find('.passage-preview .ng-binding');
        bindTokenEvents();
        updatePartialScoring();
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
        $theContent.off('click', '.cst');
        $theContent.on('click', '.cst', onClickToken);
      }

      function onClickText(e) {
        if (scope.mode === 'answers') {
          if ($(e.currentTarget).is('div')) {
            if (makeTokenFromSelection()) {
              updatePassage();
              updateChoices();
              updateCorrectResponses();
              updatePartialScoring();
            }
          }
        }

        function makeTokenFromSelection() {
          var selection = $window.getSelection();
          if (selection.isCollapsed || selection.rangeCount !== 1 || csTokenInSelection(selection)) {
            return false;
          }
          var element = $('<span class="blast cst choice"/>');
          selection.getRangeAt(0).surroundContents(element[0]);
          return true;
        }

        function csTokenInSelection(selection) {
          return $(selection.anchorNode.parentNode).hasClass('cst') ||
            $(selection.focusNode.parentNode).hasClass('cst');
        }
      }

      function onClickToken() {
        var $token = $(this);

        if (scope.mode === 'answers') {
          removeToken($token);
          updatePassage();
          updateChoices();
          updateCorrectResponses();
          updatePartialScoring();
        } else if (scope.mode === 'correct-answers') {
          toggleCorrectness($token);
          updateCorrectResponses();
          updatePartialScoring();
        }
      }

      function removeToken($token){
        $token.prop('outerHTML', $token.html());
      }

      function toggleCorrectness($token){
        if ($token.hasClass('selected')) {
          $token.removeClass('selected');
        } else {
          $token.addClass('selected');
        }
      }

      function getCleanPassage() {
        var $cleanPassage = $theContent.clone();
        $cleanPassage.find('.cst').each(function (index, token) {
          $(token).removeClass('blast');
          $(token).removeClass('choice');
          $(token).removeClass('selected');
        });
        return $cleanPassage.prop('innerHTML');
      }

      function updatePassage() {
        scope.model.passage = $theContent.prop('innerHTML');
      }

      function updateChoices() {
        scope.model.choices = getChoiceIdsFromContent();
      }

      function getChoiceIdsFromContent(){
        var tokens = $theContent.find('.cst');
        return _.range(tokens.length);
      }

      function updateCorrectResponses() {
        scope.fullModel.correctResponse.value = getIdsOfSelectedTokensInContent();
      }

      function updatePartialScoring(){
        scope.numberOfCorrectResponses = getNumberOfCorrectResponses();
      }

      function getIdsOfSelectedTokensInContent(){
        var tokens = $theContent.find('.cst');
        var result = [];
        tokens.each(function(index, token) {
          if ($(token).hasClass('selected')) {
            result.push(index);
          }
        });
        return result;
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

        var model = fullModel.model;
        if (!_.isString(model.cleanPassage)) {
          model.cleanPassage = '';
        }
        if (!_.isString(model.formattedPassage)) {
          model.formattedPassage = '';
        }
        if (!_.isString(model.passage)) {
          model.passage = '';
        }
        if (!_.isArray(model.choices)) {
          model.choices = [];
        }
        if (!_.isObject(model.config)) {
          model.config = {};
        }

        var config = model.config;
        if (isNaN(config.maxSelections)) {
          config.maxSelections = 0;
        }

        //legacy items might not have a cleanPassage
        if(!model.cleanPassage && model.passage){
          model.cleanPassage = removeHtmlTags(model.passage);
        }

        //legacy items might be using the old class name
        if(model.passage.indexOf('cs-token') >= 0){
          model.passage = model.passage.replace(/cs-token/gi, 'cst');
        }

        //legacy items might not have a formatted passage
        if(!model.formattedPassage && model.passage){
          model.formattedPassage = model.passage;
        }

        return fullModel;
      }

      function initPassageFromCleanPassage() {
        passageNeedsUpdate = false;
        scope.model.choices = [];
        scope.fullModel.correctResponse.value = [];
        updatePartialScoring();
        scope.model.passage = plainTextToHtml(removeHtmlTags(scope.model.cleanPassage));
        $theContent.html(scope.model.passage);
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

      function getNumberOfCorrectResponses() {
        return scope.fullModel.correctResponse.value.length;
      }

      function watchCleanPassage(newValue, oldValue) {
        if (newValue === oldValue || oldValue === undefined) {
          return;
        }
        if (disableContentChangeWarning) {
          disableContentChangeWarning = false;
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
            initPassageFromCleanPassage();
            passageNeedsUpdate = true;
          } else {
            disableContentChangeWarning = true;
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

      function onClickFormatSource() {
        if(scope.mode === 'format-source'){
          setMode('editor');
        } else {
          scope.model.formattedPassage = getCleanPassage();
          setMode('format-source');
        }
      }

      function onClickWords() {
        initPassageFromCleanPassage();
        tokenize('word');
      }

      function onClickSentences() {
        initPassageFromCleanPassage();
        tokenize('sentence');
      }

      function onClickClearSelections() {
        $theContent.find('.cst').each(function (index, token) {
          removeToken($(token));
        });
        updatePassage();
        updateChoices();
        updateCorrectResponses();
        updatePartialScoring();

        setMode('answers');
      }

      function onClickClearCorrectAnswers() {
        $theContent.find('.cst').each(function (index, token) {
          $(token).removeClass('selected');
        });
        updateCorrectResponses();
        updatePartialScoring();
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

        $theContent.find('.cst').each(
          function(index, token) {
            scope.model.choices.push(index);
          }
        );

        scope.model.passage = $theContent.prop('innerHTML');
        $timeout(renderChoices, 100);
      }

      function renderChoices() {
        classifyTokens(scope.model.choices, 'choice');
      }

      function classifyTokens(collection, tokenClass) {
        console.log("classifyTokens", collection, tokenClass);
        $theContent.find('.cst').each(function(index, choice) {
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
        scope.model.passage = event[1].getValue();
        $theContent.html(scope.model.passage);
      }

    }

    function template() {
      return [
          '<div class="corespring-select-text-config">',
          '  <div navigator-panel="Design">',
          designPanel(),
          '  </div>',
          '  <div navigator-panel="Scoring">',
          partialScoring(),
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
        instructions(),
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-6">',
        formatSourceButton(),
        autoSelectButtons(),
        '    </div>',
        '    <div class="col-xs-6">',
        clearSelectionButtons(),
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <div class="editor-wrapper" ng-show="mode === \'editor\'">',
        editContent(),
        '      </div>',
        '      <div class="answers-config-wrapper" ng-show="mode === \'answers\' || mode === \'correct-answers\'">',
        setAnswers(),
        '      </div>',
        '      <div ng-show="mode === \'format-source\'">',
        formatSource(),
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

    function editContent(){
      return [
        confirmEditingContentWillDestroySelections(),
        '<textarea',
        '    class="plain-text-area"',
        '    ng-model="model.cleanPassage"',
        '    ng-paste="onPasteIntoContentArea($event)"',
        '></textarea>'
      ].join('');
    }

    function confirmEditingContentWillDestroySelections(){
      return [
        '<div class="confirm-action"',
        '    ng-show="showPassageEditingWarning">',
        '  <div class="action-description">',
        '    <h4>Important</h4>',
        '    <p>If you edit the content, selections and correct answers will be lost.</p>',
        '    <p>Do you want to proceed?</p>',
        '    <p class="confirm-passage-editing-buttons">',
        '      <button class="btn btn-danger"',
        '          ng-click="confirmPassageEditing(true)">Yes',
        '      </button>',
        '      <button class="btn btn-default"',
        '          ng-click="confirmPassageEditing(false)">No',
        '      </button>',
        '    </p>',
        '  </div>',
        '</div>'
      ].join('');
    }

    function setAnswers(){
      return [
        '<div class="passage-wrapper">',
        '  <div class="passage-preview"',
        '      ng-bind-html-unsafe="model.passage"></div>',
        '</div>',
        '<div class="answer-summary">',
        '  <table>',
        '    <tr>',
        '      <td class="text-label">Selections available:</td>',
        '      <td><span class="badge choices-count">{{model.choices.length}}</span></td>',
        '      <td class="spacer"> </td>',
        '      <td class="text-label">Correct answers:</td>',
        '      <td><span class="badge answers-count">{{fullModel.correctResponse.value.length}}</span></td>',
        '    </tr>',
        '  </table>',
        '</div>',
        '<div class="max-selections form-inline">',
        '  <div class="form-group">',
        '    <p class="form-control-static">Maximum number of selections student is allowed to choose (optional):</p>',
        '  </div>',
        '  <div class="form-group">',
        '    <input type="number"',
        '        name="userMaxSelections"',
        '        class="form-control"',
        '        ng-model="model.config.maxSelections"',
        '        min="{{fullModel.correctResponse.value.length}}"/>',
        '  </div>',
        '</div>'
      ].join('');
    }

    function formatSource(){
      return [
        '<div ',
        '  class="xhtml-preview"',
        '  ng-bind-html-unsafe="model.formattedPassage"',
        '  ></div>',
        '<div ',
        '  class="xhtml-editor"',
        '  ng-model="model.formattedPassage"',
        '  ui-ace="{mode: \'html\', useWrapMode : true, onChange: onFormattedPassageChanged}"',
        '  ></div>'
      ].join('');
    }

    function introText() {
      return [
        '<p>',
        '  In Select Text Evidence, a student is asked to highlight evidence to support ',
        '  their answer.',
        '</p>'
      ].join('');
    }

    function instructions() {
      return [
        '<p class="help" ng-show="mode === \'editor\'">',
        '  Add content to window below by typing or cut and pasting. If you need to add ',
        '  formatting, you will be able to do that later.',
        '</p>',
        '<p class="help" ng-show="mode === \'answers\'">',
        '  Use the auto-select feature to make all words or sentences available for selection ',
        '  or use the mouse to make selections. ',
        '</p>',
        '<p class="help" ng-show="mode === \'correct-answers\'">',
        '  Indicate the correct answers by clicking on the appropriate selection. A correct ',
        '  answer may be unselected by clicking again. Use the \'clear correct answers\' button ',
        '  to clear out all correct answers. ',
        '</p>',
        '<p class="help" ng-show="mode === \'format-source\'">',
        '  To format text, add HTML tags to content window below. For selections to work ',
        '  properly, be sure that the order and structure of the cst span tags is kept ',
        '  intact. ',
        '</p>'
      ].join('');
    }

    function autoSelectButtons(){
      return [
        '<div ',
        '  ng-show="mode === \'answers\'"',
        '  >',
        '  <span class="help">Auto-select: </span>',
        '  <button type="button"',
        '      class="btn btn-default btn-sm"',
        '      ng-click="onClickWords()"',
        '      ng-disabled="mode !== \'answers\'"',
        '      >Words',
        '  </button>',
        '  <button type="button"',
        '      class="btn btn-default btn-sm"',
        '      ng-click="onClickSentences()"',
        '      ng-disabled="mode !== \'answers\'"',
        '      >Sentences',
        '  </button>',
        '</div>'
      ].join('');
    }

    function clearSelectionButtons(){
      return [
        '<div class="clear-selection-buttons"',
        '  ng-show="mode === \'answers\' || mode === \'correct-answers\'"',
        '  >',
        '  <button type="button"',
        '      class="btn btn-default btn-sm"',
        '      ng-click="onClickClearSelections()"',
        '      ng-show="mode === \'answers\' && model.choices.length > 0"',
        '      >Clear Selections',
        '  </button>',
        '  <button type="button"',
        '      class="btn btn-default btn-sm"',
        '      ng-click="onClickClearCorrectAnswers()"',
        '      ng-show="mode === \'correct-answers\' && fullModel.correctResponse.value.length > 0"',
        '      >Clear Correct Answers',
        '  </button>',
        '</div>'
      ].join('');
    }

    function formatSourceButton(){
      return [
        '<div class="format-source-button"',
        '  ng-show="(mode === \'editor\' || mode === \'format-source\') && model.cleanPassage !== \'\' && fullModel.correctResponse.value.length !== 0"',
        '  >',
        '  <button type="button"',
        '      class="btn btn-default btn-sm"',
        '      ng-class="{active: mode === \'format-source\'}"',
        '      ng-click="onClickFormatSource()"',
        '      >Format Source',
        '  </button>',
        '</div>'
      ].join('');
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
        '      ng-hide="model.cleanPassage === \'\'"',
        '      >Set Selections',
        '  </button>',
        '  <button type="button"',
        '      class="btn btn-default"',
        '      ng-class="{active: mode === \'correct-answers\'}"',
        '      ng-click="onClickSetCorrectAnswers()"',
        '      ng-hide="model.choices.length === 0"',
        '      >Set Correct Answers',
        '  </button>',
        '</div>'
      ].join('');
    }

    function partialScoring(){
      return [
        '<corespring-partial-scoring-config ',
        '   full-model="fullModel"',
        '   number-of-correct-responses="numberOfCorrectResponses"',
        '></corespring-partial-scoring-config>'
      ].join('');
    }

    function feedbackPanel() {
      return [
        '<corespring-feedback-config ',
        '   full-model="fullModel"',
        '   component-type="corespring-select-text"',
        '></corespring-feedback-config>'
      ].join('');
    }
  }
];