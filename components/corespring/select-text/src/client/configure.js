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
      var initialData = [];

      scope.allowPassageEditing = true;
      scope.mode = "editor";
      scope.modelHistory = [];
      scope.selectionMode = true;
      scope.showSelectionUnitWarning = false;

      scope.allowSelectionUnitChange = allowSelectionUnitChange;
      scope.changeSelectionMode = changeSelectionMode;
      scope.deleteAll = deleteAll;
      scope.revertSelectionUnitChange = revertSelectionUnitChange;
      scope.startOver = startOver;
      scope.toggleMode = toggleMode;
      scope.toggleSelectionUnit = toggleSelectionUnit;
      scope.undo = undo;

      scope.containerBridge = {
        getModel: getModel,
        setModel: setModel
      };

      scope.$watch('[fullModel.correctResponse.value,model.choices,model.config.selectionUnit,model.config.availability,model.config.passage]', handleModelChange, true);
      scope.$watch('fullModel.correctResponse.value.length', watchCorrectResponseLength);
      scope.$watch('model.choices.length', watchChoicesLength);
      scope.$watch('model.cleanPassage', _.debounce(watchCleanPassage, 1500));
      scope.$watch('model.config.availability', toggleSelectionMode);
      scope.$watch('model.config.maxSelections', watchMaxSelections);

      scope.$emit('registerConfigPanel', $attrs.id, scope.containerBridge);

      //-----------------------------------------------------------------------------

      function getNestedProperty(obj, key) {
        return key.split(".").reduce(function(o, x) {
          return (typeof o === "undefined" || o === null) ? o : o[x];
        }, obj);
      }

      function getNumberOfCorrectChoices() {
        return getNestedProperty(scope, 'fullModel.correctResponse.value') ? scope.fullModel.correctResponse.value.length : 0;
      }

      function cleanExistingPassage() {
        if (getNestedProperty(scope, 'model.config.passage')) {
          var $cleanPassage = $theContent.clone();
          $cleanPassage.find('span.' + blastOptions.customClass).each(function() {
            var innerHTML = $(this).html();
            $(this).replaceWith(innerHTML);
          });
          scope.model.cleanPassage = $cleanPassage.prop('innerHTML');
        }
      }

      function classifyTokens(collection, tokenClass) {
        var $existingChoices = $theContent.find('.' + tokenClass);
        var existingChoices = [];
        var removedChoices = [];
        if ($existingChoices.length > 0) {
          $existingChoices.each(function() {
            var index = $theContent.find('.' + blastOptions.customClass).index(this);
            existingChoices.push(index);
          });
          removedChoices = _.difference(existingChoices, collection);
          collection = _.difference(collection, existingChoices);
        }
        if (removedChoices.length > 0) {
          for (var i = removedChoices.length - 1; i >= 0; i--) {
            $theContent.find('.' + blastOptions.customClass + ':eq("' + removedChoices[i] + '")').removeClass(tokenClass);
          }
        }
        for (var j = collection.length - 1; j >= 0; j--) {
          var $match = $theContent.find('.' + blastOptions.customClass + ':eq("' + collection[j] + '")');
          if ($match.length === 1) {
            $match.addClass(tokenClass);
          }
        }
      }

      function tokenizePassage() {
        blastOptions.delimiter = getNestedProperty(scope, 'model.config.selectionUnit') ? scope.model.config.selectionUnit : 'word';

        // Removes any existing tokens
        $theContent.blast(false);
        $theContent.prop('innerHTML', scope.model.cleanPassage);

        // Tokenize the content
        $theContent.blast(blastOptions);

        // Clean passage classes
        $theContent.find('.' + blastOptions.customClass).attr('class', blastOptions.customClass);
        scope.model.config.passage = $theContent.prop('innerHTML');

        // Render existing choices
        if (scope.model.config.availability === "specific" && getNestedProperty(scope, 'model.choices')) {
          classifyTokens(scope.model.choices, "choice");
        }

        // Render existing answers
        if (getNestedProperty(scope, 'fullModel.correctResponse.value')) {
          classifyTokens(scope.fullModel.correctResponse.value, "selected");
        }
      }

      function toggleSelectionMode(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (newValue === "specific") {
            if (getNestedProperty(scope, 'fullModel.correctResponse.value') && scope.fullModel.correctResponse.value.length > 0) {
              scope.model.choices = _.clone(scope.fullModel.correctResponse.value);
              scope.fullModel.correctResponse.value = [];
            }
          } else {
            scope.model.choices = [];
            scope.model.config.maxSelections = 0;
          }
          tokenizePassage();
        }
      }

      function bindTokenEvents() {
        $theContent.off('click', '.' + blastOptions.customClass);
        $theContent.on('click', '.' + blastOptions.customClass, onClickToken);
      }

      function removeChoice(index) {
        scope.model.choices.splice(
          scope.model.choices.indexOf(index),
          1);
      }

      function addChoice(index) {
        scope.model.choices.push(index);
      }

      function removeCorrectResponse(index) {
        scope.fullModel.correctResponse.value.splice(
          scope.fullModel.correctResponse.value.indexOf(index),
          1);
      }

      function addCorrectResponse(index) {
        scope.fullModel.correctResponse.value.push(index);
      }

      function onClickToken() {
        var $token = $(this);
        var index = $theContent.find('.' + blastOptions.customClass).index($token);
        var alreadySelected = scope.fullModel.correctResponse.value.indexOf(index) >= 0;
        var alreadyAChoice = scope.model.choices.indexOf(index) >= 0;
        if (scope.model.config.availability === "specific") {
          if ($theContent.hasClass('select-choices')) {
            if (alreadyAChoice) {
              if (alreadySelected) {
                removeCorrectResponse(index);
              } else {
                addCorrectResponse(index);
              }
            }
          } else {
            if (alreadyAChoice) {
              removeChoice(index);
              if (alreadySelected) {
                removeCorrectResponse(index);
              }
            } else {
              addChoice(index);
            }
          }
        } else {
          if (alreadySelected) {
            removeCorrectResponse(index);
          } else {
            addCorrectResponse(index);
          }
        }
        scope.updateNumberOfCorrectResponses(getNumberOfCorrectChoices());
      }

      function handleModelChange(newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal) && !ignoreChanges) {
          scope.modelHistory.push({
            answers: _.cloneDeep(oldVal[0]),
            choices: _.cloneDeep(oldVal[1]),
            selectionUnit: oldVal[2],
            availability: oldVal[3],
            passage: oldVal[4]
          });
          scope.allowPassageEditing = false; // This prevents the user from editing passage and delete the answers/selections
          if (newVal[2] !== oldVal[2]) {
            scope.showSelectionUnitWarning = true;
          }
          if (newVal[4] !== oldVal[4]) {
            classifyTokens(scope.model.choices, 'choice');
            classifyTokens(scope.fullModel.correctResponse.value, 'selected');
            return;
          }
        } else if (ignoreChanges) {
          ignoreChanges = false;
        }
        if (newVal[1] !== oldVal[1] && (!_.isEmpty(newVal[1]) || !_.isEmpty(oldVal[1]))) {
          classifyTokens(scope.model.choices, 'choice');
        }
        if (newVal[0] !== oldVal[0] && (!_.isEmpty(newVal[0]) || !_.isEmpty(oldVal[0]))) {
          classifyTokens(scope.fullModel.correctResponse.value, 'selected');
        }
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

      function setModel(model) {
        scope.fullModel = model;
        scope.model = scope.fullModel.model;
        $theContent = $element.find('.passage-preview .ng-binding');
        bindTokenEvents();
        initialData = {
          answers: _.cloneDeep(scope.fullModel.correctResponse.value),
          choices: _.cloneDeep(scope.model.choices),
          selectionUnit: scope.model.config.selectionUnit,
          availability: scope.model.config.availability,
          passage: scope.model.config.passage
        };
        scope.updateNumberOfCorrectResponses(getNumberOfCorrectChoices());
        $timeout(initUi, 100);
      }

      function initUi() {
        if (scope.model.config.availability === "specific") {
          classifyTokens(scope.model.choices, "choice");
        }
        classifyTokens(scope.fullModel.correctResponse.value, "selected");
        if ($theContent.find('.' + blastOptions.customClass).length > 0) {
          scope.allowPassageEditing = false;
          cleanExistingPassage();
          scope.mode = 'answers';
        }
      }

      function getModel() {
        var model = _.cloneDeep(scope.fullModel);
        delete model.cleanPassage;
        return model;
      }

      function watchCleanPassage(newValue, oldValue) {
        scope.$apply(function() {
          if (newValue !== oldValue && oldValue !== undefined) {
            scope.model.choices = [];
            scope.fullModel.correctResponse.value = [];
            tokenizePassage();
          }
        });
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

      function toggleMode($event, mode) {
        scope.mode = mode;
      }

      function toggleSelectionUnit($event) {
        var unit = $($event.currentTarget).data('unit');
        scope.model.config.selectionUnit = unit;
        // Clean the answers
        scope.fullModel.correctResponse.value = [];
        scope.model.choices = [];
      }

      function changeSelectionMode(areAnswers) {
        scope.selectionMode = !areAnswers;
        $theContent.toggleClass('select-choices', !scope.selectionMode);
      }

      function deleteAll() {
        scope.model.config.label = "";
        scope.model.config.selectionUnit = "word";
        scope.model.config.availability = "all";
        scope.model.config.passage = "";
        scope.model.config.maxSelections = 0;
        scope.fullModel.correctResponse.value = [];
        scope.mode = "editor";
        scope.allowPassageEditing = true;
      }

      function allowSelectionUnitChange() {
        scope.showSelectionUnitWarning = false;
        ignoreChanges = false;
        tokenizePassage();
      }

      function revertSelectionUnitChange() {
        ignoreChanges = true;
        scope.undo();
        scope.showSelectionUnitWarning = false;
        tokenizePassage();
      }

      function undo() {
        if (scope.modelHistory.length > 0) {
          assignModel(scope.modelHistory.pop());
          ignoreChanges = true;
        }
      }

      function startOver() {
        if (!_.isEmpty(initialData)) {
          scope.modelHistory = [];
          assignModel(initialData);
          ignoreChanges = true;
        }
      }

      function assignModel(model) {
        scope.fullModel.correctResponse.value = model.answers;
        scope.model.choices = model.choices;
        scope.model.config.availability = model.availability;
        scope.model.config.selectionUnit = model.selectionUnit;
        scope.model.config.passage = model.passage;
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
        '      <p>In Select Text Evidence, a student is asked to highlight content to support their answer.',
        '         This interaction allows for either one or more correct answers. Setting more than one answer as correct',
        '         allows for partial credit (see the scoring tab).',
        '      </p>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-8">',
        '     <div mini-wiggi-wiz="" ng-model="model.config.label" placeholder="Passage label (optional)" core-features="bold italic" features=""></div>',
        '    </div>',
        '    <div class="col-xs-4">',
        '      <div class="btn-group btn-group-sm btn-group-justified toggles" role="group">',
        '        <div class="btn-group btn-group-sm" role="group">',
        '          <button type="button" class="btn btn-default" ng-class="{active: mode === \'editor\'}"',
        '           ng-click="toggleMode($event, \'editor\')">Edit Content</button>',
        '        </div>',
        '        <div class="btn-group btn-group-sm" role="group">',
        '          <button type="button" class="btn btn-default" ng-class="{active: mode === \'answers\'}"',
        '           ng-click="toggleMode($event, \'answers\')" ng-disabled="model.cleanPassage === \'\'">Set Answers</button>',
        '        </div>',
        '        <div class="btn-group btn-group-sm" role="group">',
        '          <button type="button" class="btn btn-danger" ng-class="{active: mode === \'delete\'}"',
        '           ng-click="toggleMode($event, \'delete\')" ng-disabled="model.config.passage === \'\'">Delete</button>',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '     <div class="editor-wrapper" ng-show="mode === \'editor\'">',
        '       <div class="confirm-action" ng-hide="allowPassageEditing">',
        '         <div class="action-description">',
        '           <h4>Important</h4>',
        '           <p>If you decide to edit the passage, all the existing tokens as well as selected answers and/or possible selections will be lost.</p>',
        '           <p>Do you want to proceed?</p>',
        '           <p>',
        '             <button class="btn btn-danger" ng-click="allowPassageEditing = true">Yes</button>',
        '             <button class="btn btn-default" ng-click="toggleMode($event, \'answers\')">No</button>',
        '           </p>',
        '         </div>',
        '       </div>',
        '       <wiggi-wiz ng-model="model.cleanPassage">',
        '         <toolbar basic="bold italic underline superscript subscript" positioning="justifyLeft justifyCenter justifyRight" formatting="" media=""></toolbar>',
        '       </wiggi-wiz>',
        '     </div>',
        '     <div class="answers-config-wrapper" ng-show="mode === \'answers\'">',
        '       <div class="confirm-action" ng-show="showSelectionUnitWarning">',
        '         <div class="action-description">',
        '           <h4>Important</h4>',
        '           <p>If you change the selection unit, all the selected answers and/or possible selections will be lost.</p>',
        '           <p>Do you want to proceed?</p>',
        '           <p>',
        '             <button class="btn btn-danger" ng-click="allowSelectionUnitChange()">Yes</button>',
        '             <button class="btn btn-default" ng-click="revertSelectionUnitChange()">No</button>',
        '           </p>',
        '         </div>',
        '       </div>',
        '       <p>Students will select from:</p>',
        '       <div class="btn-group btn-group-sm" role="group">',
        '         <button type="button" class="btn btn-default" data-unit="word" ng-click="toggleSelectionUnit($event)"',
        '           ng-class="{\'active btn-primary\': model.config.selectionUnit === \'word\'}">Words</button>',
        '         <button type="button" class="btn btn-default" data-unit="sentence" ng-click="toggleSelectionUnit($event)"',
        '           ng-class="{\'active btn-primary\': model.config.selectionUnit === \'sentence\'}">Sentences</button>',
        '         <button type="button" class="btn btn-default" data-unit="paragraph" ng-click="toggleSelectionUnit($event)"',
        '           ng-class="{\'active btn-primary\': model.config.selectionUnit === \'paragraph\'}" disabled>Paragraphs</button>',
        '         <button type="button" class="btn btn-default" data-unit="custom" ng-click="toggleSelectionUnit($event)"',
        '           ng-class="{\'active btn-primary\': model.config.selectionUnit === \'custom\'}" disabled>Combination</button>',
        '       </div>',
        '       <div class="radio">',
        '         <label>',
        '           <input type="checkbox" ng-model="model.config.availability" ng-true-value="specific" ng-false-value="all">',
        '           Make specific content available',
        '         </label>',
        '       </div>',
        '       <div class="instructions" ng-show="model.config.availability === \'specific\'">',
        '         <p ng-show="selectionMode"><strong><em>Click selections to make available to students</em></strong></p>',
        '         <p ng-show="!selectionMode"><strong><em>Click correct answers</em></strong></p>',
        '       </div>',
        '       <div class="passage-wrapper">',
        '         <div class="history-buttons">',
        '           <span cs-undo-button ng-class="{disabled: modelHistory.length < 1}" ng-disabled="modelHistory.length < 1"></span>',
        '           <span cs-start-over-button ng-class="{disabled: modelHistory.length < 1}" ng-disabled="modelHistory.length < 1"></span>',
        '         </div>',
        '         <div class="passage-preview" ng-bind-html-unsafe="model.config.passage"></div>',
        '       </div>',
        '       <div style="text-align: center;">',
        '         <div style="border-right: solid 1px black; display: inline-block; height: 60px; padding-right: 10px;margin-right: 10px;margin-top: 10px;" ng-show="model.config.availability === \'specific\'">',
        '         <span class="answer-summary">',
        '           <button class="btn btn-default" ng-class="{\'active btn-primary\': selectionMode}"',
        '             ng-click="changeSelectionMode(false)">Selections Available</button> <span class="badge choices-count">{{model.choices.length}}</span>',
        '         </span>',
        '         </div>',
        '         <span class="answer-summary">',
        '           <button class="btn btn-default" ng-class="{\'active btn-primary\': !selectionMode}" ng-show="model.config.availability === \'specific\'"',
        '             ng-click="changeSelectionMode(true)" ng-disabled="model.choices.length === 0">Correct Answers</button> <span ng-show="model.config.availability === \'all\'">Correct Answers</span> <span class="badge answers-count">{{fullModel.correctResponse.value.length}}</span>',
        '         </span>',
        '       </div>',
        '       <div class="max-selections form-inline" ng-show="model.config.availability === \'all\'">',
        '         <div class="form-group">',
        '           <p class="form-control-static">Maximum number of selections student is allowed to choose (optional):</p>',
        '         </div>',
        '         <div class="form-group">',
        '           <input type="number" name="userMaxSelections" class="form-control" ng-model="model.config.maxSelections" min="{{fullModel.correctResponse.value.length}}" />',
        '         </div>',
        '       </div>',
        '     </div>',
        '     <div ng-show="mode === \'delete\'">',
        '       <div class="alert alert-danger" role="alert">',
        '         <h4>Are you sure?</h4>',
        '         <p>This will permanently delete the passage and any set of answers.</p>',
        '         <p>',
        '           <button class="btn btn-danger" ng-click="deleteAll()">Yes</button>',
        '           <button class="btn btn-default" ng-click="toggleMode($event, \'answers\')">No</button>',
        '         </p>',
        '       </div>',
        '     </div>',
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