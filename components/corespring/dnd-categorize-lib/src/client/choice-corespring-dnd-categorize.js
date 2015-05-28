exports.framework = 'angular';
exports.directive = {
  name: "choiceCorespringDndCategorize",
  directive: [
    '$sce',
    '$timeout',
    'MiniWiggiScopeExtension',
    ChoiceCorespringDndCategorize]
};

function ChoiceCorespringDndCategorize($sce, $timeout, MiniWiggiScopeExtension) {

  return {
    restrict: 'EA',
    replace: true,
    controller: ['$scope', controller],
    link: link,
    template: template(),
    scope: {
      choiceId: '@',
      correctness: '@',
      deleteAfterPlacing: '=?deleteAfterPlacing',
      dragAndDropScope: '=',
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

  function controller(scope) {
    new MiniWiggiScopeExtension().withExtraFeatureMath().postLink(scope);
  }

  function link(scope, elem, attrs) {
    var log = console.log.bind(console, '[choice]');
    //log("choiceId ", attrs.choiceId, " dragAndDropScope ", attrs.dragAndDropScope);

    scope.isDragging = false;
    scope.active = false;
    scope.showTools = !isCategorized() && (canEdit() || canDelete());
    scope.draggedParent = canEdit(scope.editMode) ? ".modal" : "body";

    scope.draggableOptions = {
      animate: true,
      onStart: 'onStart',
      onStop: 'onStop',
      placeholder: true,
      delay: 200,
      distance: 10
    };

    scope.draggableJqueryOptions = {
      appendTo: scope.draggedParent,
      delay: revertInvalidAnimationMs,
      revert: alwaysRevertButAnimateIfInvalid
    };

    scope.canDelete = canDelete;
    scope.canEdit = canEdit;
    scope.isDragEnabled = isDragEnabled;
    scope.onChoiceEditClicked = onChoiceEditClicked;
    scope.onDeleteClicked = onDeleteClicked;
    scope.onStart = onStart;
    scope.onStop = onStop;

    scope.$watch('correctness', updateClasses);
    scope.$watch('dragAndDropScope', updateDragAndDropScope);
    scope.$watch('model.label', triggerResize);

    scope.$on('activate', function(event, id) {
      scope.active = id === attrs.choiceId;
    });

    updateClasses();

    //------------------------------------------------

    var revertValidAnimationMs = 0;
    var revertInvalidAnimationMs = 300;

    function alwaysRevertButAnimateIfInvalid(dropTarget) {
      var invalid = !choiceAcceptedBy(dropTarget);
      setRevertDuration(invalid ? revertInvalidAnimationMs : revertValidAnimationMs);
      return true;

      function choiceAcceptedBy(dropTarget) {
        //log('choiceAcceptedBy', dropTarget.has('.' + attrs.choiceId));
        return dropTarget && dropTarget.is('.category');
      }
    }

    function updateDragAndDropScope(newValue) {
      if (newValue) {
        setDraggableOption('scope', newValue);
      }
    }

    function setRevertDuration(revertDuration) {
      setDraggableOption('revertDuration', revertDuration);
    }

    function setDraggableOption(name, value) {
      if (_.isFunction($(elem).draggable)) {
        $(elem).draggable('option', name, value);
      }
    }

    function onStart(event, ui) {
      log('onStart', scope.dragAndDropScope);
      scope.isDragging = true;
      scope.onDragStart({
        choiceId: attrs.choiceId
      });
    }

    function onStop(event, ui) {
      log('onStop', event);
      scope.isDragging = false;
      scope.onDragEnd({
        choiceId: attrs.choiceId
      });
    }

    function onChoiceEditClicked(event) {
      log('onChoiceEditClicked isDragging:', scope.isDragging);
      if (!scope.isDragging) {
        event.stopPropagation();
        scope.notifyEditClicked({
          choiceId: attrs.choiceId
        });
      }
    }

    function onDeleteClicked() {
      scope.notifyDeleteClicked({
        choiceId: attrs.choiceId
      });
    }

    function isCategorized() {
      return $(elem).parents('.categorized').length > 0;
    }

    function canEdit() {
      return _.contains(scope.editMode, 'editable') || _.contains(scope.editMode, 'editing');
    }

    function canDelete() {
      return _.contains(scope.editMode, 'delete');
    }

    function isDragEnabled() {
      return scope.dragEnabled && !scope.active;
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
      if (scope.canDelete()) {
        classes.push('delete');
      }
      if (scope.isDragEnabled()) {
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
      '  data-jqyoui-options="draggableJqueryOptions">',
      '  <div class="border">',
      '    <ul class="edit-controls" ng-if="showTools" ng-hide="active">',
      '      <li class="edit-icon-button" ',
      '         ng-click="onChoiceEditClicked($event)" ',
      '         tooltip="edit" ',
      '         tooltip-append-to-body="true" ',
      '         tooltip-placement="bottom">',
      '        <i class="fa fa-pencil"></i>',
      '      </li>',
      '      <li class="delete-icon-button"',
      '        ng-click="onDeleteClicked()"',
      '        tooltip="delete" ',
      '        tooltip-append-to-body="true" ',
      '        tooltip-placement="bottom">',
      '        <i class="fa fa-trash-o"></i>',
      '      </li>',
      '    </ul>',
      '    <div class="shell" ng-if="canEdit()" ng-click="onChoiceEditClicked($event)">',
      choiceEditorTemplate(),
      '    </div>',
      '    <div class="shell" ng-if="!canEdit()">',
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
        '   disable-auto-activation="true"',
        '   feature-overrides="overrideFeatures"',
        '   features="extraFeatures" ',
        '   image-service="imageService()" ',
        '   mini-wiggi-wiz="" ',
        '   ng-model="model.label" ',
        '   placeholder="Enter choice here"',
        '></div>'
      ].join('');
    }
  }
}