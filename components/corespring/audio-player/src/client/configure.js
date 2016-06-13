exports.framework = 'angular';
exports.directives = [
  {
    directive: [ConfigAudioPlayerDirective]
  }
];

function ConfigAudioPlayerDirective() {

  return {
    link: link,
    replace: true,
    restrict: 'AE',
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    scope.add = add;
    scope.remove = remove;

    scope.containerBridge = {
      getModel: getModel,
      setModel: setModel
    };

    scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

    //--------------------------------------------
    // only functions below
    //--------------------------------------------

    function getModel(){
      return _.cloneDeep(scope.fullModel);
    }

    function setModel(fullModel) {
      scope.fullModel = fullModel;
    }


    function add(){
      alert("not implemented");
    }

    function remove(src){
      _.remove(scope.fullModel.model.config.sources, src);
    }

  }

  function template() {
    return [
      '<div class="config-audio-player">',
      '  <p>Add/remove the urls of your sound files below</p>',
      '  <ul>',
      '    <li ng-repeat="src in fullModel.model.config.sources"><a ng-click="remove(src)">(-)</a> &nbsp; {{src.url}}</li>',
      '    <a ng-click="add()">Add sound url</a>',
      '  </ul>',
      '  <p>Show/Hide default controls</p>',
      '  <checkbox ng-model="fullModel.model.config.showControls" class="control-label">{{fullModel.model.config.showControls ? "Hide" : "Show"}} Controls</checkbox>',
      '</div>',
    ].join('');
  }

}