var main = [
  '$timeout',
  'CompactLayout',
  'CompactLayoutWhileEditing',
  'LayoutConfig',
  'LayoutRunner',

  function(
    $timeout,
    CompactLayout,
    CompactLayoutWhileEditing,
    LayoutConfig,
    LayoutRunner
  ) {

    return {
      controller: ['$scope', controller],
      link: link,
      replace: true,
      restrict: 'AE',
      template: template(),
      scope: {
        mode: '@',
        attrCategories: '=?categories',
        attrChoices: '=?choices',
        attrCategoriesPerRow: '=?categoriesPerRow',
        attrChoicesPerRow: '=?choicesPerRow',
        imageService: '=?imageService'
      }
    };

    function controller(scope) {
      scope.activate = function(id) {
        scope.$broadcast('activate', id);
      };
    }

    function link(scope, elem, attrs) {

      var log = console.log.bind(console, '[dnd-categorize]');
      var layout, editingLayout;

      scope.correctAnswerRows = [[]];
      scope.editable = false;
      scope.isDragEnabled = false;
      scope.isDragEnabledFromCategory = false;
      scope.isEditMode = attrs.mode === 'edit';
      scope.isSeeCorrectAnswerOpen = false;
      scope.renderModel = {};
      scope.rows = [[]];
      scope.shouldFlip = false;
      scope.undoStack = [];

      scope.getEditMode = getEditMode;
      scope.onCategoryEditClicked = onCategoryEditClicked;
      scope.onCategoryDeleteClicked = onCategoryDeleteClicked;
      scope.onCategoryDrop = onCategoryDrop;
      scope.onChoiceDeleteClicked = onChoiceDeleteClicked;
      scope.onChoiceEditClicked = onChoiceEditClicked;
      scope.onChoiceRemovedFromCategory = onChoiceRemovedFromCategory;
      scope.showSeeCorrectAnswer = showSeeCorrectAnswer;
      scope.revertToState = revertToState;

      scope.containerBridge = {
        answerChangedHandler: saveAnswerChangedCallback,
        editable: setEditable,
        getSession: getSession,
        reset: reset,
        setDataAndSession: setDataAndSession,
        setResponse: setResponse
      };

      scope.$watch('categoriesPerRow', updateView);
      scope.$watch('choicesPerRow', updateView);
      scope.$watch('renderModel', callAnswerChangedHandlerIfAnswersHaveChanged, true);
      scope.$watch('renderModel.categories.length', updateView);
      scope.$watch('renderModel.choices.length', updateView);
      scope.$watch('response', updateIsDragEnabled);
      scope.$watch('shouldFlip', updateView);

      if (scope.isEditMode) {
        scope.$watch('attrCategories.length', setRenderModelFromEditor);
        scope.$watch('attrChoices.length', setRenderModelFromEditor);
        scope.$watch('attrCategoriesPerRow', updateCategoriesPerRowFromEditor);
        scope.$watch('attrChoicesPerRow', updateChoicesPerRowFromEditor);
      }

      scope.$on('$destroy', onDestroy);

      if (!scope.isEditMode) {
        scope.$emit('registerComponent', attrs.id, scope.containerBridge, elem[0]);
      }

      //-----------------------------------------------------------

      function setDataAndSession(dataAndSession) {
        log('setDataAndSession mode:', attrs.mode, dataAndSession);

        scope.editable = true;
        scope.data = dataAndSession.data;
        scope.session = dataAndSession.session;
        setConfig(dataAndSession.data.model);
        initLayouts();

        scope.$broadcast('reset');
        scope.renderModel = prepareRenderModel(dataAndSession.data.model, dataAndSession.session);
        scope.saveRenderModel = _.cloneDeep(scope.renderModel);
        updateView();
      }

      function setConfig(model) {
        scope.categoriesPerRow = model.config.categoriesPerRow || 2;
        scope.choicesPerRow = model.config.choicesPerRow || 4;
        scope.shouldFlip = model.config.answerAreaPosition === 'above';
      }

      function prepareRenderModel(model, session) {
        var renderModel = {
          dragAndDropScope: 'scope-' + Math.floor(Math.random() * 10000)
        };

        renderModel.choices = model.config.shuffle ?
          _.shuffle(model.choices) :
          _.take(model.choices, all);
        renderModel.allChoices = _.take(renderModel.choices, all);
        renderModel.categories = _.map(model.categories, wrapCategoryModel);
        return renderModel;
      }

      function getSession() {
        var answers = _.reduce(scope.renderModel.categories, function(result, category) {
          var catId = category.model.id;
          result[catId] = _.map(category.choices, function(choice) {
            return choice.model.id;
          });
          return result;
        }, {});

        return {
          answers: answers
        };
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
        var categoriesPerRow = scope.categoriesPerRow;
        scope.correctAnswerRows = [[]];

        _.forEach(scope.renderModel.categories, function(category) {
          var lastRow = _.last(scope.correctAnswerRows);
          if (lastRow.length === categoriesPerRow) {
            scope.correctAnswerRows.push(lastRow = []);
          }
          var correctChoices = response.correctResponse[category.model.id];
          var categoryModel = createCategoryModelForSolution(category, correctChoices);
          lastRow.push(categoryModel);
        });
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
        scope.$broadcast('reset');

        scope.editable = true;
        scope.isSeeAnswerPanelExpanded = false;
        scope.response = undefined;

        scope.renderModel = _.cloneDeep(scope.saveRenderModel);
        updateView();
      }

      function setEditable(e) {
        scope.editable = true;
      }

      function saveAnswerChangedCallback(callback) {
        scope.answerChangedCallback = callback;
      }

      var lastSession = null;

      function callAnswerChangedHandlerIfAnswersHaveChanged() {
        if (_.isFunction(scope.answerChangedCallback)) {
          var session = getSession();
          if (!_.equal(session, lastSession)) {
            lastSession = session;
            scope.answerChangedCallback();
          }
        }
      }

      function initLayouts() {
        /*
        if (layout) {
          layout.cancel();
        }
        layout = new CompactLayout(
          new LayoutConfig()
          .withContainer(elem.find('.container-choices'))
          .withItemSelector('.choice-corespring-dnd-categorize')
          .withCellWidth(calcChoiceWidth())
          .value(),
          new LayoutRunner($timeout));

        if (editingLayout) {
          editingLayout.cancel();
        }
        editingLayout = new CompactLayoutWhileEditing(
          new LayoutConfig()
          .withContainer(elem.find('.container-choices'))
          .withItemSelector('.choice-corespring-dnd-categorize')
          .value(),
          new LayoutRunner($timeout));
        */
      }

      function destroyLayouts() {
        if (layout) {
          layout.cancel();
        }
        if (editingLayout) {
          editingLayout.cancel();
        }
      }

      function updateLayoutConfig(cellWidth) {
        if (layout) {
          layout.updateConfig({
            container: elem.find('.container-choices'),
            cellWidth: cellWidth
          });
        }
      }

      function startEditingLayout(choiceElement) {
        if (layout) {
          layout.cancel();

          editingLayout.start({
            container: elem.find('.container-choices'),
            editedElement: choiceElement
          });
        }
      }

      function stopEditingLayout() {
        if (editingLayout) {
          editingLayout.cancel();
          layout.start();
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

        scope.rows = chunk(scope.renderModel.categories, categoriesPerRow);
        scope.choiceWidth = calcChoiceWidth();

        scope.categoryStyle = {
          width: 100 / categoriesPerRow + '%'
        };

        //in editor we need some space to show all the tools
        //so we limit the number of choices per row to 4
        scope.choiceStyle = {
          width: (100 / (scope.isEditMode ? Math.min(4, choicesPerRow) : choicesPerRow)) + '%'
        };

        updateLayoutConfig(scope.choiceWidth);
        renderMath();
      }

      function calcChoiceWidth() {
        if (!scope.renderModel.choices) {
          return 0;
        }
        return ((elem.width() || 600) - 64) / scope.choicesPerRow;
      }

      function chunk(arr, chunkSize) {
        //can be replaced with _.chunk, once lodash has been updated
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
        var choice = _.find(scope.renderModel.allChoices || scope.renderModel.choices, byId(choiceId));
        scope.$apply(function() {
          category.choices.push(wrapChoiceModel(choice));
        });

        if (choice.moveOnDrag && !scope.isEditMode) {
          _.remove(scope.renderModel.choices, byId(choiceId));
        }
        updateView();
      }

      function onCategoryDeleteClicked(categoryId) {
        _.remove(scope.renderModel.categories, byModelId(categoryId));
      }

      function findInAllCategories(choiceId) {
        return _.find(scope.renderModel.categories, function(category) {
          return _.find(category.choices, byModelId(choiceId)) !== undefined;
        });
      }

      function onChoiceRemovedFromCategory(categoryId, choiceId) {
        var category = _.find(scope.renderModel.categories, byModelId(categoryId));
        if (category) {
          _.remove(category.choices, byModelId(choiceId));

          if (!scope.isEditMode) {
            var choice = _.find(scope.renderModel.allChoices, byId(choiceId));
            if (choice && choice.moveOnDrag && !findInAllCategories(choiceId)) {
              addChoiceBackIn(choice);
            }
          }
        }
      }

      /**
       * Add choice back in at the same position where it was in the beginning
       * Obviously works only if the order of the choices has not been changed
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
            _.remove(category.choices, byId(choiceId));
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
        }
      }

      function setRenderModelFromEditor() {
        if (!layout) {
          initLayouts();
        }

        var renderModel = {
          dragAndDropScope: 'scope-' + Math.floor(Math.random() * 10000)
        };

        renderModel.choices = scope.attrChoices;
        renderModel.allChoices = _.take(renderModel.choices, all);
        renderModel.categories = scope.attrCategories;

        scope.renderModel = renderModel;
      }

      function renderMath() {
        scope.$emit('rerender-math', {
          delay: 100,
          element: elem[0]
        });
      }

      function updateIsDragEnabled() {
        scope.isDragEnabled = _.isUndefined(scope.response);
        scope.isDragEnabledFromCategory = scope.isDragEnabled && !scope.isEditMode;
      }

      function showSeeCorrectAnswer(response) {
        if (!response) {
          return false;
        }
        return response.correctness !== 'correct';
      }

      function getEditMode(choice) {
        if (!scope.isEditMode) {
          return '';
        }
        if (choice === scope.editedChoice) {
          return 'editing';
        }
        return 'editable';
      }

      function onCategoryEditClicked(categoryId) {
        scope.activate(categoryId);
      }

      function onChoiceEditClicked(choiceId) {
        scope.activate(choiceId);

        scope.editedChoice = _.find(scope.renderModel.choices, byId(choiceId));
        startEditingLayout(choiceElement());
        //$('body').one('click', exitChoiceEditing);

        function choiceElement() {
          var choiceElementSelector = '.container-choices [choice-id="' + choiceId + '"]';
          return elem.find(choiceElementSelector);
        }

        function exitChoiceEditing(e) {
          if (!clickedOnChoice(e) &&
            scope.editedChoice && scope.editedChoice.id === choiceId) {
            stopEditingLayout();
            scope.editedChoice = null;
          }
        }

        function clickedOnChoice(e) {
          var $target = $(e.target);
          return choiceElement().has($target).length === 0;
        }
      }

      function revertToState(state) {
        scope.renderModel = _.cloneDeep(state);
        updateView();
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
    }

    function template() {
      return [
        '<div class="render-corespring-dnd-categorize">',
        undoStartOver(),
        interaction(),
        itemFeedbackPanel(),
        seeSolutionPanel(),
        '</div>'
      ].join('\n');
    }

    function undoStartOver() {
      return [
        '<div corespring-undo-start-over="" ',
        '    ng-show="editable"',
        '    render-model="renderModel"',
        '    revert-to-state="revertToState(state)"',
        '></div>'
      ].join('');
    }

    function itemFeedbackPanel() {
      return [
        '<div feedback="response.feedback"',
        '   correct-class="{{response.correctClass}} {{response.warningClass}}"></div>'
      ].join('');
    }

    function seeSolutionPanel() {
      return [
        '<div see-answer-panel="true"',
        '    see-answer-panel-expanded="isSeeAnswerPanelExpanded"',
        '    ng-if="response.correctResponse">',
        seeSolutionContent(),
        '</div>'
      ].join('');
    }

    function interaction() {
      return [
        '<div class="interaction-corespring-dnd-categorize">',
        choicesTemplate("shouldFlip"),
        categoriesTemplate("!shouldFlip", "rows"),
        '  <hr/>',
        '  <span ng-if="isEditMode" class="choice-area-label">',
        '    Enter choices below and drag to correct categories above. ',
        '    Choice tiles may be reused unless \"Remove after Placing\" option is selected.',
        '  </span>',
        '  <h3 ng-if="isEditMode">Choices</h3>',
        choicesTemplate('!shouldFlip'),
        categoriesTemplate('shouldFlip', 'rows'),
        '</div>'
      ].join('');
    }

    function choicesTemplate(flip) {
      return [
        '<div class="container-choices-holder">',
        '  <div class="container-choices" ng-if="#flip#">',
        '    <div choice-corespring-dnd-categorize="true" ',
        '      choice-id="{{choice.id}}" ',
        '      delete-after-placing="choice.moveOnDrag" ',
        '      drag-and-drop-scope="{{renderModel.dragAndDropScope}}"',
        '      drag-enabled="isDragEnabled"',
        '      edit-mode="getEditMode(choice)" ',
        '      image-service="imageService"',
        '      model="choice" ',
        '      ng-repeat="choice in renderModel.choices track by choice.id" ',
        '      ng-style="choiceStyle" ',
        '      on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
        '      on-edit-clicked="onChoiceEditClicked(choiceId)" ',
        '    ></div>',
        '  </div>',
        '</div>'
      ].join('').replace('#flip#', flip);
    }

    function categoriesTemplate(flip, rowsModel) {
      return [
        '<div class="categories-holder">',
        '  <div class="categories" ng-if="#flip#">',
        '    <div class="row" ng-repeat="row in #rowsModel#">',
        '      <div category-corespring-dnd-categorize="true" ',
        '        category="category" ',
        '        choice-width="{{choiceWidth}}"',
        '        drag-and-drop-scope="{{renderModel.dragAndDropScope}}"',
        '        drag-enabled="isDragEnabledFromCategory"',
        '        edit-mode="isEditMode" ',
        '        ng-repeat="category in row"',
        '        ng-style="categoryStyle"',
        '        on-choice-dragged-away="onChoiceRemovedFromCategory(fromCategoryId,choiceId)" ',
        '        on-edit-clicked="onCategoryEditClicked(categoryId)" ',
        '        on-delete-choice-clicked="onChoiceRemovedFromCategory(categoryId,choiceId)" ',
        '        on-delete-clicked="onCategoryDeleteClicked(categoryId)" ',
        '        on-drop="onCategoryDrop(categoryId,choiceId)" ',
        '       ></div>',
        '     </div>',
        '  </div>',
        '</div>'
      ].join('').replace('#flip#', flip).replace('#rowsModel#', rowsModel);
    }

    function seeSolutionContent() {
      return [
        categoriesTemplate('true', 'correctAnswerRows')
      ].join('');
    }
  }];


exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];