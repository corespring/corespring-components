exports.framework = 'angular';
exports.directive = {
  name: "categoryChoicesCorespringDndCategorize",
  directive: [
    '$timeout',
    'CompactLayout',
    'LayoutConfig',
    'LayoutRunner',
    CategoryChoicesCorespringDndCategorize]
};

/**
 * The Category containers which hold the dropped choices
 */
function CategoryChoicesCorespringDndCategorize(
  $timeout,
  CompactLayout,
  LayoutConfig,
  LayoutRunner
) {

  return {
    restrict: 'A',
    replace: true,
    link: link,
    template: template(),
    scope: {
      category: '=',
      choiceWidth: '@',
      dragAndDropScope: '=',
      dragEnabled: '=',
      isEditMode: '=?editMode',
      notifyDeleteChoiceClicked: '&onDeleteChoiceClicked',
      onChoiceDraggedAway: '&',
      onDrop: '&'
    }
  };

  function link(scope, elem, attrs) {

    var layout;

    scope.active = false;
    scope.choiceEditMode = scope.isEditMode ? 'delete' : '';
    scope.showTools = scope.isEditMode;

    scope.droppableOptions = {
      multiple: true,
      onDrop: 'onDropCallback'
    };

    scope.droppableJqueryOptions = {
      activeClass: 'category-active',
      distance: 5,
      hoverClass: 'category-hover',
      tolerance: 'pointer',
      scope: scope.dragAndDropScope
    };

    scope.onChoiceDeleteClicked = onChoiceDeleteClicked;
    scope.onDropCallback = onDropCallback;
    scope.onLocalChoiceDragStart = onLocalChoiceDragStart;
    scope.onLocalChoiceDragEnd = onLocalChoiceDragEnd;

    attrs.$observe('choiceWidth', updateChoiceWidthInLayout);
    scope.$watch('category', updateChoiceWidthInLayout, true);

    scope.$on('$destroy', onDestroy);

    //---------------------------------------------------------------

    function getCategoryId() {
      return scope.category.model.id;
    }

    function onChoiceDeleteClicked(choiceId, index) {
      scope.notifyDeleteChoiceClicked({
        categoryId: getCategoryId(),
        choiceId: choiceId,
        index: index
      });
    }

    function onDropCallback(e, draggable) {
      var choiceId = draggable.draggable.attr('choice-id');
      scope.$$postDigest(function() {
        scope.onDrop({
          categoryId: getCategoryId(),
          choiceId: choiceId
        });
      });
    }

    function onLocalChoiceDragStart(choiceId, index) {
      //nothing to do here
    }

    function onLocalChoiceDragEnd(choiceId, index) {
      scope.onChoiceDraggedAway({
        fromCategoryId: getCategoryId(),
        choiceId: choiceId,
        index: index
      });
    }

    function updateChoiceWidthInLayout() {
      initLayout(scope.choiceWidth);
    }

    function initLayout(choiceWidth) {
      choiceWidth = parseFloat(choiceWidth);
      if (isNaN(choiceWidth) || choiceWidth <= 0) {
        return;
      }
      var container = elem.find(".choice-container");
      if(container.length === 0){
        return;
      }

      if (!layout) {
        layout = new CompactLayout(
          new LayoutConfig()
          .withContainer(elem.find(".choice-container"))
          .withItemSelector(".choice-corespring-dnd-categorize")
          .withNumColumns(numColumns)
          .withCellWidth(function(){
            return choiceWidth;
          })
          .value(),
          new LayoutRunner($timeout),
          "Category " + getCategoryId());
      } else {
        layout.updateConfig(new LayoutConfig()
          .withNumColumns(numColumns)
          .withCellWidth(function(){
            return choiceWidth;
          })
          .value());
      }

      function numColumns() {
        //using a function allows the layout to wait until choice-container has a width
        return Math.floor(elem.find(".choice-container").width() / choiceWidth);
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
        '<div class="category category-choices"',
        '  data-drop="true" ',
        '  jqyoui-droppable="droppableOptions"',
        '  data-jqyoui-options="droppableJqueryOptions"',
        '  >',
        '  <div class="border" ng-if="!category.isPlaceHolder">',
        '    <div class="categorized choices">',
        '      <div class="placeholder" ng-if="choiceEditMode" ng-hide="category.choices.length">Drag correct answer(s) here.</div>',
        '      <div class="choice-container">',
        '        <div choice-corespring-dnd-categorize="true" ',
        '           choice-id="{{choice.model.id}}" ',
        '           correctness="{{choice.correctness}}" ',
        '           drag-and-drop-scope="dragAndDropScope"',
        '           drag-enabled="dragEnabled" ',
        '           edit-mode="choiceEditMode" ',
        '           model="choice.model"',
        '           ng-repeat="choice in category.choices track by $index" ',
        '           on-delete-clicked="onChoiceDeleteClicked(choiceId, $index)" ',
        '           on-drag-end="onLocalChoiceDragEnd(choiceId, $index)"',
        '           on-drag-start-now="onLocalChoiceDragStart(choiceId, $index)" ',
        '        ></div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
  }

}