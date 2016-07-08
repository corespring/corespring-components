exports.framework = 'angular';
exports.directives = [
  {
  directive: [
    '$log',
    '$timeout',
    'ColumnLayout',
    'CompactLayout',
    'CsUndoModel',
    'LayoutConfig',
    'LayoutRunner',
    'MathJaxService',
    renderCorespringDndCategorize
  ]
  },
  {
    name: 'answerSwitcher',
    directive: function() {
      return {
        link: function($scope, $element) {
          $element.addClass('answer-switcher');

          function resizeContainer() {
            var elements = $element.children();
            var dimensions = _.map(elements, function(element) {
              var dimensions = element.getBoundingClientRect();
              return [dimensions.width, dimensions.height];
            });

            var height = Math.ceil(_.chain(dimensions).map(function(dimension) {
                return dimension[1];
              }).max().value()) + 'px';

            $element.css({
              height: height
            });
          }

          $scope.$watch(resizeContainer);
        },
        restrict: 'EA'
      };
    }
  }

];

function renderCorespringDndCategorize(
  $log,
  $timeout,
  ColumnLayout,
  CompactLayout,
  CsUndoModel,
  LayoutConfig,
  LayoutRunner,
  MathJaxService
) {

  return {
    controller: ['$scope', controller],
    link: link,
    replace: true,
    restrict: 'AE',
    template: template(),
    transclude: true,
    scope: {
      mode: '@',
      attrCategories: '=?categories',
      attrChoices: '=?choices',
      attrChoicesLabel: '=?choicesLabel',
      attrCategoriesPerRow: '=?categoriesPerRow',
      attrChoicesPerRow: '=?choicesPerRow',
      attrRemoveAllAfterPlacing: '=?removeAllAfterPlacing'
    }
  };

  function controller(scope) {
    scope.activate = function(id) {
      scope.$broadcast('activate', id);
    };
  }

  function link(scope, elem, attrs) {

    var log = console.log.bind(console, '[dnd-categorize]');

    var lastChoiceWidth, layout;

    scope.correctAnswerRows = [{}];
    scope.dragAndDropScope = 'dnd-scope-' + Math.floor(Math.random() * 10000);
    scope.feedback = {
      isSeeAnswerPanelExpanded: false
    };
    scope.isEditMode = attrs.mode === 'edit';
    scope.playerMode = 'gather';
    scope.renderModel = {};
    scope.rows = [{}];
    scope.shouldFlip = false;

    scope.undoModel = new CsUndoModel();
    scope.undoModel.setGetState(getState);
    scope.undoModel.setRevertState(revertState);

    scope.canEdit = canEdit;
    scope.getEditMode = getEditMode;
    scope.isDragEnabled = isDragEnabled;
    scope.isDragEnabledFromCategory = isDragEnabledFromCategory;
    scope.onCategoryDeleteClicked = onCategoryDeleteClicked;
    scope.onCategoryDrop = onCategoryDrop;
    scope.onChoiceDeleteClicked = onChoiceDeleteClicked;
    scope.onChoiceRemovedFromCategory = onChoiceRemovedFromCategory;
    scope.onToggleMoveOnDrag = onToggleMoveOnDrag;
    scope.onToggleRemoveAllAfterPlacing = onToggleRemoveAllAfterPlacing;

    scope.containerBridge = {
      answerChangedHandler: saveAnswerChangedCallback,
      editable: setEditable,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty,
      reset: reset,
      setDataAndSession: setDataAndSession,
      setInstructorData: setInstructorData,
      setMode: setPlayerMode,
      setPlayerSkin: setPlayerSkin,
      setResponse: setResponse
    };

    scope.$watch('categoriesPerRow', updateView);
    scope.$watch('choicesPerRow', updateView);
    scope.$watch('renderModel', onRenderModelChange, true);
    scope.$watch('renderModel.categories.length', updateView);
    scope.$watch('renderModel.choices.length', updateView);
    scope.$watch('shouldFlip', updateView);

    if (scope.isEditMode) {
      scope.$watch('attrCategories.length', setRenderModelFromEditor);
      scope.$watch('attrChoices.length', setRenderModelFromEditor);
      scope.$watch('attrChoicesLabel', updateChoicesLabelFromEditor);
      scope.$watch('attrCategoriesPerRow', updateCategoriesPerRowFromEditor);
      scope.$watch('attrChoicesPerRow', updateChoicesPerRowFromEditor);
      scope.$watch('attrRemoveAllAfterPlacing', updateRemoveAllAfterPlacingFromEditor);
    }

    scope.$on('$destroy', onDestroy);

    if (!scope.isEditMode) {
      scope.$emit('registerComponent', attrs.id, scope.containerBridge, elem[0]);
    }

    //-----------------------------------------------------------

    function setPlayerSkin(skin) {
      scope.iconset = skin.iconSet;
    }

    function setDataAndSession(dataAndSession) {
      log('setDataAndSession mode:', attrs.mode, dataAndSession);

      scope.editable = true;
      scope.data = dataAndSession.data;
      scope.session = dataAndSession.session || {};
      setConfig(dataAndSession.data.model);
      initLayouts();

      scope.renderModel = prepareRenderModel(scope.data.model, scope.session);
      scope.saveRenderModel = _.cloneDeep(scope.renderModel);
      scope.undoModel.init();
      updateView();
    }

    function setConfig(model) {
      scope.categoriesPerRow = model.config.categoriesPerRow || 2;
      scope.choicesPerRow = model.config.choicesPerRow || 4;
      scope.shouldFlip = model.config.answerAreaPosition === 'above';
    }

    function prepareRenderModel(model, session) {
      var choices = _.clone(model.choices);
      if (model.config.shuffle) {
        choices = _.shuffle(choices);
      }
      var allChoices = _.clone(choices);
      var choicesLabel = model.config.choicesLabel;
      var categories = _.map(model.categories, wrapCategoryModel);

      if (session.answers) {
        placeAnswersInCategories(session.answers, categories);
      }
      return {
        choices: choices,
        choicesLabel: choicesLabel,
        allChoices: allChoices,
        categories: categories
      };

      function placeAnswersInCategories(answers, categories) {
        _.forEach(categories, function(cat) {
          var answersForCategory = answers[cat.model.id];
          if (_.isArray(answersForCategory)) {
            cat.choices = _(answersForCategory).map(getChoiceForId).map(wrapChoiceModel).value();
          }
        });
      }

      function getChoiceForId(choiceId) {
        return _.find(choices, {
          id: choiceId
        });
      }
    }

    function getSession() {
      return collectAnswers(scope.renderModel);
    }

    function collectAnswers(renderModel) {
      var numberOfAnswers = 0;
      var answers = _.reduce(renderModel.categories, function(result, category) {
        var catId = category.model.id;
        result[catId] = _.map(category.choices, function(choice) {
          return choice.model.id;
        });
        numberOfAnswers += category.choices.length;
        return result;
      }, {});

      return {
        answers: answers,
        numberOfAnswers: numberOfAnswers
      };
    }

    function isAnswerEmpty() {
      return 0 === getSession().numberOfAnswers;
    }

    function setPlayerMode(value) {
      scope.playerMode = value;
    }

    function setInstructorData(data) {
      log('setInstructorData', data);

      scope.renderModel = prepareRenderModel(_.cloneDeep(scope.data.model), {
        answers: data.correctResponse
      });

      updateView();

      disableAllChoices(scope.renderModel);

      scope.containerBridge.setResponse({
        correctness: "correct",
        correctClass: "correct",
        score: 1,
        correctResponse: data.correctResponse,
        detailedFeedback: createDetailedFeedback()
      });
      scope.response = "dummy";
      scope.editable = false;

      //-----------------------------------

      function disableAllChoices(renderModel) {
        _.forEach(renderModel.choices, function(choice) {
          choice.correctness = "instructor-mode-disabled";
        });
      }

      function createDetailedFeedback() {
        var detailedFeedback = {};
        var categories = _.map(scope.data.model.categories, wrapCategoryModel);
        _.forEach(categories, function(cat) {
          detailedFeedback[cat.model.id] = {
            correctness: _.map(data.correctResponse[cat.model.id],
              function(c) {
                return "correct";
              })
          };
        });
        return detailedFeedback;
      }
    }

    function setResponse(response) {
      log('setResponse', response);
      scope.response = response;

      setDetailedFeedback(response);
      initSeeSolutionModel(response);
    }

    function setDetailedFeedback(response) {
      if (!response.detailedFeedback) {
        return;
      }
      _.forEach(scope.renderModel.categories, function(category) {
        var feedback = response.detailedFeedback[category.model.id];
        if (feedback) {
          if (feedback.answersExpected) {
            category.answersExpected = true;
          }
          _.forEach(category.choices, function(choice, choiceIndex) {
            choice.correctness = feedback.correctness[choiceIndex];
          });
        }
      });
    }

    function initSeeSolutionModel(response) {
      if (!response.correctResponse) {
        return;
      }
      var correctAnswerRowId = 0;
      var categoriesPerRow = scope.categoriesPerRow;
      var rows = [makeRow()];

      _.forEach(scope.renderModel.categories, function(category) {
        var lastRow = _.last(rows);
        if (lastRow.categories.length === categoriesPerRow) {
          rows.push(lastRow = makeRow());
        }
        var correctChoices = response.correctResponse[category.model.id];
        var categoryModel = createCategoryModelForSolution(category, correctChoices);
        lastRow.categories.push(categoryModel);
      });

      fillUpWithPlaceholders(rows, categoriesPerRow);
      scope.correctAnswerRows = rows;

      function makeRow() {
        return {
          id: "correct-answer-row-" + correctAnswerRowId++,
          categories: []
        };
      }
    }

    function createCategoryModelForSolution(category, correctChoices) {
      var newCategory = _.cloneDeep(category);
      newCategory.choices = _.map(correctChoices, function(correctChoiceId) {
        var choiceModel = _.find(scope.renderModel.allChoices, byId(correctChoiceId));
        var choice = wrapChoiceModel(choiceModel);
        choice.correctness = 'correct';
        return choice;
      });
      return newCategory;
    }

    function reset() {

      scope.feedback = {
        isSeeAnswerPanelExpanded: false
      };
      scope.response = undefined;
      scope.renderModel = _.cloneDeep(scope.saveRenderModel);
      scope.undoModel.init();
      updatePlacedChoices();
      updateView();
    }

    function setEditable(e) {
      scope.editable = e;
    }

    function saveAnswerChangedCallback(callback) {
      scope.answerChangedCallback = callback;
    }

    function getState() {
      return scope.renderModel;
    }

    function revertState(state) {
      scope.renderModel = state;
      updatePlacedChoices();
      updateView();
    }

    function updatePlacedChoices() {
      if (!scope.isEditMode) {
        _.forEach(scope.renderModel.allChoices, function(choice) {
          if (choice.moveOnDrag) {
            if (isChoicePlaced(choice.id)) {
              scope.$broadcast('placed', choice.id);
            } else {
              scope.$broadcast('unplaced', choice.id);
            }
          }
        });
      }
    }

    function onRenderModelChange(newValue, oldValue) {
      if (oldValue === undefined || _.isEqual(collectAnswers(newValue), collectAnswers(oldValue))) {
        return;
      }
      if (_.isFunction(scope.answerChangedCallback)) {
        scope.answerChangedCallback();
      }
      scope.undoModel.remember();
    }

    function initLayouts() {
      if (layout) {
        layout.cancel();
      }

      var layoutConstructor = scope.isEditMode ? ColumnLayout : CompactLayout;

      layout = new layoutConstructor(
        new LayoutConfig()
        .withContainer(elem.find('.choices-container'))
        .withItemSelector('.choice-corespring-dnd-categorize')
        .withNumColumns(scope.choicesPerRow)
        .withCellWidth(calcChoiceWidth)
        .withPaddingBottom(7)
        .value(),
        new LayoutRunner($timeout));

      layout.onBeforeRender(function(choiceWidth){
        scope.choiceWidth = choiceWidth;
        scope.choiceStyle = {
          width: choiceWidth + 'px'
        };
      });
      layout.onAfterRender(function(){
        renderMath();
      });
    }

    function destroyLayouts() {
      if (layout) {
        layout.cancel();
      }
    }

    function updateLayoutConfig() {
      if (layout) {
        layout.updateConfig({
          container: elem.find('.choices-container')
        });
      }
    }

    function onDestroy() {
      destroyLayouts();
    }

    function updateView() {
      if (!scope.renderModel.categories || !scope.renderModel.choices) {
        return;
      }

      var categoriesPerRow = scope.categoriesPerRow;
      if (isNaN(categoriesPerRow)) {
        return;
      }

      var choicesPerRow = scope.choicesPerRow;
      if (isNaN(choicesPerRow)) {
        return;
      }

      var rowIdCounter = 0;

      var rows = chunk(scope.renderModel.categories, categoriesPerRow).map(function(row) {
        return {
          id: rowIdCounter++,
          categories: row
        };
      });

      fillUpWithPlaceholders(rows, categoriesPerRow);
      scope.rows = rows;

      scope.categoryStyle = {
        width: 100 / categoriesPerRow + '%'
      };

      if (layout) {
        layout.updateConfig({
          container: elem.find('.choices-container')
        });
      }
    }

    function fillUpWithPlaceholders(rows, categoriesPerRow) {
      //fill rows with empty placeholder categories
      //so that they are lined up in proper columns
      var counter = 1;
      var categories = rows[rows.length - 1].categories;
      while (categories.length < categoriesPerRow) {
        categories.push({
          model: {
            id: "placeholder-" + (counter++)
          },
          isPlaceHolder: true
        });
      }
    }

    function calcChoiceWidth() {
      var maxChoiceWidth = elem.find('.choice-container').width();
      maxChoiceWidth -= 2 * 3; //margin of choice.border
      if (maxChoiceWidth < 0) {
        return 0;
      }
      if (scope.choicesPerRow <= scope.categoriesPerRow) {
        return maxChoiceWidth;
      }
      var totalChoiceWidth = maxChoiceWidth * scope.categoriesPerRow;
      return totalChoiceWidth / scope.choicesPerRow;
    }

    function chunk(arr, chunkSize) {
      if (_.isFunction(_.chunk)) {
        $log.warn('chunk can be replaced with lodash version.');
      }
      var chunks = [[]];
      _.forEach(arr, function(elem) {
        var lastRow = _.last(chunks);
        if (lastRow.length === chunkSize) {
          chunks.push(lastRow = []);
        }
        lastRow.push(elem);
      });
      return chunks;
    }

    function onCategoryDrop(categoryId, choiceId) {
      var category = _.find(scope.renderModel.categories, byModelId(categoryId));
      var choice = _.find(scope.renderModel.allChoices, byId(choiceId));

      scope.$apply(function() {
        category.choices.push(wrapChoiceModel(choice));
        updatePlacedChoices();
      });

      updateView();
    }

    function onCategoryDeleteClicked(categoryId) {
      _.remove(scope.renderModel.categories, byModelId(categoryId));
    }

    function isChoicePlaced(choiceId) {
      return findInAllCategories(choiceId, scope.renderModel.categories);
    }

    function findInAllCategories(choiceId, categories) {
      return _.find(categories, function(category) {
        return _.find(category.choices, byModelId(choiceId)) !== undefined;
      });
    }

    function onChoiceRemovedFromCategory(categoryId, choiceId, index) {
      var category = _.find(scope.renderModel.categories, byModelId(categoryId));
      if (category) {
        category.choices.splice(index, 1);
        updatePlacedChoices();
      }
    }

    /**
     * Add choice back in at the same position where it was in the beginning
     * Obviously only works if the order of the choices has not been changed
     */
    function addChoiceBackIn(choice) {
      //find original position of choice
      var index = _.indexOf(scope.renderModel.allChoices, choice);
      //go backwards in allChoices and try to find the first choice
      //before choice, that is still in choices
      while (--index >= 0) {
        var otherChoice = scope.renderModel.allChoices[index];
        var otherChoiceIndex = _.indexOf(scope.renderModel.choices, otherChoice);
        if (otherChoiceIndex >= 0) {
          //insert the choice after the otherChoice
          scope.renderModel.choices.splice(otherChoiceIndex + 1, 0, choice);
          return;
        }
      }
      //no otherChoice found, insert at the beginning
      scope.renderModel.choices.unshift(choice);
    }

    function onChoiceDeleteClicked(choiceId) {
      _.remove(scope.renderModel.choices, byId(choiceId));
      _.forEach(scope.renderModel.categories, function(category) {
        if (category) {
          _.remove(category.choices, byModelId(choiceId));
        }
      });
    }

    function wrapChoiceModel(choiceModel) {
      return {
        model: choiceModel,
        correctness: 'none'
      };
    }

    function wrapCategoryModel(categoryModel) {
      return {
        model: categoryModel,
        choices: []
      };
    }

    function updateCategoriesPerRowFromEditor(newValue, oldValue) {
      var categoriesPerRow = parseInt(newValue, 10);
      if (!isNaN(categoriesPerRow)) {
        scope.categoriesPerRow = categoriesPerRow;
      }
    }

    function updateChoicesPerRowFromEditor(newValue, oldValue) {
      var choicesPerRow = parseInt(newValue, 10);
      if (!isNaN(choicesPerRow)) {
        scope.choicesPerRow = choicesPerRow;
        initLayouts();
      }
    }

    function updateChoicesLabelFromEditor(newValue, oldValue) {
      scope.renderModel.choicesLabel = scope.attrChoicesLabel;
    }

    function updateRemoveAllAfterPlacingFromEditor(newValue, oldValue) {
      scope.renderModel.removeAllAfterPlacing = scope.attrRemoveAllAfterPlacing;
    }

    function setRenderModelFromEditor() {
      if (!layout) {
        initLayouts();
      }

      var renderModel = {
        choices: scope.attrChoices,
        choicesLabel: scope.attrChoicesLabel,
        allChoices: _.clone(scope.attrChoices),
        categories: scope.attrCategories,
        removeAllAfterPlacing: scope.attrRemoveAllAfterPlacing
      };

      scope.renderModel = renderModel;
    }

    function renderMath() {
      MathJaxService.parseDomForMath(100, elem[0]);
    }

    function isDragEnabled(choice) {
      return !scope.response && (scope.isEditMode || scope.playerMode === 'gather') &&
        (choiceCanBePlacedMultipleTimes(choice) || !isChoicePlaced(choice.id));

      function choiceCanBePlacedMultipleTimes(choice) {
        return !choice.moveOnDrag;
      }
    }

    function isDragEnabledFromCategory() {
      return !scope.response && !scope.isEditMode && scope.playerMode === 'gather';
    }

    function getEditMode(choice) {
      if (!scope.isEditMode) {
        return '';
      }
      return 'editable';
    }

    function canEdit() {
      return scope.editable && !scope.response;
    }

    function byModelId(id) {
      return function(object) {
        return object.model.id === id;
      };
    }

    function byId(id) {
      return function(object) {
        return object.id === id;
      };
    }

    function all() {
      return true;
    }

    function onToggleMoveOnDrag(choice) {
      if (!choice.moveOnDrag) {
        scope.renderModel.removeAllAfterPlacing.value = false;
      }
    }

    function onToggleRemoveAllAfterPlacing(newValue) {
      _.forEach(scope.renderModel.choices, function(choice) {
        choice.moveOnDrag = scope.renderModel.removeAllAfterPlacing.value;
      });
    }

  }

  function template() {
    return [
        '<div class="render-corespring-dnd-categorize {{playerMode}}-mode">',
        undoStartOver(),
        seeSolutionToggle(),
        interaction(),
        itemFeedbackPanel(),
        '</div>'
      ].join('\n');
  }

  function undoStartOver() {
    return [
        '<div>',
        '  <div class="undo-start-over text-centered" ng-show="canEdit()">',
        '    <span cs-undo-button-with-model></span>',
        '    <span cs-start-over-button-with-model></span>',
        '  </div>',
        '  <div class="clearfix"></div>',
        '</div>'
      ].join('');
  }

  function itemFeedbackPanel() {
    return [
        '<div ng-show="!feedback.isSeeAnswerPanelExpanded">',
        '  <div feedback="response.feedback" icon-set="{{iconset}}"',
        '     correct-class="{{response.correctClass}} {{response.warningClass}}">',
        '  </div>',
        '</div>'
      ].join('');
  }

  function seeSolutionToggle() {
    return [
      '<correct-answer-toggle visible="response.correctResponse" toggle="feedback.isSeeAnswerPanelExpanded"></correct-answer-toggle>'
    ].join('');
  }

  function seeSolutionContent(flip) {
    return [
      categoriesTemplate(flip + "&&response", 'correctAnswerRows', 'feedback.isSeeAnswerPanelExpanded')
    ].join('');
  }

  function interaction() {
    return [
        '<div class="interaction-corespring-dnd-categorize">',
        choicesTemplate('shouldFlip'),
        '<div answer-switcher="" class="answer-group" ng-if="!shouldFlip">',
        categoriesTemplate('!shouldFlip', 'rows', '!feedback.isSeeAnswerPanelExpanded'),
        seeSolutionContent('!shouldFlip', 'response'),
        '</div>',
        // Nasty hack: transclude configuration for categories.
        '  <div ng-transclude ng-if="isEditMode"></div>',
        '  <h3 ng-if="isEditMode">Choices</h3>',
        '  <span ng-if="isEditMode" class="choice-area-label">',
        '    Enter choices below and drag to correct categories above.',
        '  </span>',
        choicesTemplate('!shouldFlip'),
        '<div answer-switcher="" class="answer-group" ng-if="shouldFlip">',
        categoriesTemplate('shouldFlip', 'rows', '!feedback.isSeeAnswerPanelExpanded'),
        seeSolutionContent('shouldFlip', 'response'),
        '</div>',
        '</div>'
      ].join('');
  }

  function choicesTemplate(flip) {
    return [
        '<div class="choices-container-holder" ng-if="#flip#">',
        '  <div class="row choices-label-row">',
        '    <div label-editor-corespring-dnd-categorize="true"',
        '        active-id="choices-label"',
        '        class="choices-label-editor col-md-7"',
        '        editable="isEditMode"',
        '        model="renderModel.choicesLabel"',
        '        on-edit-clicked="activate(activeId)">',
        '    </div>',
        '  </div>',
        '  <div class="row remove-all-row">',
        '    <div class="col-xs-7 remove-container">',
        '      <checkbox ',
        '         class="control-label"',
        '         ng-change="onToggleRemoveAllAfterPlacing()"',
        '         ng-if="isEditMode"',
        '         ng-model="renderModel.removeAllAfterPlacing.value"',
        '         tooltip=\'The "Remove tile after placing" option removes the answer from the choice area after a student places it in a category. If you select this option on a choice, you may not add it to more than one category.\'',
        '         tooltip-append-to-body="true"',
        '         tooltip-placement="bottom"',
        '      >',
        '        Remove <strong>all</strong> tiles after placing',
        '      </checkbox>',
        '    </div>',
        '  </div>',
        '  <div class="choices-container">',
        '    <div choice-corespring-dnd-categorize="true" ',
        '      correctness="{{choice.correctness}}"',
        '      choice-id="{{choice.id}}" ',
        '      delete-after-placing="choice.moveOnDrag" ',
        '      drag-and-drop-scope="dragAndDropScope"',
        '      drag-enabled="isDragEnabled(choice)"',
        '      edit-mode="getEditMode(choice)" ',
        '      model="choice" ',
        '      ng-repeat="choice in renderModel.choices track by choice.id" ',
        '      ng-style="choiceStyle"',
        '      on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
        '      on-edit-clicked="activate(choiceId)" ',
        '      on-move-on-drag-clicked="onToggleMoveOnDrag(choice)" ',
        '    ></div>',
        '  </div>',
        '</div>'
      ].join('').replace('#flip#', flip);
  }

  function categoriesTemplate(flip, rowsModel, visible) {
    return [
        '<div class="categories-holder" ng-if="#flip#" ng-class="{isCategoriesHolderVisible: #visible#}">',
        '  <div class="categories" ng-repeat="row in #rowsModel# track by row.id">',
        '    <div class="row">',
        '      <div category-label-corespring-dnd-categorize="true" ',
        '        category="category" ',
        '        edit-mode="isEditMode" ',
        '        ng-repeat="category in row.categories track by category.model.id"',
        '        ng-style="categoryStyle"',
        '        on-edit-clicked="activate(categoryId)" ',
        '        on-delete-clicked="onCategoryDeleteClicked(categoryId)" ',
        '       ></div>',
        '     </div>',
        '    <div class="row">',
        '      <div category-choices-corespring-dnd-categorize="true" ',
        '        category="category" ',
        '        choice-width="{{choiceWidth}}"',
        '        drag-and-drop-scope="dragAndDropScope"',
        '        drag-enabled="isDragEnabledFromCategory()"',
        '        edit-mode="isEditMode" ',
        '        ng-class="[response.warningClass, category.model.id]"',
        '        ng-repeat="category in row.categories track by category.model.id"',
        '        ng-style="categoryStyle"',
        '        on-choice-dragged-away="onChoiceRemovedFromCategory(fromCategoryId,choiceId,index)" ',
        '        on-edit-clicked="activate(categoryId)" ',
        '        on-delete-choice-clicked="onChoiceRemovedFromCategory(categoryId,choiceId,index)" ',
        '        on-delete-clicked="onCategoryDeleteClicked(categoryId)" ',
        '        on-drop="onCategoryDrop(categoryId,choiceId)" ',
        '       ></div>',
        '     </div>',
        '  </div>',
        '</div>'
      ].join('')
      .replace('#flip#', flip)
      .replace('#rowsModel#', rowsModel)
      .replace('#visible#', visible);
  }

}