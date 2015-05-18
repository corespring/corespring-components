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
        category: '=',
        choiceWidth: '@',
        dragAndDropScope: '@',
        dragEnabled: '=',
        isEditMode: '=?editMode',
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
      //log("categoryId ", attrs.category, " dragAndDropScope ", attrs.dragAndDropScope, " choiceWidth ", attrs.choiceWidth);

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

      scope.$watch('category', function(newValue, oldValue){
        log('$watch category', newValue, oldValue);
      }, true);
      attrs.$observe('choiceWidth', updateChoiceWidthInLayout);

      scope.$on('$destroy', onDestroy);
      scope.$on('activate', function(event, id){
        scope.active = id === getCategoryId();
      });


      //---------------------------------------------------------------

      function getCategoryId(){
        return scope.category.model.id;
      }

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
            categoryId: getCategoryId()
          });
        });
      }

      function onLabelEditClicked(event) {
        event.stopPropagation();
        scope.notifyEditClicked({
          categoryId: getCategoryId()
        });
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
        '    <div ng-click="onLabelEditClicked($event)" ng-if="isEditMode">',
        '      <div class="editor" ',
        '         active="active"',
        '         dialog-launcher="external" ',
        '         disable-auto-activation="true"  ',
        '         feature-overrides="overrideFeatures"',
        '         features="extraFeatures" ',
        '         image-service="imageService()" ',
        '         mini-wiggi-wiz="" ',
        '         ng-model="category.model.label" ',
        '         placeholder="Enter a label"',
        '      ></div>',
        '    </div>',
        '    <div class="html-wrapper" ng-bind-html-unsafe="category.model.label" ng-if="!isEditMode"></div>',
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
        '           ng-repeat="choice in category.choices track by $index" ',
        '           ng-style="{width:choiceWidth}"',
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