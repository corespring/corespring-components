var choice = [
  '$sce',
  'MiniWiggiScopeExtension',
  function($sce, MiniWiggiScopeExtension) {

    return {
      restrict: 'EA',
      replace: true,
      link: link,
      template: template(),
      scope: {
        correctness: '@',
        deleteAfterPlacing: '=?deleteAfterPlacing',
        dragAndDropScope: '@',
        dragEnabled: '=',
        editMode: '=?editMode',
        imageService: "=?",
        model: '=',
        notifyDeleteClicked: '&onDeleteClicked',
        notifyEditClicked: '&onEditClicked',
        onDragEnd: '&onDragEnd',
        onDragStart: '&onDragStartNow'
      }
    };

    function link(scope, elem, attrs) {
      var log = console.log.bind(console, '[choice]');
      log("dragAndDropScope", scope.dragAndDropScope);

      new MiniWiggiScopeExtension().postLink(scope);

      scope.showTools = canEdit(scope.editMode) || canDelete(scope.editMode);
      scope.draggedParent = canEdit(scope.editMode) ? ".modal" : "body";

      scope.draggableOptions = {
        animate: true,
        onStart: 'onStart',
        onStop: 'onStop',
        placeholder: true
      };

      scope.canDelete = canDelete;
      scope.canEdit = canEdit;
      scope.draggableJqueryOptions = draggableJqueryOptions;
      scope.isDragEnabled = isDragEnabled;
      scope.isEditing = isEditing;
      scope.onChoiceEditClicked = onChoiceEditClicked;
      scope.onDeleteClicked = onDeleteClicked;
      scope.onStart = onStart;
      scope.onStop = onStop;

      scope.$watch('correctness', updateClasses);
      scope.$watch('model.label', triggerResize);

      updateClasses();

      //------------------------------------------------

      function draggableJqueryOptions() {
        return {
          revert: alwaysRevertButAnimateIfInvalid,
          appendTo: scope.draggedParent,
          scope: scope.dragAndDropScope
        };
      }

      function alwaysRevertButAnimateIfInvalid(dropTarget){
        setRevertDuration(!choiceAcceptedBy(dropTarget) ? 300 : 0);
        return true;

        function choiceAcceptedBy(dropTarget){
          //log('choiceAcceptedBy', dropTarget.has('.' + attrs.choiceId));
          return dropTarget && dropTarget.is('.category');
        }
      }

      function setRevertDuration(revertDuration){
        $(elem).draggable('option', 'revertDuration', revertDuration);
      }

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
        if(scope.isDragEnabled()){
          classes.push('draggable');
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
      '  data-jqyoui-options="draggableJqueryOptions()">',
      '  <div class="border">',
      '    <ul class="edit-controls" ng-if="showTools">',
      '      <li class="delete-icon-button"',
      '        ng-click="onDeleteClicked()"',
      '        tooltip="delete" ',
      '        tooltip-append-to-body="true" ',
      '        tooltip-placement="bottom">',
      '        <i class="fa fa-trash-o"></i>',
      '      </li>',
      '      <li class="edit-icon-button" ',
      '         ng-click="onChoiceEditClicked()" ',
      '         tooltip="edit" ',
      '         tooltip-append-to-body="true" ',
      '         tooltip-placement="bottom">',
      '        <i class="fa fa-pencil"></i>',
      '      </li>',
      '    </ul>',
      '    <div class="shell" ng-if="showTools" ng-show="isEditing()" >',
      choiceEditorTemplate(),
      '    </div>',
      '    <div class="shell" ng-if="!isEditing()">',
      '      <div class="html-wrapper" ng-bind-html-unsafe="model.label"></div>',
      '      <div class="remove-choice"><i ng-click="onDeleteClicked()" class="fa fa-close"></i></div>',
      '    </div>',
      '  </div>',
      '  <div class="delete-after-placing" ng-click="onDeleteAfterPlacingClicked()" ng-if="showTools">',
      '    <checkbox ng-model="model.moveOnDrag" class="control-label">Remove after placing</checkbox>',
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
exports.directive = {
  name: "choiceCorespringDndCategorize",
  directive: choice
};