var category = [
  '$timeout',
  'CompactLayout',
  'LayoutConfig',
  'LayoutRunner',
  'MiniWiggiScopeExtension',
  function(
    $timeout,
    CompactLayout,
    LayoutConfig,
    LayoutRunner,
    MiniWiggiScopeExtension
  ) {

    return {
      restrict: 'A',
      replace: true,
      controller: ['$scope', controller],
      link: link,
      template: template(),
      scope: {
        categoryId: '@',
        choices: '=',
        choiceWidth: '@',
        dragAndDropScope: '@',
        dragEnabled: '=',
        isEditMode: '=?editMode',
        label: '=',
        notifyDeleteChoiceClicked: '&onDeleteChoiceClicked',
        notifyDeleteClicked: '&onDeleteClicked',
        notifyEditClicked: '&onEditClicked',
        onChoiceDraggedAway: '&',
        onDrop: '&'
      }
    };


    function controller($scope){
      new MiniWiggiScopeExtension().postLink($scope);
    }

    function link(scope, elem, attrs) {

      var log = console.log.bind(console, '[category]');
      //log("categoryId ", attrs.categoryId, " dragAndDropScope ", attrs.dragAndDropScope, " choiceWidth ", attrs.choiceWidth);

      new MiniWiggiScopeExtension().postLink(scope);

      var layout;
      var isLocalChoiceDragged = false;

      scope.active = false;
      scope.choiceEditMode = scope.isEditMode ? 'delete' : '';
      scope.showTools = scope.isEditMode;

      scope.droppableOptions = {
        multiple: true,
        onDrop: 'onDropCallback'
      };

      scope.droppableJqueryOptions = droppableJqueryOptions;
      scope.onDeleteClicked = onDeleteClicked;
      scope.onChoiceDeleteClicked = onChoiceDeleteClicked;
      scope.onDropCallback = onDropCallback;
      scope.onLabelEditClicked = onLabelEditClicked;
      scope.onLocalChoiceDragStart = onLocalChoiceDragStart;
      scope.onLocalChoiceDragEnd = onLocalChoiceDragEnd;

      scope.$on('$destroy', onDestroy);
      attrs.$observe('choiceWidth', updateChoiceWidthInLayout);

      scope.$on('activate', function(event, id){
        scope.active = id === attrs.categoryId;
      });


      //---------------------------------------------------------------

      function droppableJqueryOptions() {
        return {
          activeClass: 'category-active',
          distance: 5,
          hoverClass: 'category-hover',
          tolerance: 'pointer',
          scope: scope.dragAndDropScope
        };
      }

      function onDeleteClicked() {
        scope.$$postDigest(function() {
          scope.notifyDeleteClicked({
            categoryId: attrs.categoryId
          });
        });
      }

      function onLabelEditClicked(event) {
        event.stopPropagation();
        scope.notifyEditClicked({
          categoryId: attrs.categoryId
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
        scope.$$postDigest(function() {
          scope.onDrop({
            categoryId: attrs.categoryId,
            choiceId: choiceId
          });
        });
      }

      function onLocalChoiceDragStart(choiceId) {
        //nothing to do here
      }

      function onLocalChoiceDragEnd(choiceId) {
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
        /*
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
        */
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
        '  data-drop="true" ',
        '  jqyoui-droppable="droppableOptions"',
        '  data-jqyoui-options="droppableJqueryOptions()"',
        '  >',
        '  <div class="border">',
        '    <div ng-click="onLabelEditClicked($event)">',
        '      <div class="editor" ',
        '         active="active"',
        '         dialog-launcher="external" ',
        '         feature-overrides="overrideFeatures"',
        '         features="extraFeatures" ',
        '         image-service="imageService()" ',
        '         micro-wiggi-wiz="" ',
        '         ng-model="label" ',
        '         placeholder="Enter a label"',
        '      ></div>',
        '    </div>',
        '    <div class="html-wrapper" ng-bind-html-unsafe="$parent.label"></div>',
        '    <ul class="edit-controls" ng-if="showTools">',
               deleteTool(),
        '    </ul>',
        '    <div class="categorized choices">',
        '      <div class="choice-container">',
        '        <div choice-corespring-dnd-categorize="true" ',
        '           choice-id="{{choice.model.id}}" ',
        '           correctness="{{choice.correctness}}" ',
        '           drag-and-drop-scope="{{dragAndDropScope}}"',
        '           drag-enabled="dragEnabled" ',
        '           edit-mode="choiceEditMode" ',
        '           model="choice.model"',
        '           ng-repeat="choice in choices track by $index" ',
        '           ng-style="{width:choiceWidth}"',
        '           on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
        '           on-drag-end="onLocalChoiceDragEnd(choiceId)"',
        '           on-drag-start-now="onLocalChoiceDragStart(choiceId)" ',
        '        ></div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    }

    function deleteTool() {
      return [
        '<li class="delete-icon-button" ',
        '    ng-click="onDeleteClicked()" ' +
        '    tooltip="delete" ',
        '    tooltip-append-to-body="true" ',
        '    tooltip-placement="bottom">',
        '  <i class="fa fa-trash-o"></i>',
        '</li>'].join('');
    }

  }];


exports.framework = 'angular';
exports.directive = {
  name: "categoryCorespringDndCategorize",
  directive: category
};