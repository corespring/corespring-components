var main = [
  '$http',
  '$timeout',
  'ChoiceTemplates',
  'LogFactory',
  function(
    $http,
    $timeout,
    ChoiceTemplates,
    LogFactory
    ) {

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      link: link,
      template: template()
    };

    var $log = LogFactory('corespring-match-configure')

    function link(scope, element, attrs) {

      ChoiceTemplates.extendScope(scope, 'corespring-match');

      scope.containerBridge = {
        setModel: setModel,
        getModel: getModel
      };

      function setModel(fullModel) {
        scope.fullModel = fullModel || {};
        scope.model = scope.fullModel.model || {columns:[]};
        scope.config = getConfig(scope.model);
      }

      function getModel() {
        return _.cloneDeep(scope.fullModel);
      }

      function getConfig(model){
        var answerType = model.answerType;
        if(answerType){
          delete model.answerType;
          var config = {};
          config.inputType = answerType === 'MULTIPLE' ? 'Checkbox' : 'Radio';
          if(answerType === 'YES_NO'){
            setDefaultColumnLabels(model, 'Yes', 'No');
          } else if(answerType === 'TRUE_FALSE'){
            setDefaultColumnLabels(model, 'True', 'False');
          }
          config.layout = Math.min(5, Math.max(3, model.columns.length)) + " Columns";
          config.shuffle = false;
          return config;
        }
        return model.config;
      }

      function setDefaultColumnLabels(model, labelOne, labelTwo){
        while(model.columns.length < 3){
          model.columns.push({labelHtml:''});
        }
        if(_.isEmpty(model.columns[1].labelHtml)){
          model.columns[1].labelHtml = labelOne;
        }
        if(_.isEmpty(model.columns[2].labelHtml)){
          model.columns[2].labelHtml = labelTwo;
        }
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