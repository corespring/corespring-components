var main = [
  '$timeout',
  'LayoutConfig',
  'LayoutRunner',
  'CompactLayout',
  'CompactLayoutWhileEditing',
  function($timeout, LayoutConfig, LayoutRunner, CompactLayout, CompactLayoutWhileEditing) {

    return {
      restrict: 'AE',
      replace: true,
      link: link,
      scope: {},
      template: template()
    };

    function link(scope, elem, attrs) {

      var layout, editingLayout;
      var log = console.log.bind(console, '[dnd-categorize]');

      scope.correctAnswerRows = [[]];
      scope.editable = false;
      scope.isDragEnabled = false;
      scope.isDragEnabledFromCategory = false;
      scope.isEditMode = attrs.mode === 'edit';
      scope.isSeeCorrectAnswerOpen = false;
      scope.renderModel = {};
      scope.rows = [[]];
      scope.undoStack = [];

      scope.getEditMode = getEditMode;
      scope.onCategoryDeleteClicked = onCategoryDeleteClicked;
      scope.onCategoryDrop = onCategoryDrop;
      scope.onChoiceDeleteClicked = onChoiceDeleteClicked;
      scope.onChoiceEditClicked = onChoiceEditClicked;
      scope.onChoiceRemovedFromCategory = onChoiceRemovedFromCategory;
      scope.showSeeCorrectAnswer = showSeeCorrectAnswer;

      scope.containerBridge = {
        editable: setEditable,
        getSession: getSession,
        reset: reset,
        setDataAndSession: setDataAndSession,
        setResponse: setResponse
      };

      scope.$watch('response', updateIsDragEnabled);
      scope.$watch('choices.length', updateView);
      scope.$watch('categories.length', updateView);
      scope.$watch('categoriesPerRow', updateView);
      scope.$watch('choicesPerRow', updateView);
      scope.$watch('shouldFlip', updateView);

      scope.$on("$destroy", onDestroy);

      if (scope.isEditMode) {
        scope.$watch('attrCategories.length', updateCategoriesAndChoicesFromEditor);
        scope.$watch('attrChoices.length', updateCategoriesAndChoicesFromEditor);
      } else {
        scope.$watch('renderModel', updateUndoStack, true);
      }

      if (!scope.isEditMode) {
        scope.$emit('registerComponent', attrs.id, scope.containerBridge, elem[0]);
      }

      //-----------------------------------------------------------

      function setDataAndSession(dataAndSession) {
        log("setDataAndSession ", dataAndSession);

        scope.editable = true;
        scope.session = dataAndSession.session;
        scope.data = dataAndSession.data;
        setConfig(dataAndSession.data.model);
        scope.renderModel = prepareRenderModel(dataAndSession.data.model, dataAndSession.session);
        scope.saveRenderModel = _.cloneDeep(scope.renderModel);

        initLayouts();
        updateView();
      }

      function setConfig(model) {
        scope.categoriesPerRow = parseInt(model.config.categoriesPerRow, 10) || 2;
        scope.choicesPerRow = parseInt(model.config.choicesPerRow, 10) || 4;
        scope.shouldFlip = model.config.answerAreaPosition === 'above';
      }

      function prepareRenderModel(model, session) {
        var renderModel = {};
        renderModel.choices = model.config.shuffle ?
          _.shuffle(model.choices) :
          _.take(model.choices, all);
        renderModel.allChoices = _.take(renderModel.choices, all);
        renderModel.categories = _.map(model.categories, wrapCategoryModel);
        _.forEach(renderModel.categories, function(category) {
          category.choices = category.choices || [];
        });
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
        scope.response = response;

        setSpecificFeedback(response);
        initSeeSolutionModel(response);
      }

      function setSpecificFeedback(response) {
        if(!response.specificFeedback){
          return;
        }
        _.forEach(scope.renderModel.categories, function(cat){
          var feedback = response.specificFeedback[cat.model.id];
          if(feedback.answersExpected){
            cat.answersExpected = true;
          }
          _.forEach(cat.choices, function(choice, choiceIndex){
            choice.correctness = feedback.correctness[choiceIndex];
          });
        });
      }

      function initSeeSolutionModel(response) {
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
        scope.editable = true;
        scope.isSeeAnswerPanelExpanded = false;
        scope.response = undefined;

        scope.renderModel = _.cloneDeep(scope.saveRenderModel);
      }

      function setEditable(e) {
        scope.editable = true;
      }

      function initLayouts() {
        if (layout) {
          layout.cancel();
        }
        layout = new CompactLayout(
          new LayoutConfig()
          .withContainer(elem.find(".container-choices"))
          .withItemSelector(".choice-corespring-dnd-categorize")
          .withCellWidth(calcChoiceWidth())
          .value(),
          new LayoutRunner($timeout));

        if (editingLayout) {
          editingLayout.cancel();
        }
        editingLayout = new CompactLayoutWhileEditing(
          new LayoutConfig()
          .withContainer(elem.find(".container-choices"))
          .withItemSelector(".choice-corespring-dnd-categorize")
          .value(),
          new LayoutRunner($timeout));
      }

      function onDestroy() {
        if (layout) {
          layout.cancel();
        }
        if (editingLayout) {
          editingLayout.cancel();
        }
      }

      function updateView() {
        if (!scope.renderModel.categories || !scope.renderModel.choices) {
          return;
        }

        var categoriesPerRow = parseInt(scope.categoriesPerRow, 10);
        if (isNaN(categoriesPerRow)) {
          return;
        }

        scope.rows = chunk(scope.renderModel.categories, categoriesPerRow);

        scope.choiceWidth = calcChoiceWidth();

        scope.categoryStyle = {
          "width": elem.width() / categoriesPerRow
        };
        scope.choiceStyle = {
          "width": scope.choiceWidth
        };
        layout.updateConfig({
          container: elem.find(".container-choices"),
          cellWidth: scope.choiceWidth
        });

        renderMath();
      }

      function calcChoiceWidth() {
        if (!scope.renderModel.choices) {
          return 0;
        }
        var choicesPerRow = parseInt(scope.choicesPerRow, 10);
        return elem.width() / choicesPerRow;
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
        var choiceInCategory = _.find(category.choices, byModelId(choiceId));
        if (!choiceInCategory) {
          var choice = _.find(scope.renderModel.allChoices || scope.renderModel.choices, byId(choiceId));
          scope.$apply(function() {
            category.choices.push(wrapChoiceModel(choice));
          });

          if (choice.moveOnDrag && !scope.isEditMode) {
            _.remove(scope.renderModel.choices, byId(choiceId));
          }
        }
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
          var choice = _.find(scope.renderModel.allChoices || scope.renderModel.choices, byId(choiceId));
          if (!scope.isEditMode && choice && choice.moveOnDrag && !findInAllCategories(choiceId)) {
            scope.renderModel.choices.push(choice);
          }
        }
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
          correctness: "none"
        };
      }

      function wrapCategoryModel(categoryModel) {
        return {
          model: categoryModel,
          choices: []
        };
      }

      function updateCategoriesAndChoicesFromEditor() {
        //TODO Changes from the editor?
        //That is used in config. Do we really want that? Doesn't it mean we
        //include editing related stuff like wiggi in to player?
        scope.renderModel.choices = scope.attrChoices;
        scope.renderModel.categories = scope.attrCategories;

        //TODO Why does it reset shouldFlip ?
        scope.shouldFlip = false;
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

      function onChoiceEditClicked(choiceId) {
        log('editedChoice', choiceId);
        scope.editedChoice = _.find(scope.renderModel.choices, byId(choiceId));
        layout.cancel();

        var choiceElementSelector = '.container-choices [choice-id="' + choiceId + '"]';
        var choiceElement = elem.find(choiceElementSelector);

        editingLayout.start({
          container: elem.find(".container-choices"),
          editedElement: choiceElement
        });

        $('body').on('click', function(e) {
          var $target = $(e.target);
          if (choiceElement.has($target).length === 0 && scope.editedChoice && scope.editedChoice.id === choiceId) {
            editingLayout.cancel();
            layout.start();
            scope.editedChoice = null;
          }
        });
      }

      function updateUndoStack(newValue, oldValue) {
        //log("updateUndoStack", newValue);
        if (newValue && !_.isEqual(newValue, _.last(scope.undoStack))) {
          scope.undoStack.push(_.cloneDeep(newValue));
        }
      }

      function startOver() {
        scope.undoStack = [_.first(scope.undoStack)];
        revertToState(_.first(scope.undoStack));
      }

      function undo() {
        if (scope.undoStack.length < 2) {
          return;
        }
        scope.undoStack.pop();
        revertToState(_.last(scope.undoStack));
      }

      function revertToState(state) {
        scope.renderModel = state;
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
        '<div ng-show="editable" class="undo-start-over pull-right">',
        '  <button type="button" class="btn btn-default" ng-click="undo()" ng-disabled="undoStack.length < 2"><i class="fa fa-undo"></i> Undo</button>',
        '  <button type="button" class="btn btn-default" ng-click="startOver()" ng-disabled="undoStack.length < 2">Start over</button>',
        '</div>',
        '<div class="clearfix"></div>'
      ].join('');
    }

    function itemFeedbackPanel() {
      return [
        '<div feedback="response.feedback"',
        '   correct-class="{{response.correctClass}}"></div>'
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
        '    Choice tiles may be reused unless \"Remove Tile after Placing\" option is selected.',
        '  </span>',
        choicesTemplate("!shouldFlip"),
        categoriesTemplate("shouldFlip", "rows"),
        '</div>'
      ].join('');
    }

    function choicesTemplate(flip) {
      return [
        '<div class="container-choices" ng-if="#flip#">',
        '  <div choice-corespring-dnd-categorize="true" ',
        '    ng-repeat="choice in renderModel.choices track by choice.id" ',
        '    drag-enabled="isDragEnabled"',
        '    edit-mode="getEditMode(choice)" ',
        '    model="choice" ',
        '    choice-id="{{choice.id}}" ',
        '    on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
        '    on-edit-clicked="onChoiceEditClicked(choiceId)" ',
        '    delete-after-placing="choice.moveOnDrag" ',
        '    ng-style="choiceStyle" ',
        '    image-service="imageService"',
        '   ></div>',
        '</div>'
      ].join('').replace("#flip#", flip);
    }

    function categoriesTemplate(flip, rowsModel) {
      return [
        '<div class="categories" ng-if="#flip#">',
        '  <div class="row" ng-repeat="row in #rowsModel#">',
        '    <div category-corespring-dnd-categorize="true" ',
        '      ng-repeat="category in row"',
        '      category-id="{{category.model.id}}" ',
        '      choice-width="{{choiceWidth}}"',
        '      choices="category.choices"',
        '      drag-enabled="isDragEnabledFromCategory"',
        '      edit-mode="isEditMode" ',
        '      label="category.model.label" ',
        '      ng-style="categoryStyle"',
        '      on-choice-dragged-away="onChoiceRemovedFromCategory(fromCategoryId,choiceId)" ',
        '      on-delete-choice-clicked="onChoiceRemovedFromCategory(categoryId,choiceId)" ',
        '      on-delete-clicked="onCategoryDeleteClicked(categoryId)" ',
        '      on-drop="onCategoryDrop(categoryId,choiceId)" ',
        '     ></div>',
        '   </div>',
        ' </div>'
      ].join('').replace("#flip#", flip).replace("#rowsModel#", rowsModel);
    }

    function seeSolutionContent() {
      return [
        categoriesTemplate("true", "correctAnswerRows")
      ].join("");
    }
  }];


exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];


