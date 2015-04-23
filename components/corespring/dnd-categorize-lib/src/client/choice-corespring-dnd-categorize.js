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
exports.directive = {
  name: "choiceCorespringDndCategorize",
  directive: choice
};