exports.framework = 'angular';
exports.directive = {
  name: "categoryLabelCorespringDndCategorize",
  directive: [
    '$injector',
    CategoryLabelCorespringDndCategorize]
};

/**
 * The labels for the category containers need to be independent
 * from the category containers bc. of the layout
 */
function CategoryLabelCorespringDndCategorize(
  $injector
) {

  return {
    restrict: 'A',
    replace: true,
    controller: ['$scope', controller],
    link: link,
    template: template(),
    scope: {
      category: '=',
      isEditMode: '=?editMode',
      notifyDeleteClicked: '&onDeleteClicked',
      notifyEditClicked: '&onEditClicked'
    }
  };


  function controller(scope) {
    try {
      //optional injection
      var MiniWiggiScopeExtension = $injector.get('MiniWiggiScopeExtension');
      scope.miniWiggiScopeExtension = new MiniWiggiScopeExtension();
      scope.miniWiggiScopeExtension.withExtraFeatureMath().postLink(scope);
    } catch (e) {
      //ignore
    }
  }

  function link(scope, elem, attrs) {

    var log = console.log.bind(console, '[category-label]');

    scope.active = false;
    scope.choiceEditMode = scope.isEditMode ? 'delete' : '';
    scope.showTools = scope.isEditMode;

    scope.onDeleteClicked = onDeleteClicked;
    scope.onLabelEditClicked = onLabelEditClicked;

    scope.$on('activate', function(event, id) {
      if (!scope.miniWiggiScopeExtension) {
        throw "Expected miniWiggiScopeExtension to be available";
      }
      scope.active = id === getCategoryId();
    });

    //---------------------------------------------------------------

    function getCategoryId() {
      return scope.category ? scope.category.model.id : '';
    }

    function onDeleteClicked() {
      scope.$$postDigest(function() {
        scope.notifyDeleteClicked({
          categoryId: getCategoryId()
        });
      });
    }

    function onLabelEditClicked($event) {
      if ($event) {
        $event.stopPropagation();
      }
      scope.notifyEditClicked({
        categoryId: getCategoryId()
      });
    }
  }

  function template() {
    return [
        '<div class="category category-label">',
        '  <div class="border" ng-if="!category.isPlaceHolder">',
        '    <div ng-click="onLabelEditClicked($event)" ng-if="isEditMode">',
        '      <div class="editor" ',
        '         active="active"',
        '         disable-auto-activation="true"  ',
        '         feature-overrides="overrideFeatures"',
        '         features="extraFeatures" ',
        '         mini-wiggi-wiz="" ',
        '         ng-model="category.model.label" ',
        '         placeholder="Enter a label or leave blank"',
        '      ></div>',
        '    </div>',
        '    <div class="html-wrapper" ng-bind-html-unsafe="category.model.label" ng-if="!isEditMode"></div>',
        '    <ul class="edit-controls" ng-if="showTools" ng-hide="active">',
        '      <li class="edit-icon-button"' +
        '          ng-click="onLabelEditClicked($event)"',
        '          tooltip="edit"',
        '          tooltip-append-to-body="true"',
        '          tooltip-placement="bottom">',
        '        <i class="fa fa-pencil"></i>',
        '      </li>',
        '      <li class="delete-icon-button" ',
        '          ng-click="onDeleteClicked()" ',
        '          tooltip="delete" ',
        '          tooltip-append-to-body="true" ',
        '          tooltip-placement="bottom">',
        '        <i class="fa fa-trash-o"></i>',
        '      </li>',
        '    </ul>',
        '  </div>',
        '</div>'
      ].join('');
  }

}