var main = [

  function() {
    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function($scope, $element, $attrs) {
        $scope.containerBridge = {
          setModel: function(model) {
            console.log(model);
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          }
        };

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
      },
      template: [
        '<div class="select-text-configuration">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        '      <div class="input-holder">',
        '        <div class="body">',
        '          <p class="info">',
        '            In select text...',
        '          </p>',
        '          <input class="prompt" type="text" ng-model="model.prompt"/>',
        '          <wiggi-wiz ng-model="model.text"></wiggi-wiz>',
        '          <div class="property">',
        '            <label>Selection Unit</label>',
        '            <select class="form-control" ng-model="model.config.selectionUnit">',
        '              <option value="word">Word</option>',
        '              <option value="sentence">Sentence</option>',
        '            </select>',
        '          </div>',
        '          <div class="property">',
        '            <label>Minimum Selections</label>',
        '            <input type="number" min="1" max="99" class="form-control" ',
        '              ng-model="model.config.minSelections"/>',
        '          </div>',
        '          <div class="property">',
        '            <label>Maximum Selections</label>',
        '            <input type="number" min="1" max="99" class="form-control" ',
        '              ng-model="model.config.maxSelections"/>',
        '          </div>',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
