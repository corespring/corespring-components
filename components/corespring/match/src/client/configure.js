var main = [
  '$log',
  '$timeout',
  '$http',
  'ChoiceTemplates',
  function(
    $log,
    $timeout,
    $http,
    ChoiceTemplates
    ) {

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

      ChoiceTemplates.extendScope(scope, 'corespring-match');

      scope.model = {
        config: {
          shuffle: false,
          inputType: 'Radio',
          layout: '3 Columns'
        }
      };

      scope.containerBridge = {
        setModel: setModel,
        getModel: getModel
      };

      var matchModel = {};

      function setModel(model) {
        matchModel = model;
      }

      function getModel() {
        return matchModel;
      }
    }

    function template() {

      function designTemplate() {
        return [
          '<div class="form-horizontal" role="form">',
          '  <div class="container-fluid">',
          '    <div class="row">',
          '      <div class="col-xs-9">',
          header(),
          mainEditorPanel(),
          '      </div>',
          '      <div class="col-xs-3">',
          optionsPanel(),
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('');
      }

      function header() {
        return [
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <p>In a match interaction, students associate choices in the ',
          '       first column with options in the first row. This ',
          '       interaction allows for either one or more correct answers. ',
          '       Setting more than one answer as correct ',
          '       allows for partial credit (see the scoring tab).',
          '    </p>',
          '  </div>',
          '</div>'
        ].join('');
      }

      function mainEditorPanel() {
        return [
          '<div class="row">',
          '  <div class="col-xs-12">',

          '  </div>',
          '</div>'
        ].join('');
      }

      function optionsPanel() {
        return [
          '<div class="row option shuffle">',
          '  <div class="col-xs-12">',
          '  </div>',
          '</div>',
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <checkbox class="shuffle-choices" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
          '  </div>',
          '</div>',
          '<div class="row option layout">',
          '  <div class="col-xs-12">',
          '    <span>Layout</span>',
          '    <select class="form-control" ng-model="model.config.layout"',
          '       ng-options="c for c in [\'3 Columns\', \'4 Columns\', \'5 Columns\']">',
          '    </select>',
          '  </div>',
          '</div>',
          '<div class="row option input-type">',
          '  <div class="col-xs-12">',
          '    <span>Input Type</span>',
          '    <select class="form-control" ng-model="model.config.inputType"',
          '       ng-options="c for c in [\'Radio\', \'Checkbox\']">',
          '    </select>',
          '    <p class="inline-help" ng-if="model.config.inputType==\'Radio\'">',
          '       This option allows students to select one',
          '       correct answer. You may, however, set more',
          '       than one answer as correct if you choose',
          '    </p>',
          '    <p class="inline-help" ng-if="model.config.inputType==\'Checkbox\'">',
          '       This option allows students to select more than',
          '       one correct answer. You may, however, set only',
          '       one correct answer if you choose.',
          '    </p>',
          '  </div>',
          '</div>'
        ].join('');
      }

      return [
        '<div class="config-corespring-match">',
        '  <div navigator-panel="Design">',
        designTemplate(),
        '  </div>',
        '  <div navigator-panel="Scoring">',
        ChoiceTemplates.scoring(),
        '  </div>',
        '</div>'
      ].join('');
    }

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];