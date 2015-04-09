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

    function link(scope, element, attrs) {

      var MIN_COLUMNS = 3;
      var MAX_COLUMNS = 5;

      var $log = LogFactory.getLogger('corespring-match-configure');

      ChoiceTemplates.extendScope(scope, 'corespring-match');

      scope.layouts = [
        {
          id: 'three-columns',
          label: '3 Columns'
        },
        {
          id: 'four-columns',
          label: '4 Columns'
        },
        {
          id: 'five-columns',
          label: '5 Columns'
        }
      ];

      scope.inputTypes = [
        {
          id: 'radiobutton',
          label: 'Radio'
        },
        {
          id: 'checkbox',
          label: 'Checkbox'
        }
      ];

      scope.containerBridge = {
        setModel: setModel,
        getModel: getModel
      };

      scope.$watch('config.layout', watchLayout);

      scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      //-----------------------------------------------------------------------------

      function setModel(fullModel) {
        console.log("setModel", fullModel);
        scope.fullModel = fullModel || {};
        scope.model = scope.fullModel.model || {
          columns: []
        };
        scope.config = getConfig(scope.model);
        updatePartialScoring();
      }

      function getModel() {
        console.log("getModel", scope.fullModel);
        return _.cloneDeep(scope.fullModel);
      }

      /**
       * When the item is an old item, it does not have an config object.
       * In that case this method adds the config object and removes
       * the old properties like answerType
       * @param model
       * @returns {*}
       */
      function getConfig(model) {
        if(!model.config){
          var config = {};
          var answerType = model.answerType;
          config.inputType = answerType === 'MULTIPLE' ? scope.inputTypes[1].id : scope.inputTypes[0].id;
          config.layout = scope.layouts[Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, model.columns.length)) - MIN_COLUMNS].id;
          config.shuffle = false;
          if (answerType === 'YES_NO') {
            setDefaultColumnLabels(model, 'Yes', 'No');
          } else if (answerType === 'TRUE_FALSE') {
            setDefaultColumnLabels(model, 'True', 'False');
          }
          delete model.answerType;
          model.config = config;
          return config;
        }
        return model.config;
      }

      function setDefaultColumnLabels(model, labelOne, labelTwo) {
        while (model.columns.length < MIN_COLUMNS) {
          model.columns.push({
            labelHtml: ''
          });
        }
        if (_.isEmpty(model.columns[1].labelHtml)) {
          model.columns[1].labelHtml = labelOne;
        }
        if (_.isEmpty(model.columns[2].labelHtml)) {
          model.columns[2].labelHtml = labelTwo;
        }
      }

      function watchLayout(newValue, oldValue){
        if(newValue === oldValue){
          return;
        }
        var columns = scope.model.columns;
        var actualNumberOfColumns = columns.length;
        var expectedNumberOfColumns = getNumberOfColumnsForLayout(newValue);

        while(columns.length < expectedNumberOfColumns){
          columns.push(makeColumn("Column " + (columns.length + 1)));
          _.forEach(scope.fullModel.correctResponse, function(row){
            row.matchSet.push(false);
          });
        }
        while(columns.length > expectedNumberOfColumns){
          columns.pop();
          _.forEach(scope.fullModel.correctResponse, function(row){
            row.matchSet.pop();
          });
        }

        updatePartialScoring();
      }

      function updatePartialScoring(){
        scope.updatePartialScoringModel(sumCorrectAnswers());
      }

      function makeColumn(label){
        return {labelHtml:label};
      }

      function getNumberOfColumnsForLayout(layout){
        switch(layout){
          case 'four-columns': return 4;
          case 'five-columns': return 5;
          default: return MIN_COLUMNS;
        }
      }

      function sumCorrectAnswers(){
        return _.reduce(scope.fullModel.correctResponse, function(sum, row) {
          return sum + _.reduce(row.matchSet, function(match){
            return match ? 1 : 0;
          });
        }, 0);
      }
    }

    function template() {
      return [
        '<div class="config-corespring-match">',
        '  <div navigator-panel="Design">',
        designTemplate(),
        '  </div>',
        '  <div navigator-panel="Scoring">',
        scoringTemplate(),
        '  </div>',
        '</div>'
      ].join('');

      function scoringTemplate(){
        return [
          '<div class="form-horizontal" role="form">',
          '  <div class="container-fluid">',
          '    <div class="row">',
          '      <div class="col-xs-12">',
          ChoiceTemplates.scoring(),
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('');
      }

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
          '    <p class="intro">In a choice matrix students associate choices in the ',
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
          '    <table class="config-table">',
          '      <tr>',
          '        <td class="remove-row no-border">',
          '        </td>',
          '        <td class="help no-border">',
          '         <p>Click on labels to edit or remove</p>',
          '        </td>',
          '        <td class="help no-border" colspan="4">',
          '         <p class="text-right">Click on correct answer(s)</p>',
          '        </td>',
          '      </tr>',
          '      <tr>',
          '        <td class="no-border">',
          '        </td>',
          '        <th class="question-header">',
          '          Header Label',
          '        </th>',
          '        <th class="answer-header">',
          '          Column 1 Label',
          '        </th>',
          '        <th class="answer-header">',
          '          Column 2 Label',
          '        </th>',
          '      </tr>',
          '      <tr>',
          '        <td class="remove-row no-border">',
          '           x',
          '        </td>',
          '        <td class="question-col">',
          '          Enter a choice',
          '        </td>',
          '        <td class="answer-col">',
          '          O',
          '        </td>',
          '        <td class="answer-col">',
          '          O',
          '        </td>',
          '      </tr>',
          '      <tr>',
          '        <td class="no-border">',
          '        </td>',
          '        <td class="add-row no-border" colspan="5">',
          '          + Add a row',
          '        </td>',
          '      </tr>',
          '    </table>',
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
          '       ng-options="c.id as c.label for c in layouts">',
          '    </select>',
          '  </div>',
          '</div>',
          '<div class="row option input-type">',
          '  <div class="col-xs-12">',
          '    <span>Input Type</span>',
          '    <select class="form-control" ng-model="model.config.inputType"',
          '       ng-options="c.id as c.label for c in inputTypes">',
          '    </select>',
          '    <p class="inline-help" ng-if="model.config.inputType==\'radiobutton\'">',
          '       This option allows students to select one',
          '       correct answer. You may, however, set more',
          '       than one answer as correct if you choose',
          '    </p>',
          '    <p class="inline-help" ng-if="model.config.inputType==\'checkbox\'">',
          '       This option allows students to select more than',
          '       one correct answer. You may, however, set only',
          '       one correct answer if you choose.',
          '    </p>',
          '  </div>',
          '</div>'
        ].join('');
      }
    }

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
