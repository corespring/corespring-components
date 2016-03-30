exports.framework = 'angular';
exports.directive = {
  name: "choiceCorespringDndCategorize",
  directive: [
    '$injector',
    '$sce',
    '$timeout',
    'Msgr',
    ChoiceCorespringDndCategorize]
};

/**
 * A draggable choice
 */
function ChoiceCorespringDndCategorize($injector, $sce, $timeout, Msgr) {

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
      model: '=',
      notifyDeleteClicked: '&onDeleteClicked',
      notifyEditClicked: '&onEditClicked',
      notifyMoveOnDragClicked: '&onMoveOnDragClicked',
      onDragEnd: '&onDragEnd',
      onDragStart: '&onDragStartNow'
    }
  };

  function controller(scope) {
    try {
      //optional injection, mini wiggi is only needed/available in config panel
      var MiniWiggiScopeExtension = $injector.get('MiniWiggiScopeExtension');
      scope.miniWiggiScopeExtension = new MiniWiggiScopeExtension();
      scope.miniWiggiScopeExtension.withExtraFeatureMath().postLink(scope);
    } catch (e) {
      //ignore
    }
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
      onDrag: 'onDrag',
      onStart: 'onStart',
      onStop: 'onStop',
      placeholder: true,
      delay: 200,
      distance: 10
    };

    scope.draggableJqueryOptions = {
      appendTo: scope.draggedParent,
      delay: 300,
      revert: shouldChoiceRevert
    };

    scope.canDelete = canDelete;
    scope.canEdit = canEdit;
    scope.isDragEnabled = isDragEnabled;
    scope.onChangeActive = onChangeActive;
    scope.onChangeMoveOnDrag = onChangeMoveOnDrag;
    scope.onChoiceEditClicked = onChoiceEditClicked;
    scope.showPlaceholder = showPlaceholder;
    scope.onDeleteClicked = onDeleteClicked;
    scope.onDrag = onDrag;
    scope.onStart = onStart;
    scope.onStop = onStop;

    scope.$watch('correctness', updateClasses);
    scope.$watch('dragAndDropScope', updateDragAndDropScope);
    scope.$watch('model.label', triggerResize);

    scope.$on('activate', onChangeActive);
    scope.$on('placed', onPlaced);
    scope.$on('unplaced', onUnplaced);


    updateClasses();

    //------------------------------------------------

    function onChangeActive(event, id) {
      if (!scope.miniWiggiScopeExtension) {
        throw "Expected miniWiggiScopeExtension to be available";
      }
      scope.active = id === attrs.choiceId;
      updateClasses();
    }

    function onPlaced(event, id){
      if(id === attrs.choiceId && !isCategorized()) {
        scope.placed = true;
        updateClasses();
      }
    }

    function onUnplaced(event, id){
      if(id === attrs.choiceId) {
        scope.placed = false;
        updateClasses();
      }
    }

    function onChangeMoveOnDrag(){
      scope.notifyMoveOnDragClicked({choice: scope.model});
    }

    function shouldChoiceRevert(dropTarget) {
      if (choiceDroppedOnCategory(dropTarget)) {
        if (scope.model.moveOnDrag) {
          return false;
        } else {
          setRevertDuration(0);
          return true;
        }
      } else if (choiceHasBeenDraggedFromCategory()) {
        setRevertDuration(0);
        return true;
      } else {
        setRevertDuration(300);
        return true;
      }

      function choiceDroppedOnCategory(dropTarget) {
        //log('choiceDroppedOnCategory', dropTarget.has('.' + attrs.choiceId));
        return dropTarget && dropTarget.is('.category');
      }

      function choiceHasBeenDraggedFromCategory() {
        return isCategorized();
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
      try {
        $(elem).draggable('option', name, value);
      } catch (err) {
        console.error("setDraggableOption", err, elem, attrs.id);
      }
    }


    function onDrag(event, ui){
      Msgr.send("autoScroll", {x: event.clientX, y: event.clientY});
    }

    function onStart(event, ui) {
      log('onStart', scope.dragAndDropScope, attrs.choiceId, elem);
      scope.isDragging = true;
      scope.onDragStart({
        choiceId: attrs.choiceId
      });

    }

    function onStop(event, ui) {
      log('onStop', event);
      scope.onDragEnd({
        choiceId: attrs.choiceId
      });
      //small timeout to avoid activating
      //the wiggi when dragging a choice into
      //a category inside the config panel
      $timeout(function() {
        scope.isDragging = false;
      }, 200);
    }

    function onChoiceEditClicked(event) {
      event.stopPropagation();
      if (!scope.canEdit() || scope.isDragging) {
        return;
      }
      scope.notifyEditClicked({
        choiceId: attrs.choiceId
      });
    }

    function showPlaceholder(label) {
      return _.isEmpty(label) && scope.editMode;
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
      if (scope.active) {
        classes.push('active');
      }
      if(scope.placed){
        classes.push('placed');
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
      '  data-jqyoui-options="draggableJqueryOptions"',
      '  >',
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
      '    <div class="shell" ng-if="canEdit()" cs-absolute-visible="active" ng-click="$event.stopPropagation()">',
      choiceEditorTemplate(),
      '    </div>',
      '    <div class="shell" cs-absolute-visible="!active" ng-click="onChoiceEditClicked($event)">',
      '      <div ng-if="showPlaceholder(model.label)" class="placeholder">Enter a choice</div>',
      '      <div class="html-wrapper" ng-bind-html-unsafe="model.label"></div>',
      '      <div class="remove-choice" ng-hide="dragEnabled"><i ng-click="onDeleteClicked()" class="fa fa-close"></i></div>',
      '    </div>',
      '    <div class="correctness-display">',
      '      <div class="background fa"></div>',
      '      <div class="foreground fa"></div>',
      '    </div>',
      '  </div>',
      '  <div class="delete-after-placing" ng-click="onDeleteAfterPlacingClicked()" ng-if="showTools">',
      '    <checkbox ng-model="model.moveOnDrag" ng-change="onChangeMoveOnDrag()" class="control-label">Remove after placing</checkbox>',
      '  </div>',
      '</div>'
    ].join('');

    function choiceEditorTemplate() {
      return [
        '<div class="editor" ',
        '   active="active"',
        '   disable-auto-activation="true"',
        '   feature-overrides="overrideFeatures"',
        '   features="extraFeatures" ',
        '   mini-wiggi-wiz="" ',
        '   ng-model="model.label" ',
        '></div>'
      ].join('');
    }
  }
}