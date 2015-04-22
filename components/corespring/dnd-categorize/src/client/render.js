var main = [
  '$timeout',
  function($timeout) {

    return {
      restrict: 'AE',
      replace: true,
      link: link,
      scope: {
        mode: '@',
        attrCategories: '=?categories',
        attrChoices: '=?choices',
        categoriesPerRow: "=?",
        choicesPerRow: "=?",
        imageService: "=?"
      },
      template: template()
    };

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

    function link(scope, elem, attrs) {

      var GUTTER = 10;

      var layout = new CompactLayout({
        container: elem.find(".container-choices"),
        itemSelector: ".choice-corespring-dnd-categorize",
        cellWidth: cellWidth(GUTTER),
        gutter: GUTTER,
        border: 4
      }, new LayoutRunner($timeout));

      var editingLayout = new CompactLayoutWhileEditing({
        container: elem.find(".container-choices"),
        itemSelector: ".choice-corespring-dnd-categorize"
      }, new LayoutRunner($timeout));


      scope.isEditMode = attrs.mode === 'edit';
      scope.rows = [[]];
      scope.correctAnswerRows = [[]];
      scope.isSeeCorrectAnswerOpen = false;
      scope.isDragEnabled = false;
      scope.isDragEnabledFromCategory = false;

      scope.onCategoryDrop = onCategoryDrop;
      scope.onCategoryDeleteClicked = onCategoryDeleteClicked;
      scope.onChoiceRemovedFromCategory = onChoiceRemovedFromCategory;
      scope.onChoiceDeleteClicked = onChoiceDeleteClicked;
      scope.showSeeCorrectAnswer = showSeeCorrectAnswer;
      scope.getEditMode = getEditMode;
      scope.onChoiceEditClicked = onChoiceEditClicked;

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setResponse: setResponse,
        reset: reset
      };

      scope.$watch('response', updateIsDragEnabled);
      scope.$watch('choices.length', updateView);
      scope.$watch('categories.length', updateView);
      scope.$watch('categoriesPerRow', updateView);
      scope.$watch('choicesPerRow', updateView);
      scope.$watch('shouldFlip', updateView);

      if (scope.isEditMode) {
        scope.$watch('attrCategories.length', onChangeCategoriesOrChoices);
        scope.$watch('attrChoices.length', onChangeCategoriesOrChoices);
      }

      if (!scope.isEditMode) {
        scope.$emit('registerComponent', attrs.id, scope.containerBridge, elem[0]);
      }

      //-----------------------------------------------------------

      function cellWidth(gutter) {
        if (!scope.choices) {
          return 0;
        }
        var choicesPerRow = parseInt(scope.choicesPerRow, 10);
        return (elem.width() - (gutter * (choicesPerRow - 1))) / choicesPerRow;
      }

      function updateView() {
        if (!scope.categories || !scope.choices) {
          return;
        }

        var categoriesPerRow = parseInt(scope.categoriesPerRow, 10);
        if (isNaN(categoriesPerRow)) {
          return;
        }

        scope.rows = chunk(scope.categories, categoriesPerRow);

        scope.categoryStyle = {
          "width": cellWidth(20)
        };
        scope.choiceStyle = {
          "width": cellWidth(GUTTER)
        };
        layout.updateConfig({
          container: elem.find(".container-choices"),
          cellWidth: cellWidth(GUTTER)
        });

      }

      function chunk(arr, chunkSize){
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
        var category = _.find(scope.categories, byModelId(categoryId));
        var choiceInCategory = _.find(category.choices, byModelId(choiceId));
        if (!choiceInCategory) {
          var choice = _.find(scope.allChoices || scope.choices, byId(choiceId));
          scope.$apply(function() {
            category.choices.push(wrapChoiceModel(choice));
          });

          if (choice.moveOnDrag && !scope.isEditMode) {
            _.remove(scope.choices, byId(choiceId));
          }
        }
      }

      function onCategoryDeleteClicked(categoryId) {
        _.remove(scope.categories, byModelId(categoryId));
      }

      function findInAllCategories(choiceId) {
        return _.find(scope.categories, function(category) {
          return _.find(category.choices, byModelId(choiceId)) !== undefined;
        });
      }

      function onChoiceRemovedFromCategory(categoryId, choiceId) {
        var category = _.find(scope.categories, byModelId(categoryId));
        if (category) {
          _.remove(category.choices, byModelId(choiceId));
          var choice = _.find(scope.allChoices || scope.choices, byId(choiceId));
          if (!scope.isEditMode && choice && choice.moveOnDrag && !findInAllCategories(choiceId)) {
            scope.choices.push(choice);
          }
        }
      }

      function onChoiceDeleteClicked(choiceId) {
        _.remove(scope.choices, byId(choiceId));
        _.forEach(scope.categories, function(category) {
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

      function onChangeCategoriesOrChoices() {
        scope.choices = scope.attrChoices;
        scope.categories = scope.attrCategories;
        scope.shouldFlip = false;
      }

      function setDataAndSession(dataAndSession) {
        console.log("[dnd-categorize] setDataAndSession ", dataAndSession);

        this.reset();
        scope.session = dataAndSession.session || {};
        scope.choices = dataAndSession.data.model.config.shuffle ?
          _.shuffle(dataAndSession.data.model.choices) :
          _.take(dataAndSession.data.model.choices, all);
        scope.allChoices = _.take(scope.choices, all);
        scope.categories = _.map(dataAndSession.data.model.categories, wrapCategoryModel);
        _.forEach(scope.categories, function(category) {
          category.choices = category.choices || [];
        });
        scope.categoriesPerRow = dataAndSession.data.model.config.categoriesPerRow || 3;
        scope.choicesPerRow = dataAndSession.data.model.config.choicesPerRow || 4;
        scope.shouldFlip = dataAndSession.data.model.config.answerAreaPosition === 'above';

        updateView();
      }

      function getSession() {
        var answers = _.reduce(scope.categories, function(result, category) {
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
        scope.feedback = response.feedback;
        scope.correctClass = response.correctClass;

        // Update categories with responses
        _.forEach(scope.categories, function(category) {
          var correctChoices = response.correctResponse[category.model.id];
          _.forEach(category.choices, function(choice) {
            if (_.contains(correctChoices, choice.model.id)) {
              choice.correctness = 'correct';
            } else {
              choice.correctness = 'incorrect';
            }
          });
        });

        // Create model for see correct answer section
        function createNewCategoryModelWithChoices(category, correctChoices) {
          var newCategory = _.cloneDeep(category);
          newCategory.choices = _.map(correctChoices, function(correctChoiceId) {
            var choiceModel = _.find(scope.allChoices, byId(correctChoiceId));
            var choice = wrapChoiceModel(choiceModel);
            choice.correctness = 'correct';
            return choice;
          });
          return newCategory;
        }

        var categoriesPerRow = parseInt(scope.categoriesPerRow, 10);
        scope.correctAnswerRows = [[]];

        _.forEach(scope.categories, function(category) {
          var lastrow = scope.correctAnswerRows[scope.correctAnswerRows.length - 1];
          if (lastrow.length === categoriesPerRow) {
            scope.correctAnswerRows.push([]);
            lastrow = scope.correctAnswerRows[scope.correctAnswerRows.length - 1];
          }
          var correctChoices = response.correctResponse[category.model.id];
          lastrow.push(createNewCategoryModelWithChoices(category, correctChoices));
        });
      }

      function reset() {
        scope.choices = _.take(scope.allChoices, all);
        scope.response = undefined;
        scope.feedback = undefined;
        _.forEach(scope.categories, function(category) {
          category.choices = [];
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

        console.log('editedChoice', choiceId);
        scope.editedChoice = _.find(scope.choices, byId(choiceId));
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
    }

    function template() {
      return [
        '<div class="render-dnd-categorize">',
        choicesTemplate().replace("{flipp}", "shouldFlip"),
        categoriesTemplate().replace("{flipp}", "!shouldFlip").replace("{rowsModel}", "rows"),
        '  <hr/>',
        '  <span ng-if="isEditMode" class="choice-area-label">Enter choices below and drag to correct categories above. Choice tiles may be reused unless \"Remove Tile after Placing\" option is selected.</span>',
        choicesTemplate().replace("{flipp}", "!shouldFlip"),
        categoriesTemplate().replace("{flipp}", "shouldFlip").replace("{rowsModel}", "rows"),
        '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
        seeSolutionTemplate(),
        '</div>'
      ].join('');

      function choicesTemplate() {
        return [
          '<div class="container-choices" ng-if="{flipp}">',
          '  <div choice-dnd-categorize="true" ',
          '    ng-repeat="choice in choices track by choice.id" ',
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
        ].join('');
      }

      function categoriesTemplate() {
        return [
          '<div class="categories" ng-if="{flipp}">',
          '  <div class="row" ng-repeat="row in {rowsModel}">',
          '    <div category-dnd-categorize="true" ',
          '      ng-repeat="category in row"',
          '      label="category.model.label" ',
          '      drag-enabled="isDragEnabledFromCategory"',
          '      edit-mode="isEditMode" ',
          '      on-drop="onCategoryDrop(categoryId,choiceId)" ',
          '      on-delete-clicked="onCategoryDeleteClicked(categoryId)" ',
          '      on-delete-choice-clicked="onChoiceRemovedFromCategory(categoryId,choiceId)" ',
          '      on-choice-dragged-away="onChoiceRemovedFromCategory(fromCategoryId,choiceId)" ',
          '      category-id="{{category.model.id}}" ',
          '      choices="category.choices"',
          '      ng-style="categoryStyle"',
          '     ></div>',
          '   </div>',
          ' </div>'
        ].join('');
      }

      function seeSolutionTemplate() {
        return [
          '<div class="panel feedback correct-answer" ng-if="showSeeCorrectAnswer(response)">',
          '  <div class="panel-heading" ng-click="isSeeCorrectAnswerOpen=!isSeeCorrectAnswerOpen">',
          '    <span class="toggle" ng-class="{true:\'fa-eye-slash\', false:\'fa-eye\'}[isSeeCorrectAnswerOpen]"></span>',
          '    <span class="label" ng-if="isSeeCorrectAnswerOpen">Hide correct answer</span>',
          '    <span class="label" ng-if="!isSeeCorrectAnswerOpen">Show correct answer</span>',
          '  </div>',
          '  <div class="panel-body"  ng-show="isSeeCorrectAnswerOpen">',
          categoriesTemplate().replace("{flipp}", "true").replace("{rowsModel}", "correctAnswerRows"),
          '  </div>',
          '</div>'
        ].join("");
      }
    }
  }];

// ---------------------------------------------------------------------------------------------------------------------

var category = [function() {

  function link(scope, elem, attrs) {

    scope.onDeleteClicked = function() {
      scope.$$postDigest(function() {
        scope.notifyDeleteClicked({
          categoryId: attrs.categoryId
        });
      });
    };

    scope.onChoiceDeleteClicked = function(choiceId) {
      scope.notifyDeleteChoiceClicked({
        categoryId: attrs.categoryId,
        choiceId: choiceId
      });
    };

    scope.onDropCallback = function(e, draggable) {

      var choiceId = draggable.draggable.attr('choice-id');
      scope.isDraggedOver = false;
      scope.$$postDigest(function() {
        scope.onDrop({
          categoryId: attrs.categoryId,
          choiceId: choiceId
        });
      });
    };

    scope.onOverCallback = function(e, draggable) {

      var isChoiceId = draggable.draggable.attr('choice-id');

      if (isChoiceId !== "" && !isLocalChoiceDragged) {
        scope.$apply(function() {
          scope.isDraggedOver = true;
        });
      }
    };

    scope.onOutCallback = function() {
      scope.$apply(function() {
        scope.isDraggedOver = false;
      });
    };

    var isLocalChoiceDragged = false;

    scope.onLocalChoiceDragStart = function(choiceId) {
      isLocalChoiceDragged = true;
    };

    scope.onLocalChoiceDragEnd = function(choiceId, dropEffect) {

      isLocalChoiceDragged = false;

      scope.onChoiceDraggedAway({
        fromCategoryId: attrs.categoryId,
        choiceId: choiceId
      });
    };

    scope.choiceEditMode = scope.isEditMode ? 'delete' : '';
    scope.showTools = scope.isEditMode;

    scope.droppableOptions = {
      multiple: true,
      onDrop: 'onDropCallback',
      onOver: 'onOverCallback',
      onOut: 'onOutCallback'
    };
  }

  return {
    restrict: 'A',
    replace: true,
    scope: {
      label: '=',
      dragEnabled: '=',
      choices: '=choices',
      onDrop: '&onDrop',
      onChoiceDraggedAway: '&onChoiceDraggedAway',
      notifyDeleteClicked: '&onDeleteClicked',
      notifyDeleteChoiceClicked: '&onDeleteChoiceClicked',
      isEditMode: '=?editMode'
    },
    link: link,
    template: template()
  };

  function template() {
    return [
      '<div class="category"',
      '  ng-class="{draggedOver:isDraggedOver}" ',
      '  data-drop="true" ',
      '  jqyoui-droppable="droppableOptions"',
      '  >',
      '  <h4 ng-if="!isEditMode">{{label}}</h4>',
      '  <h4><input class="label-input" type="text" ng-if="isEditMode" ng-model="$parent.label"></h4>',
      editControlsDelete(),
      '  <div class="categorized choices">',
      '    <div class="choice-container" ng-class="{draggedOver:isDraggedOver}">',
      '      <div choice-dnd-categorize="true" ',
      '         model="choice.model"',
      '         edit-mode="choiceEditMode" ',
      '         correctness="{{choice.correctness}}" ',
      '         ng-repeat="choice in choices track by $index" ',
      '         drag-enabled="dragEnabled" ',
      '         choice-id="{{choice.model.id}}" ',
      '         on-drag-start-now="onLocalChoiceDragStart(choiceId)" ',
      '         on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
      '         on-drag-end="onLocalChoiceDragEnd(choiceId,dropEffect)"',
      '      ></div>',
      '   </div>',
      ' </div>',
      '</div>'
    ].join('');

    function deleteTool() {
      return [
        '<li class="delete-icon-button" ng-click="onDeleteClicked()" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
        '  <i class="fa fa-trash-o"></i>',
        '</li>'].join('');
    }

    function editControlsDelete() {
      return [
        '<ul class="edit-controls" ng-if="showTools">',
        deleteTool(),
        '</ul>'].join('');
    }
  }
}];

// ---------------------------------------------------------------------------------------------------------------------

var choice = ['$sce', 'MiniWiggiScopeExtension', function($sce, MiniWiggiScopeExtension) {

  function link(scope, elem, attrs) {

    new MiniWiggiScopeExtension().postLink(scope);

    scope.onStart = function() {
      scope.onDragStart({
        choiceId: attrs.choiceId
      });
    };

    scope.onStop = function() {
      scope.onDragEnd({
        choiceId: attrs.choiceId
      });
    };

    scope.onDeleteClicked = function() {
      scope.notifyDeleteClicked({
        choiceId: attrs.choiceId
      });
    };

    scope.canEdit = function() {
      return _.contains(scope.editMode, 'editable') || _.contains(scope.editMode, 'editing');
    };

    scope.isEditing = function() {
      return _.contains(scope.editMode, 'editing');
    };

    scope.canDelete = function() {
      return _.contains(scope.editMode, 'delete');
    };

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

    scope.onChoiceEditClicked = function() {
      scope.notifyEditClicked({
        choiceId: attrs.choiceId
      });
    };

    scope.$watch('correctness', updateClasses);

    scope.$watch('model.label', function() {
      $(window).trigger("resize");
    });

    updateClasses();

    scope.showTools = scope.canEdit(scope.editMode) || scope.canDelete(scope.editMode);

    scope.draggedParent = scope.canEdit(scope.editMode) ? ".modal" : "body";

    scope.isDragEnabled = function() {
      return scope.dragEnabled && !scope.isEditing();
    };

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
  }

  return {
    link: link,
    restrict: 'EA',
    replace: true,
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

  function template() {
    return [
      '<div class="choice-corespring-dnd-categorize" ',
      '  data-drag="isDragEnabled()"',
      '  ng-class="classes"',
      '  jqyoui-draggable="draggableOptions" ',
      '  data-jqyoui-options="draggableJqueryOptions">',
      '  <ul class="edit-controls" ng-if="showTools">',
      '    <li class="delete-icon-button"',
      '      ng-click="onDeleteClicked()"',
      '      tooltip="delete" ',
      '      tooltip-append-to-body="true" ',
      '      tooltip-placement="bottom">',
      '      <i class="fa"></i>',
      '    </li>',
      '    <li class="edit-icon-button" ng-click="onChoiceEditClicked()" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '      <i class="fa fa-pencil"></i>',
      '    </li>',
      '  </ul>',
      '  <div class="shell" ng-if="showTools" ng-show="isEditing()" >',
      choiceEditorTemplate(),
      '  </div>',
      '  <div class="shell" ng-bind-html-unsafe="model.label" ng-if="!isEditing()"></div>',
      '  <div class="delete-after-placing" ng-click="onDeleteAfterPlacingClicked()" ng-if="showTools">',
      '    <checkbox ng-model="model.moveOnDrag" class="control-label">Remove Tile after placing</checkbox>',
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
    name: "categoryDndCategorize",
    directive: category
  },
  {
    name: "choiceDndCategorize",
    directive: choice
  }
];

/**
 * @param initialConfig:
 *  container: jquery element of the container
 *  itemSelector: string selector of an item to be layed out
 *  cellWidth: the desired width of one column
 *  gutter: vertical and horizontal distance between elements,
 *  border: the border width of the item element as it is not measured by jquery
 *
 * This layout manager renders the layout every frame in the following order
 * 1. Selects all the items
 * 2. Sorts them by height
 * 3. Puts items in the most empty column until finished
 */
function CompactLayout(initialConfig, layoutRunner) {

  var hasNewConfig = false;
  var choiceSizeCache = [];
  var config = _.assign({
    gutter: 0,
    border: 0
  }, initialConfig);


  this.updateConfig = updateConfig;
  this.refresh = refresh;
  this.start = startRunner;
  this.cancel = cancelRunner;

  this.start();

  //-----------------------------------------

  function updateConfig(newConfig) {
    hasNewConfig = true;
    config = _.assign(config, newConfig);
  }

  function refresh() {
    var choiceElements = config.container.find(config.itemSelector);
    var reverseSortedChoices = _(_.sortBy(choiceElements, getElementHeight)).reverse().value();
    var reverseSortedChoicesHeights = _(reverseSortedChoices).map(getElementHeight).value();
    var someElementsHaveZeroHeight = _.some(reverseSortedChoicesHeights, function(height) {
      return height === 0;
    });

    if (!hasNewConfig && (someElementsHaveZeroHeight || _.isEqual(choiceSizeCache, reverseSortedChoicesHeights))) {
      return;
    }

    hasNewConfig = false;
    choiceSizeCache = reverseSortedChoicesHeights;

    var numColumns = Math.floor(config.container.width() / config.cellWidth);
    if (numColumns === 0) {
      return;
    }
    var columns = _.range(numColumns).map(function() {
      return [];
    });

    _.forEach(reverseSortedChoices, function(choice) {
      var sortedColumns = _.sortBy(columns, getColumnHeight);
      sortedColumns[0].push(choice);
    });

    columns.forEach(function(colChoices, colIndex) {
      colChoices.forEach(function(choice, choiceIndex) {
        $(choice).css({
          position: 'absolute',
          top: getChoiceTop(colChoices, choiceIndex),
          left: (config.cellWidth + config.gutter) * colIndex
        });
      }, this);
    }, this);

    //TODO Not sure why this is necessary
    config.container.css({
      height: getContainerHeight(columns)
    });
  }

  function getChoiceTop(choices, index) {
    return _.reduce(_.take(choices, index), function(acc, choice) {
      return $(choice).height() + acc;
    }, 0) + (config.gutter * index);
  }

  function getContainerHeight(columns) {
    var tallestColumn = _.last(_.sortBy(columns, getColumnHeight));

    // Simplistic border width calculation
    return getColumnHeight(tallestColumn) +
      ((columns.length - 1) * (config.gutter + (config.border || 0)));
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
        top: lastBottom + this.config.gutter
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

function LayoutRunner(timeout) {

  var nextRefreshHandle = null;
  var cancelled = false;
  var layout = null;

  this.runLater = runLater;
  this.cancel = cancel;
  this.start = start;
  this.run = run;

  //--------------------------------

  function runLater(block) {
    if (cancelled) {
      return;
    }
    if (window.requestAnimationFrame) {
      nextRefreshHandle = window.requestAnimationFrame(block);
    } else {
      nextRefreshHandle = timeout(block, 100);
    }
  }

  function cancel() {
    cancelled = true;
    if (nextRefreshHandle) {
      if (window.requestAnimationFrame) {
        window.cancelAnimationFrame(nextRefreshHandle);
      } else {
        timeout.cancel(nextRefreshHandle);
      }
    }
  }

  function start(targetLayout) {
    layout = targetLayout;
    cancelled = false;
    runLater(run);
  }

  function run() {
    runLater(run);
    layout.refresh();
  }
}

