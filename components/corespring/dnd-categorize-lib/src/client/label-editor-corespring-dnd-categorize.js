exports.framework = 'angular';
exports.directive = {
  name: "labelEditorCorespringDndCategorize",
  directive: [
    '$injector',
    LabelEditorCorespringDndCategorize
  ]
};

function LabelEditorCorespringDndCategorize(
  $injector
) {

  return {
    controller: ['$scope', controller],
    link: link,
    replace: true,
    restrict: 'A',
    template: template(),
    scope: {
      activeId: '@',
      editable: '=',
      model: '=', //expects {label:"some text"} when editing
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
    scope.onLabelEditClicked = onLabelEditClicked;

    scope.$on('activate', function(event, id) {
      if(!scope.miniWiggiScopeExtension){
        throw "Expected miniWiggiScopeExtension to be available";
      }
      scope.active = id === scope.activeId;
    });

    //---------------------------------------------------------------

    function onLabelEditClicked(event) {
      event.stopPropagation();
      scope.notifyEditClicked({
        activeId: scope.activeId
      });
    }
  }

  function template() {
    return [
        '<div>',
        '  <div ng-click="onLabelEditClicked($event)" ng-if="editable">',
        '    <div class="editor" ',
        '       active="active"',
        '       dialog-launcher="external" ',
        '       disable-auto-activation="true"  ',
        '       feature-overrides="overrideFeatures"',
        '       features="extraFeatures" ',
        '       image-service="imageService()" ',
        '       mini-wiggi-wiz="" ',
        '       ng-model="model.label" ',
        '       placeholder="Enter a label (optional)"',
        '    ></div>',
        '  </div>',
        '  <div class="html-wrapper" ng-bind-html-unsafe="model" ng-if="!editable"></div>',
        '</div>'
      ].join('');
  }

}