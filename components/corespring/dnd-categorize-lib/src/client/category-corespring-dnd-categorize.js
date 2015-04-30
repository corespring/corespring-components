var category = [
  '$timeout',
  'LayoutConfig',
  'LayoutRunner',
  'CompactLayout',
  function($timeout, LayoutConfig, LayoutRunner, CompactLayout) {

    return {
      restrict: 'A',
      replace: true,
      link: link,
      template: template(),
      scope: {
        choices: '=',
        choiceWidth: '@',
        dragAndDropScope: '=',
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

      var log = console.log.bind(console, '[category]');
      log("dragAndDropScope", scope.dragAndDropScope);

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

      scope.droppableJqueryOptions = {
        activeClass: 'category-active',
        distance: 5,
        hoverClass: 'category-hover',
        tolerance: 'pointer',
        scope: scope.dragAndDropScope
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
        '  data-jqyoui-options="droppableJqueryOptions"',
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
        '           drag-and-drop-scope="dragAndDropScope"',
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
    }

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

  }];


exports.framework = 'angular';
exports.directive = {
  name: "categoryCorespringDndCategorize",
  directive: category
};