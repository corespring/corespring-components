var choice = [
  '$sce',
  'MiniWiggiScopeExtension',
  function($sce, MiniWiggiScopeExtension) {

    return {
      restrict: 'EA',
      replace: true,
      controller: ['$scope', controller],
      link: link,
      template: template(),
      scope: {
        choiceId:'@',
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

    function controller(scope){
      new MiniWiggiScopeExtension().postLink(scope);
    }

    function link(scope, elem, attrs) {
      var log = console.log.bind(console, '[choice]');
      //log("choiceId ", attrs.choiceId, " dragAndDropScope ", attrs.dragAndDropScope);

      scope.active = false;
      scope.showTools = !isCategorised() && (canEdit(scope.editMode) || canDelete(scope.editMode));
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

      scope.$on('activate', function(event, id){
        scope.active = id === attrs.choiceId;
      });

      updateClasses();

      //------------------------------------------------

      var revertValidAnimationMs = 0;
      var revertInvalidAnimationMs = 300;

      function draggableJqueryOptions() {
        return {
          appendTo: scope.draggedParent,
          delay: revertInvalidAnimationMs,
          revert: alwaysRevertButAnimateIfInvalid,
          scope: scope.dragAndDropScope
        };
      }

      function alwaysRevertButAnimateIfInvalid(dropTarget){
        var invalid = !choiceAcceptedBy(dropTarget);
        setRevertDuration(invalid ? revertInvalidAnimationMs : revertValidAnimationMs);
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

      function isCategorised(){
        return $(elem).parents('.categorized').length > 0;
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
        return scope.dragEnabled && !scope.active;
      }

      function onChoiceEditClicked(event) {
        event.stopPropagation();
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
      '    <ul class="edit-controls" ng-if="showTools" ng-hide="active">',
      '      <li class="delete-icon-button"',
      '        ng-click="onDeleteClicked()"',
      '        tooltip="delete" ',
      '        tooltip-append-to-body="true" ',
      '        tooltip-placement="bottom">',
      '        <i class="fa fa-trash-o"></i>',
      '      </li>',
      '      <li class="edit-icon-button" ',
      '         ng-click="onChoiceEditClicked($event)" ',
      '         tooltip="edit" ',
      '         tooltip-append-to-body="true" ',
      '         tooltip-placement="bottom">',
      '        <i class="fa fa-pencil"></i>',
      '      </li>',
      '    </ul>',
      '    <div class="shell" ng-show="active"  >',
      choiceEditorTemplate(),
      '    </div>',
      '    <div class="shell" ng-hide="active">',
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
        '   active="active"',
        '   dialog-launcher="external" ',
        '   feature-overrides="overrideFeatures"',
        '   features="extraFeatures" ',
        '   image-service="imageService()" ',
        '   micro-wiggi-wiz="" ',
        '   ng-model="model.label" ',
        '   placeholder="Enter a choice"',
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