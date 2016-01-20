/* global exports */
exports.framework = 'angular';

exports.directive = [
  '$animate',
  '$timeout',
  'ChoiceTemplates',
  function(
    $animate,
    $timeout,
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


      scope.mode = "editor";
      scope.showPassageEditingWarning = false;

      scope.deleteAll = deleteAll;
      scope.onClickEditContent = onClickEditContent;
      scope.onClickSetAnswers = onClickSetAnswers;
      scope.onClickSetCorrectAnswers = onClickSetCorrectAnswers;
      scope.onClickWords = onClickWords;
      scope.onClickSentences = onClickSentences;
      scope.onClickClearSelections = onClickClearSelections;
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
        scope.fullModel = setDefaults(fullModel);
        scope.model = scope.fullModel.model;
        passageNeedsUpdate = _.isEmpty(scope.model.config.passage);

        $theContent = $element.find('.passage-preview .ng-binding');
        bindTokenEvents();

        scope.updateNumberOfCorrectResponses(getNumberOfCorrectResponses());
        setMode("editor");

        $timeout(initUi, 100);
      }

      function setDefaults(fullModel){
        if(!_.isObject(fullModel.correctResponse)){
          fullModel.correctResponse = {};
        }
        if(!_.isArray(fullModel.correctResponse.value)){
          fullModel.correctResponse.value = [];
        }
        if(!fullModel.model){
          fullModel.model = {};
        }
        if(!_.isString(fullModel.model.cleanPassage)){
          fullModel.model.cleanPassage = '';
        }
        if(!_.isArray(fullModel.model.choices)){
          fullModel.model.choices = [];
        }
        if(!_.isObject(fullModel.model.config)){
          fullModel.model.config = {};
        }
        if(isNaN(fullModel.model.config.maxSelections)){
          fullModel.model.config.maxSelections = 0;
        }
        if(!_.isString(fullModel.model.config.label)){
          fullModel.model.config.label = '';
        }
        if(!_.isString(fullModel.model.config.passage)){
          fullModel.model.config.passage = '';
        }
        return fullModel;
      }

      function initPassageFromCleanPassage() {
        passageNeedsUpdate = false;
        scope.model.choices = [];
        scope.fullModel.correctResponse.value = [];
        scope.model.config.passage = plainTextToHtml(removeHtmlTags(scope.model.cleanPassage));
        $theContent.html(scope.model.config.passage);
      }

      function indexOfCorrectAnswer(id) {
        return scope.fullModel.correctResponse.value.indexOf(id);
      }

      function isCorrectAnswer(id) {
        return indexOfCorrectAnswer(id) >= 0;
      }

      function addCorrectAnswer(id) {
        if (!isCorrectAnswer(id)) {
          scope.fullModel.correctResponse.value.push(id);
        }
      }

      function removeCorrectAnswer(id) {
        if (isCorrectAnswer(id)) {
          scope.fullModel.correctResponse.value.splice(indexOfCorrectAnswer(id), 1);
        }
      }

      function indexOfChoice(id) {
        return scope.model.choices.indexOf(id);
      }

      function isChoice(id) {
        return indexOfChoice(id) >= 0;
      }

      function addChoice(id) {
        if (!isChoice(id)) {
          scope.model.choices.push(id);
        }
      }

      function removeChoice(id) {
        if (isChoice(id)) {
          scope.model.choices.splice(indexOfChoice(id), 1);
        }
      }

      function removeHtmlTags(content) {
        //replace p, div and h tags with double line break
        content = content.replace(/<\/(p|div|h\d)>/gi, "\n\n");
        //replace br tags with single line break
        content = content.replace(/<br>/gi, "\n");
        content = content.replace(/<br\/>/gi, "\n");
        //remove all other tags
        content = content.replace(/<[^\>]+>/g, "");
        return content;
      }

      function plainTextToHtml(text) {
        return text.replace(/\n/g, '<br>');
      }

      function getNestedProperty(obj, key, defaultValue) {
        var result = key.split(".").reduce(function(o, x) {
          return (typeof o === "undefined") ? o : o[x];
        }, obj);
        return typeof result === "undefined" ? (arguments.length > 2 ? defaultValue : result) : result;
      }

      function csTokenSelector() {
        return '.' + blastOptions.customClass;
      }

      function getNumberOfCorrectResponses(){
        return scope.fullModel.correctResponse.value.length;
      }

      function bindTokenEvents() {
        $theContent.off('click', csTokenSelector());
        $theContent.on('click', csTokenSelector(), onClickToken);
      }

      function onClickToken() {
        var $token = $(this);
        var tokenId = $token.attr('id');

        if(scope.mode === "answers"){
          $token.removeClass("selected");
          $token.removeClass("choice");
          removeChoice(tokenId);
          removeCorrectAnswer(tokenId);
          $token.prop('outerHTML', $token.html());
        }
        else if(scope.mode === "correct-answers") {
          if (isCorrectAnswer(tokenId)) {
            $token.removeClass("selected");
            removeCorrectAnswer(tokenId);
          } else {
            $token.addClass("selected");
            addCorrectAnswer(tokenId);
          }
          scope.updateNumberOfCorrectResponses(getNumberOfCorrectResponses());
        }
      }

      function initUi() {
        classifyTokens(scope.model.choices, "choice");
        classifyTokens(scope.fullModel.correctResponse.value, "selected");
      }

      function watchCleanPassage(newValue, oldValue) {
        if (newValue === oldValue || oldValue === undefined) {
          return;
        }
        if(allowAssigningCleanPassage){
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
        setMode("editor");
      }

      function onClickSetAnswers() {
        if (passageNeedsUpdate) {
          initPassageFromCleanPassage();
        }
        setMode("answers");
      }

      function onClickSetCorrectAnswers() {
        setMode("correct-answers");
      }

      function onClickWords(){
        initPassageFromCleanPassage();
        tokenize("word");
        setMode("correct-answers");
      }

      function onClickSentences(){
        initPassageFromCleanPassage();
        tokenize("sentence");
        setMode("correct-answers");
      }

      function onClickClearSelections(){
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
            var tokenId = "cs-token-" + index;
            $(token).attr("id", tokenId);
            scope.model.choices.push(tokenId);
          }
        );

        scope.model.config.passage = $theContent.prop('innerHTML');
        $timeout(renderChoices, 100);
      }

      function renderChoices(){
        classifyTokens(scope.model.choices, "choice");
      }

      function classifyTokens(collection, tokenClass) {
        var $existingChoices = $theContent.find('.' + tokenClass);
        var existingChoices = [];
        var removedChoices = [];

        if ($existingChoices.length > 0) {
          existingChoices = _.map($existingChoices, function(choice){
            $(choice).attr('id');
          });
          removedChoices = _.difference(existingChoices, collection);
          collection = _.difference(collection, existingChoices);
        }

        _.forEach(removedChoices, function(tokenId){
          $theContent.find('#' + tokenId).removeClass(tokenClass);
        });

        _.forEach(collection, function(tokenId){
          $theContent.find('#' + tokenId).addClass(tokenClass);
          console.log(tokenId, $theContent.find('#' + tokenId).length, $theContent.find('#' + tokenId).attr("class"));
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
        animateBadge(newValue, oldValue, ".answers-count");
        if (scope.model.config.maxSelections > 0 && scope.model.config.maxSelections < newValue) {
          scope.model.config.maxSelections = newValue;
        }
      }

      function watchChoicesLength(newValue, oldValue) {
        animateBadge(newValue, oldValue, ".choices-count");
      }

      function watchMaxSelections(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (newValue !== 0 && newValue < scope.fullModel.correctResponse.value.length) {
            scope.model.config.maxSelections = oldValue;
          }
        }
      }

      function deleteAll() {
        scope.model.choices = [];
        scope.model.cleanPassage = "";
        scope.model.config.label = "";
        scope.model.config.selectionUnit = "word";
        scope.model.config.availability = "all";
        scope.model.config.passage = "";
        scope.model.config.maxSelections = 0;
        scope.fullModel.correctResponse.value = [];
        setMode("editor");
      }

      function onPasteIntoContentArea(event) {
        console.log(event.originalEvent.clipboardData.getData('text/plain'));
      }

    }

    function template() {
      return [
          '<div class="cs-select-text-config">',
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
        '      <p>',
        '        In Select Text Evidence, a student is asked to highlight evidence to support their evidence.',
        '      </p>',
        '      <p class="intro">',
        '        Highlight words, sentences or a combination to make available for selection by students',
        '        Use the auto-select button to make all words or sentences available for selection',
        '      </p>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <div class="btn-group toggles"',
        '          role="group">',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-class="{active: mode === \'editor\'}"',
        '              ng-click="onClickEditContent()"',
        '             >Edit Content',
        '          </button>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-class="{active: mode === \'answers\'}"',
        '              ng-click="onClickSetAnswers()"',
        '              ng-show="mode === \'editor\'"',
        '              ng-disabled="model.cleanPassage === \'\'"',
        '             >Set Selections',
        '          </button>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-class="{active: mode === \'answers\'}"',
        '              ng-click="onClickSetAnswers()"',
        '              ng-hide="mode === \'editor\'"',
        '             >Set Selections',
        '          </button>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-class="{active: mode === \'correct-answers\'}"',
        '              ng-click="onClickSetCorrectAnswers()"',
        '              ng-hide="mode === \'editor\'"',
        '              ng-disabled="model.choices.length === 0"',
        '             >Set Correct Answers',
        '          </button>',
        '      </div>',
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
        '            <p>',
        '              <button class="btn btn-danger"',
        '                  ng-click="confirmPassageEditing(true)">Yes',
        '              </button>',
        '              <button class="btn btn-default"',
        '                  ng-click="confirmPassageEditing(false)">No',
        '              </button>',
        '            </p>',
        '          </div>',
        '        </div>',
        '        <textarea ',
        '          class="plain-text-area" ',
        '          ng-model="model.cleanPassage" ',
        '          ng-paste="onPasteIntoContentArea($event)" ',
        '        ></textarea>',
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
        '        <div>',
        '          <span class="help">Auto-select (optional): </span>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-click="onClickWords()"',
        '              ng-disabled="mode !== \'answers\'"',
        '            >Words',
        '          </button>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-click="onClickSentences()"',
        '              ng-disabled="mode !== \'answers\'"',
        '            >Sentences',
        '          </button>',
        '          <button type="button"',
        '              class="btn btn-default"',
        '              ng-click="onClickClearSelections()"',
        '              ng-disabled="mode !== \'answers\'"',
        '            >Clear Selections',
        '          </button>',
        '        </div>',
        '        <div class="passage-wrapper">',
        '          <div class="passage-preview"',
        '              ng-bind-html-unsafe="model.config.passage"></div>',
        '        </div>',
        '        <div class="answer-summary">',
        '           <table>',
        '             <tr><td class="text-label">Selections available: </td><td><span class="badge choices-count">{{model.choices.length}}</span></td></tr>',
        '             <tr><td class="text-label">Correct answers: </td><td><span class="badge answers-count">{{fullModel.correctResponse.value.length}}</span></td></tr>',
        '           </table>',
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
        '      <div ng-show="mode === \'delete\'">',
        '        <div class="alert alert-danger"',
        '            role="alert">',
        '          <h4>Are you sure?</h4>',
        '          <p>This will permanently delete the passage and any set of answers.</p>',
        '          <p>',
        '            <button class="btn btn-danger"',
        '                ng-click="deleteAll()">Yes',
        '            </button>',
        '            <button class="btn btn-default"',
        '                ng-click="setEditorMode()">No',
        '            </button>',
        '          </p>',
        '        </div>',
        '      </div>',
        '      <div class="pull-right delete-icon-button"',
        '          ng-click="setDeleteMode()"',
        '          ng-disabled="model.config.passage === \'\'"',
        '          ng-show="mode === \'editor\'">',
        '       <span tooltip="delete"',
        '           tooltip-append-to-body="true"',
        '           tooltip-placement="bottom">',
        '         <i class="fa fa-trash-o"></i>',
        '       </span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <div feedback-panel>',
        '        <div feedback-selector',
        '            fb-sel-label="If correct, show"',
        '            fb-sel-class="correct"',
        '            fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
        '            fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
        '            fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
        '        </div>',
        '        <div feedback-selector',
        '            fb-sel-label="If partially correct, show"',
        '            fb-sel-class="partial"',
        '            fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
        '            fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
        '            fb-sel-default-feedback="{{defaultPartialFeedback}}">',
        '        </div>',
        '        <div feedback-selector',
        '            fb-sel-label="If incorrect, show"',
        '            fb-sel-class="incorrect"',
        '            fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
        '            fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
        '            fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
    ].join('');
    }
  }
];