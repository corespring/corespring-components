exports.framework = 'angular';
exports.directives = [{
  directive: [
    '$log',
    '$timeout',
    'ColumnLayout',
    'CompactLayout',
    'LayoutConfig',
    'LayoutRunner',
    'MathJaxService',
    renderCorespringDndCategorize
  ]
}];

function renderCorespringDndCategorize(
  $log,
  $timeout,
  ColumnLayout,
  CompactLayout,
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
    scope: {
      mode: '@',
      attrCategories: '=?categories',
      attrChoices: '=?choices',
      attrChoicesLabel: '=?choicesLabel',
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
    var layout;

    scope.correctAnswerRows = [[]];
    scope.editable = false;
    scope.isEditMode = attrs.mode === 'edit';
    scope.renderModel = {};
    scope.rows = [[]];
    scope.shouldFlip = false;

    scope.getEditMode = getEditMode;
    scope.isDragEnabled = isDragEnabled;
    scope.isDragEnabledFromCategory = isDragEnabledFromCategory;
    scope.onCategoryDeleteClicked = onCategoryDeleteClicked;
    scope.onCategoryDrop = onCategoryDrop;
    scope.onChoiceDeleteClicked = onChoiceDeleteClicked;
    scope.onChoiceRemovedFromCategory = onChoiceRemovedFromCategory;
    scope.revertToState = revertToState;

    scope.containerBridge = {
      answerChangedHandler: saveAnswerChangedCallback,
      editable: setEditable,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty,
      reset: reset,
      setDataAndSession: setDataAndSession,
      setMode: function(mode) {},
      setResponse: setResponse,
      setInstructorData: setInstructorData
    };

    scope.$watch('categoriesPerRow', updateView);
    scope.$watch('choicesPerRow', updateView);
    scope.$watch('renderModel', callAnswerChangedHandlerIfAnswersHaveChanged, true);
    scope.$watch('renderModel.categories.length', updateView);
    scope.$watch('renderModel.choices.length', updateView);
    scope.$watch('shouldFlip', updateView);

    if (scope.isEditMode) {
      scope.$watch('attrCategories.length', setRenderModelFromEditor);
      scope.$watch('attrChoices.length', setRenderModelFromEditor);
      scope.$watch('attrChoicesLabel', updateChoicesLabelFromEditor);
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
      scope.session = dataAndSession.session || {};
      setConfig(dataAndSession.data.model);
      initLayouts();

      scope.$broadcast('reset');
      scope.renderModel = prepareRenderModel(scope.data.model, scope.session);
      scope.saveRenderModel = _.cloneDeep(scope.renderModel);
      updateView();
    }

    function setConfig(model) {
      scope.categoriesPerRow = model.config.categoriesPerRow || 2;
      scope.choicesPerRow = model.config.choicesPerRow || 4;
      scope.shouldFlip = model.config.answerAreaPosition === 'above';
    }

    function prepareRenderModel(model, session) {
      var dragAndDropScope = 'scope-' + Math.floor(Math.random() * 10000);

      var choices = model.config.shuffle ? _.shuffle(model.choices) : _.take(model.choices, all);
      var choicesLabel = model.config.choicesLabel;
      var allChoices = _.take(choices, all);
      var categories = _.map(model.categories, wrapCategoryModel);
      if (session.answers) {
        _.forEach(categories, function(cat) {
          var answers = session.answers[cat.model.id];
          if (_.isArray(answers)) {
            cat.choices = _(answers).map(getChoiceForId).map(wrapChoiceModel).value();
          }
        });
      }
      return {
        dragAndDropScope: dragAndDropScope,
        choices: choices,
        choicesLabel: choicesLabel,
        allChoices: allChoices,
        categories: categories
      };

      function getChoiceForId(choiceId) {
        return _.find(choices, {
          id: choiceId
        });
      }
    }

    function getSession() {
      var numberOfAnswers = 0;
      var answers = _.reduce(scope.renderModel.categories, function(result, category) {
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

    function setInstructorData(data) {
      log('setInstructorData', data);
      scope.renderModel = prepareRenderModel(scope.data.model, {answers: data.correctResponse});
      scope.renderModel.choices = [];

      var detailedFeedback = {};
      var categories = _.map(scope.data.model.categories, wrapCategoryModel);
      _.forEach(categories, function(cat) {
        detailedFeedback[cat.model.id] = {correctness: _.map(data.correctResponse[cat.model.id], function(c) {
          return "correct";
        })};
      });

      setResponse({correctness: "correct", correctClass: "correct", score: 1, correctResponse: data.correctResponse, detailedFeedback: detailedFeedback});
      scope.response = "dummy";
      scope.editable = false;
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
        if (!_.isEqual(session, lastSession)) {
          lastSession = session;
          scope.answerChangedCallback();
        }
      }
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
        .withCellWidth(calcChoiceWidth())
        .withPaddingBottom(7)
        .value(),
        new LayoutRunner($timeout));
    }

    function destroyLayouts() {
      if (layout) {
        layout.cancel();
      }
    }

    function updateLayoutConfig(cellWidth) {
      if (layout) {
        layout.updateConfig({
          container: elem.find('.choices-container'),
          cellWidth: cellWidth
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

      scope.rows = chunk(scope.renderModel.categories, categoriesPerRow);
      scope.categoryStyle = {
        width: 100 / categoriesPerRow + '%'
      };

      scope.choiceWidth = calcChoiceWidth();
      if(scope.choiceWidth === 0){
        $timeout(updateView, 100);
      }

      //in editor we need some space to show all the tools
      //so we limit the number of choices per row to 4
      scope.choiceStyle = {
        width: scope.choiceWidth + 'px'
      };

      updateLayoutConfig(scope.choiceWidth);
      renderMath();
    }

    /**
     * We start with a total width for the categories
     * which holds numberOfCategories plus some paddings
     * The choices should fit into the categories without
     * resizing. They have to take paddings inside of
     * the categories into account.
     *
     * @returns {number}
     */
    function calcChoiceWidth() {
      var maxChoiceWidth = elem.find('.choice-container').width();
      maxChoiceWidth -=2*3; //margin of choice.border
      if(maxChoiceWidth < 0){
        return 0;
      }
      if(scope.choicesPerRow <= scope.categoriesPerRow) {
        return maxChoiceWidth;
      }
      var totalChoiceWidth = maxChoiceWidth * scope.categoriesPerRow;
      return totalChoiceWidth / scope.choicesPerRow;
    }

    function chunk(arr, chunkSize) {
      if(_.isFunction(_.chunk)){
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
      var choice = _.find(scope.renderModel.allChoices || scope.renderModel.choices, byId(choiceId));

      scope.$apply(function() {
        category.choices.push(wrapChoiceModel(choice));
        if (choice.moveOnDrag && !scope.isEditMode) {
          _.remove(scope.renderModel.choices, byId(choiceId));
        }
      });

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

    function onChoiceRemovedFromCategory(categoryId, choiceId, index) {
      var category = _.find(scope.renderModel.categories, byModelId(categoryId));
      if (category) {
        category.choices.splice(index, 1);

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

    function setRenderModelFromEditor() {
      if (!layout) {
        initLayouts();
      }

      var renderModel = {
        dragAndDropScope: 'scope-' + Math.floor(Math.random() * 10000)
      };

      renderModel.choices = scope.attrChoices;
      renderModel.choicesLabel = scope.attrChoicesLabel;
      renderModel.allChoices = _.take(renderModel.choices, all);
      renderModel.categories = scope.attrCategories;

      scope.renderModel = renderModel;
    }

    function renderMath() {
      MathJaxService.parseDomForMath(100, elem[0]);
    }

    function isDragEnabled(choice){
      return !scope.response &&
          (choiceCanBePlacedMultipleTimes(choice) || choiceIsNotPlaced(choice));

      function choiceCanBePlacedMultipleTimes(choice){
        return !choice.moveOnDrag;
      }

      function choiceIsNotPlaced(choice){
        return !findInAllCategories(choice.id);
      }
    }

    function isDragEnabledFromCategory() {
      return !scope.response && !scope.isEditMode;
    }

    function getEditMode(choice) {
      if (!scope.isEditMode) {
        return '';
      }
      return 'editable';
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
        '  <h3 ng-if="isEditMode">Choices</h3>',
        '  <span ng-if="isEditMode" class="choice-area-label">',
        '    Enter choices below and drag to correct categories above. ',
        '    Choice tiles may be reused unless \"Remove after Placing\" option is selected.',
        '  </span>',
        choicesTemplate('!shouldFlip'),
        categoriesTemplate('shouldFlip', 'rows'),
        '</div>'
      ].join('');
  }

  function choicesTemplate(flip) {
    return [
        '<div class="choices-container-holder" ng-if="#flip#">',
        '  <div label-editor-corespring-dnd-categorize="true"',
        '      active-id="choices-label"',
        '      class="choices-label-editor"',
        '      editable="isEditMode"',
        '      model="renderModel.choicesLabel"',
        '      on-edit-clicked="activate(activeId)"',
        '   >',
        '  </div>',
        '  <div class="choices-container">',
        '    <div choice-corespring-dnd-categorize="true" ',
        '      choice-id="{{choice.id}}" ',
        '      delete-after-placing="choice.moveOnDrag" ',
        '      drag-and-drop-scope="renderModel.dragAndDropScope"',
        '      drag-enabled="isDragEnabled(choice)"',
        '      edit-mode="getEditMode(choice)" ',
        '      image-service="imageService"',
        '      model="choice" ',
        '      ng-repeat="choice in renderModel.choices track by choice.id" ',
        '      ng-style="choiceStyle" ',
        '      on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
        '      on-edit-clicked="activate(choiceId)" ',
        '    ></div>',
        '  </div>',
        '</div>'
      ].join('').replace('#flip#', flip);
  }

  function categoriesTemplate(flip, rowsModel) {
    return [
        '<div class="categories-holder" ng-if="#flip#">',
        '  <div class="categories">',
        '    <div class="row" ng-repeat-start="row in #rowsModel#">',
        '      <div category-label-corespring-dnd-categorize="true" ',
        '        category="category" ',
        '        edit-mode="isEditMode" ',
        '        ng-repeat="category in row"',
        '        ng-style="categoryStyle"',
        '        on-edit-clicked="activate(categoryId)" ',
        '        on-delete-clicked="onCategoryDeleteClicked(categoryId)" ',
        '       ></div>',
        '     </div>',
        '    <div class="row" ng-repeat-end>',
        '      <div category-choices-corespring-dnd-categorize="true" ',
        '        category="category" ',
        '        choice-width="{{choiceWidth}}"',
        '        drag-and-drop-scope="renderModel.dragAndDropScope"',
        '        drag-enabled="isDragEnabledFromCategory()"',
        '        edit-mode="isEditMode" ',
        '        ng-class="response.warningClass"',
        '        ng-repeat="category in row"',
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
      ].join('').replace('#flip#', flip).replace('#rowsModel#', rowsModel);
  }

  function seeSolutionContent() {
    return [
        categoriesTemplate('true', 'correctAnswerRows')
      ].join('');
  }
}