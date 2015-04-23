var main = [
  '$timeout',
  'LayoutRunner',
  function($timeout, LayoutRunner) {

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
        //TODO Changes from the editor? setDataAndSession not sufficient?
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

// ---------------------------------------------------------------------------------------------------------------------

var category = ['$timeout', 'LayoutRunner', function($timeout, LayoutRunner) {

  return {
    restrict: 'A',
    replace: true,
    link: link,
    template: template(),
    scope: {
      choices: '=',
      choiceWidth: '@',
      dragEnabled: '=',
      isEditMode: '=?editMode',
      label: '=',
      notifyDeleteChoiceClicked: '&onDeleteChoiceClicked',
      notifyDeleteClicked: '&onDeleteClicked',
      onChoiceDraggedAway: '&',
      onDrop: '&'
    }
  };

  function link(scope, elem, attrs) {

    var layout;
    var isLocalChoiceDragged = false;

    scope.choiceEditMode = scope.isEditMode ? 'delete' : '';
    scope.showTools = scope.isEditMode;

    scope.droppableOptions = {
      multiple: true,
      onDrop: 'onDropCallback',
      onOver: 'onOverCallback',
      onOut: 'onOutCallback'
    };

    scope.onDeleteClicked = onDeleteClicked;
    scope.onChoiceDeleteClicked = onChoiceDeleteClicked;
    scope.onDropCallback = onDropCallback;
    scope.onOverCallback = onOverCallback;
    scope.onOutCallback = onOutCallback;
    scope.onLocalChoiceDragStart = onLocalChoiceDragStart;
    scope.onLocalChoiceDragEnd = onLocalChoiceDragEnd;

    scope.$on('$destroy', onDestroy);
    attrs.$observe('choiceWidth', updateChoiceWidthInLayout);


    //---------------------------------------------------------------

    function onDeleteClicked() {
      scope.$$postDigest(function() {
        scope.notifyDeleteClicked({
          categoryId: attrs.categoryId
        });
      });
    }

    function onChoiceDeleteClicked(choiceId) {
      scope.notifyDeleteChoiceClicked({
        categoryId: attrs.categoryId,
        choiceId: choiceId
      });
    }

    function onDropCallback(e, draggable) {
      var choiceId = draggable.draggable.attr('choice-id');
      scope.isDraggedOver = false;
      scope.$$postDigest(function() {
        scope.onDrop({
          categoryId: attrs.categoryId,
          choiceId: choiceId
        });
      });
    }

    function onOverCallback(e, draggable) {
      var choiceId = draggable.draggable.attr('choice-id');

      if (choiceId !== "" && !isLocalChoiceDragged) {
        scope.$apply(function() {
          scope.isDraggedOver = true;
        });
      }
    }

    function onOutCallback() {
      scope.$apply(function() {
        scope.isDraggedOver = false;
      });
    }

    function onLocalChoiceDragStart(choiceId) {
      isLocalChoiceDragged = true;
    }

    function onLocalChoiceDragEnd(choiceId, dropEffect) {
      isLocalChoiceDragged = false;

      scope.onChoiceDraggedAway({
        fromCategoryId: attrs.categoryId,
        choiceId: choiceId
      });
    }

    function updateChoiceWidthInLayout(newValue, oldValue) {
      if (newValue !== oldValue && newValue > 0) {
        initLayout(newValue);
      }
    }

    function initLayout(choiceWidth) {
      if (!layout) {
        layout = new CompactLayout(
          new LayoutConfig()
          .withContainer(elem.find(".choice-container"))
          .withItemSelector(".choice-corespring-dnd-categorize")
          .withCellWidth(choiceWidth)
          .value(),
          new LayoutRunner($timeout));
      } else {
        layout.updateConfig(new LayoutConfig()
          .withCellWidth(choiceWidth)
          .value());
      }
    }

    function onDestroy() {
      if (layout) {
        layout.cancel();
      }
    }
  }

  function template() {
    return [
      '<div class="category"',
      '  ng-class="{draggedOver:isDraggedOver}" ',
      '  data-drop="true" ',
      '  jqyoui-droppable="droppableOptions"',
      '  >',
      '  <div class="border">',
      '    <h4 ng-if="isEditMode"><input class="label-input" type="text" ng-model="$parent.label"></h4>',
      '    <h4 ng-if="!isEditMode">{{label}}</h4>',
      editControlsDelete(),
      '    <div class="categorized choices">',
      '      <div class="choice-container" ng-class="{draggedOver:isDraggedOver}">',
      '        <div choice-corespring-dnd-categorize="true" ',
      '           choice-id="{{choice.model.id}}" ',
      '           correctness="{{choice.correctness}}" ',
      '           drag-enabled="dragEnabled" ',
      '           edit-mode="choiceEditMode" ',
      '           model="choice.model"',
      '           ng-repeat="choice in choices track by $index" ',
      '           ng-style="{width:choiceWidth}"',
      '           on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
      '           on-drag-end="onLocalChoiceDragEnd(choiceId,dropEffect)"',
      '           on-drag-start-now="onLocalChoiceDragStart(choiceId)" ',
      '        ></div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    function editControlsDelete() {
      return [
        '<ul class="edit-controls" ng-if="showTools">',
        deleteTool(),
        '</ul>'].join('');
    }

    function deleteTool() {
      return [
        '<li class="delete-icon-button" ng-click="onDeleteClicked()" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
        '  <i class="fa fa-trash-o"></i>',
        '</li>'].join('');
    }

  }
}];

// ---------------------------------------------------------------------------------------------------------------------

var choice = ['$sce', 'MiniWiggiScopeExtension', function($sce, MiniWiggiScopeExtension) {

  return {
    restrict: 'EA',
    replace: true,
    link: link,
    template: template(),
    scope: {
      dragEnabled: '=',
      model: '=',
      correctness: '@',
      onDragStart: '&onDragStartNow',
      onDragEnd: '&onDragEnd',
      notifyDeleteClicked: '&onDeleteClicked',
      notifyEditClicked: '&onEditClicked',
      editMode: '=?editMode',
      deleteAfterPlacing: '=?deleteAfterPlacing',
      imageService: "=?"
    }
  };

  function link(scope, elem, attrs) {

    new MiniWiggiScopeExtension().postLink(scope);

    scope.onStart = onStart;
    scope.onStop = onStop;
    scope.onDeleteClicked = onDeleteClicked;
    scope.canEdit = canEdit;
    scope.isEditing = isEditing;
    scope.canDelete = canDelete;
    scope.onChoiceEditClicked = onChoiceEditClicked;
    scope.isDragEnabled = isDragEnabled;

    scope.showTools = canEdit(scope.editMode) || canDelete(scope.editMode);
    scope.draggedParent = canEdit(scope.editMode) ? ".modal" : "body";

    scope.draggableOptions = {
      animate: true,
      placeholder: 'keep',
      onStart: 'onStart',
      onStop: 'onStop'
    };

    scope.draggableJqueryOptions = {
      revert: 'invalid',
      helper: 'clone',
      appendTo: scope.draggedParent
    };

    scope.$watch('correctness', updateClasses);
    scope.$watch('model.label', triggerResize);
    updateClasses();

    //------------------------------------------------

    function onStart() {
      scope.onDragStart({
        choiceId: attrs.choiceId
      });
    }

    function onStop() {
      scope.onDragEnd({
        choiceId: attrs.choiceId
      });
    }

    function onDeleteClicked() {
      scope.notifyDeleteClicked({
        choiceId: attrs.choiceId
      });
    }

    function canEdit() {
      return _.contains(scope.editMode, 'editable') || _.contains(scope.editMode, 'editing');
    }

    function isEditing() {
      return _.contains(scope.editMode, 'editing');
    }

    function canDelete() {
      return _.contains(scope.editMode, 'delete');
    }

    function isDragEnabled() {
      return scope.dragEnabled && !scope.isEditing();
    }

    function onChoiceEditClicked() {
      scope.notifyEditClicked({
        choiceId: attrs.choiceId
      });
    }

    function triggerResize() {
      $(window).trigger("resize");
    }

    function updateClasses() {
      var classes = [attrs.choiceId];

      if (scope.correctness && scope.correctness !== "") {
        classes.push(scope.correctness);
      }
      if (scope.canEdit()) {
        classes.push('editable');
      }
      if (scope.isEditing()) {
        classes.push('editing');
      }
      if (scope.canDelete()) {
        classes.push('delete');
      }

      scope.classes = classes;
    }

  }

  function template() {
    return [
      '<div class="choice-corespring-dnd-categorize" ',
      '  data-drag="isDragEnabled()"',
      '  ng-class="classes"',
      '  jqyoui-draggable="draggableOptions" ',
      '  data-jqyoui-options="draggableJqueryOptions">',
      '  <div class="border">',
      '    <ul class="edit-controls" ng-if="showTools">',
      '      <li class="delete-icon-button"',
      '        ng-click="onDeleteClicked()"',
      '        tooltip="delete" ',
      '        tooltip-append-to-body="true" ',
      '        tooltip-placement="bottom">',
      '        <i class="fa"></i>',
      '      </li>',
      '      <li class="edit-icon-button" ng-click="onChoiceEditClicked()" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i class="fa fa-pencil"></i>',
      '      </li>',
      '    </ul>',
      '    <div class="shell" ng-if="showTools" ng-show="isEditing()" >',
      choiceEditorTemplate(),
      '    </div>',
      '    <div class="shell" ng-bind-html-unsafe="model.label" ng-if="!isEditing()"></div>',
      '    <div class="delete-after-placing" ng-click="onDeleteAfterPlacingClicked()" ng-if="showTools">',
      '      <checkbox ng-model="model.moveOnDrag" class="control-label">Remove Tile after placing</checkbox>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    function choiceEditorTemplate() {
      return [
        '<div class="editor" ',
        '   mini-wiggi-wiz="" ',
        '   dialog-launcher="external" ',
        '   ng-model="model.label" ',
        '   placeholder="Enter a choice"',
        '   image-service="imageService()" ',
        '   features="extraFeatures" ',
        '   feature-overrides="overrideFeatures"',
        '   parent-selector=".modal-body"',
        '></div>'
      ].join('');
    }
  }
}];


exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: "categoryCorespringDndCategorize",
    directive: category
  },
  {
    name: "choiceCorespringDndCategorize",
    directive: choice
  }
];

/**
 * @param initialConfig:
 *  container: jquery element of the container
 *  itemSelector: string selector of an item to be layed out
 *  cellWidth: the desired width of one column
 *
 * This layout manager renders the layout every frame in the following order
 * 1. Selects all the items
 * 2. Sorts them by height
 * 3. Puts items in the most empty column until finished
 */
function CompactLayout(initialConfig, layoutRunner) {

  var hasNewConfig = false;
  var choiceSizeCache = [];
  var config = _.assign({}, initialConfig);

  this.updateConfig = updateConfig;
  this.refresh = refresh;
  this.start = startRunner;
  this.cancel = cancelRunner;

  this.start();

  //-----------------------------------------

  function refresh() {
    var choiceElements = config.container.find(config.itemSelector);

    if (!elementsShouldBeRendered(choiceElements)) {
      return;
    }

    var numColumns = Math.floor(config.container.width() / config.cellWidth);
    if (numColumns === 0) {
      return;
    }

    var columns = _.range(numColumns).map(function() {
      return [];
    });

    _.forEach(choiceElements, function(choice) {
      smallestColumn(columns).push(choice);
    });

    columns.forEach(function(colChoices, colIndex) {
      colChoices.forEach(function(choice, choiceIndex) {
        $(choice).css({
          position: 'absolute',
          top: getChoiceTop(colChoices, choiceIndex),
          left: config.cellWidth * colIndex
        });
      }, this);
    }, this);

    //the choices are positioned absolutely
    //so the container height is not pushed
    config.container.css({
      height: getContainerHeight(columns)
    });
  }

  function smallestColumn(columns) {
    return _.sortBy(columns, getColumnHeight)[0];
  }

  function elementsShouldBeRendered(choiceElements) {
    if (!hasNewConfig) {
      var heights = _(choiceElements).map(getElementHeight).value();
      var someElementsHaveZeroHeight = _.some(heights, function(height) {
        return height === 0;
      });
      if (someElementsHaveZeroHeight || _.isEqual(choiceSizeCache, heights)) {
        return false;
      }
      choiceSizeCache = heights;
    }
    hasNewConfig = false;
    return true;
  }

  function getChoiceTop(choices, index) {
    return _.reduce(_.take(choices, index), function(acc, choice) {
      return $(choice).height() + acc;
    }, 0);
  }

  function getContainerHeight(columns) {
    var tallestColumn = _.last(_.sortBy(columns, getColumnHeight));
    return getColumnHeight(tallestColumn);
  }

  function getColumnHeight(column) {
    return _.reduce(column, function(acc, el) {
      return acc + $(el).height();
    }, 0);
  }

  function getElementHeight(el) {
    if (!el) {
      return 0;
    }
    return $(el).height();
  }

  function updateConfig(newConfig) {
    hasNewConfig = true;
    config = _.assign(config, newConfig);
  }

  function startRunner() {
    layoutRunner.start(this);
  }

  function cancelRunner() {
    layoutRunner.cancel();
  }
}

/**
 *
 * @param initialConfig
 *  container: jquery element of the container
 *  editedElement: one of the items in the container that is being edited
 * @param interval
 * @constructor
 *
 * This layout manager tracks the height of an edited component and adjusts components positioned
 * after the edited one in the column
 */
function CompactLayoutWhileEditing(initialConfig, layoutRunner) {

  this.config = initialConfig;
  this.runner = layoutRunner;

  function isAbove(thisEl) {
    return function(thatEl) {
      var thisTop = thisEl.position().top;
      var thisLeft = thisEl.position().left;
      var thatTop = $(thatEl).position().top;
      var thatLeft = $(thatEl).position().left;
      return thisTop < thatTop && thisLeft === thatLeft;
    };
  }

  function byElementTopPosition(el) {
    var jqel = $(el);
    return jqel.position().top + jqel.height();
  }

  this.refresh = function() {
    var editedElement = this.config.editedElement;
    var choiceElements = this.config.container.find(this.config.itemSelector);
    var elementsAboveEdited = _.filter(choiceElements, isAbove(editedElement));

    elementsAboveEdited = _.sortBy(elementsAboveEdited, byElementTopPosition);

    var lastBottom = this.config.editedElement.position().top + this.config.editedElement.height();

    for (var i = 0; i < elementsAboveEdited.length; i++) {
      var jqel = $(elementsAboveEdited[i]);

      jqel.css({
        top: lastBottom
      });

      lastBottom = lastBottom + jqel.height();
    }

    this.getContainerHeight = function() {
      return _.reduce(choiceElements, function(acc, el) {
        var jqel = $(el);
        var elBottom = jqel.position().top + jqel.height();
        return acc < elBottom ? elBottom : acc;
      }, 0);
    };

    this.config.container.css({
      height: this.getContainerHeight()
    });
  };

  this.start = function(newConfig) {
    this.config = _.assign(this.config, newConfig);
    this.runner.start(this);
  };

  this.cancel = function() {
    this.runner.cancel();
  };
}

function LayoutConfig() {
  var config = {};

  this.withContainer = function(value) {
    config.container = value;
    return this;
  };

  this.withItemSelector = function(value) {
    config.itemSelector = value;
    return this;
  };

  this.withCellWidth = function(value) {
    config.cellWidth = value;
    return this;
  };

  this.value = function() {
    return config;
  };
}

