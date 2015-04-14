var main = [
  '$http',
  '$timeout',
  'ChoiceTemplates',
  'ComponentImageService',
  'LogFactory',
  'WiggiLinkFeatureDef',
  'WiggiMathJaxFeatureDef',
  function($http,
    $timeout,
    ChoiceTemplates,
    ComponentImageService,
    LogFactory,
    WiggiLinkFeatureDef,
    WiggiMathJaxFeatureDef) {

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      controller: ['$scope', controller],
      link: link,
      template: template()
    };

    function controller(scope) {
      scope.imageService = function() {
        return ComponentImageService;
      };

      scope.extraFeaturesForMatch = {
        definitions: [
          new WiggiMathJaxFeatureDef()
        ]
      };
    }

    function link(scope, element, attrs) {
      var MIN_COLUMNS = 3;
      var MAX_COLUMNS = 5;
      var INPUT_TYPE_CHECKBOX = 'checkbox';
      var INPUT_TYPE_RADIOBUTTON = 'radiobutton';

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
          id: INPUT_TYPE_RADIOBUTTON,
          label: 'Radio'
        },
        {
          id: INPUT_TYPE_CHECKBOX,
          label: 'Checkbox'
        }
      ];

      scope.active = [];

      scope.containerBridge = {
        setModel: setModel,
        getModel: getModel
      };

      scope.activate = activate;
      scope.addRow = addRow;
      scope.classForChoice = classForChoice;
      scope.cleanLabel = makeCleanLabel();
      scope.columnLabelUpdated = columnLabelUpdated;
      scope.deactivate = deactivate;
      scope.isRadioButton = isRadioButton;
      scope.isCheckBox = isCheckBox;
      scope.onClickEdit = onClickEdit;
      scope.onClickMatch = onClickMatch;
      scope.removeRow = removeRow;
      scope.rowLabelUpdated = rowLabelUpdated;

      //the trottle is to avoid update problems of the editor models
      scope.$watch('config.layout', _.throttle(watchLayout, 50));

      //the trottle is to avoid update problems of the editor models
      scope.$watch('config.inputType', _.throttle(watchInputType, 50));

      scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      //-----------------------------------------------------------------------------

      function setModel(fullModel) {
        console.log("setModel", fullModel);
        scope.fullModel = fullModel || {};
        scope.model = scope.fullModel.model;
        scope.config = getConfig(scope.model);

        updateEditorModels();
      }

      function getModel() {
        console.log("getModel", scope.fullModel);
        var fullModel = _.cloneDeep(scope.fullModel);
        return fullModel;
      }

      function updateEditorModels() {
        $log.debug("updateEditorModels in");
        scope.matchModel = createMatchModel();
        scope.updatePartialScoringModel(sumCorrectAnswers());
        $log.debug("updateEditorModels out");
      }

      /**
       * When the item is an old item, it does not have an config object.
       * In that case this method adds the config object and removes
       * the old properties like answerType
       * @param model
       * @returns {*}
       */
      function getConfig(model) {
        if (!model.config) {
          var config = {};
          var answerType = model.answerType;
          config.inputType = scope.inputTypes[answerType === 'MULTIPLE' ? 1 : 0].id;
          var columns = Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, model.columns.length));
          config.layout = scope.layouts[columns - MIN_COLUMNS].id;
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

      function watchLayout(newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        var columns = scope.model.columns;
        var actualNumberOfColumns = columns.length;
        var expectedNumberOfColumns = getNumberOfColumnsForLayout(newValue);

        while (columns.length < expectedNumberOfColumns) {
          columns.push({
            labelHtml: "Column " + (columns.length)
          });
          addColumnToCorrectResponseMatrix();
        }
        while (columns.length > expectedNumberOfColumns) {
          columns.pop();
          removeColumnFromCorrectResponseMatrix();
        }

        updateEditorModels();
      }

      function watchInputType(newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        if (newValue === INPUT_TYPE_RADIOBUTTON) {
          removeAllCorrectAnswersButFirst();
        }
        updateEditorModels();
      }

      function removeAllCorrectAnswersButFirst() {
        _.forEach(scope.fullModel.correctResponse, function(row) {
          var indexOfFirstTrue = _.indexOf(row.matchSet, true);
          _.forEach(row.matchSet, function(match, index) {
            row.matchSet[index] = match && index <= indexOfFirstTrue;
          });
        });
      }

      function addColumnToCorrectResponseMatrix() {
        _.forEach(scope.fullModel.correctResponse, function(row) {
          row.matchSet.push(false);
        });
      }

      function removeColumnFromCorrectResponseMatrix() {
        _.forEach(scope.fullModel.correctResponse, function(row) {
          row.matchSet.pop();
        });
      }

      function addRowToCorrectResponseMatrix(rowId) {
        var emptyMatchSet = createEmptyMatchSet(scope.model.columns.length-1);
        scope.fullModel.correctResponse.push({
          id: rowId,
          matchSet: emptyMatchSet
        });
      }

      function removeRowFromCorrectResponseMatrix(rowId) {
        _.remove(scope.fullModel.correctResponse, {
          id: rowId
        });
      }

      function createEmptyMatchSet(length) {
        return _.range(length).map(function() {
          return false;
        });
      }

      function getNumberOfColumnsForLayout(layout) {
        switch (layout) {
          case 'four-columns':
            return 4;
          case 'five-columns':
            return 5;
          default:
            return MIN_COLUMNS;
        }
      }

      function sumCorrectAnswers() {
        var total = _.reduce(scope.fullModel.correctResponse, function(sum, row) {
          return sum + _.reduce(row.matchSet, function(match) {
            return match ? 1 : 0;
          });
        }, 0);
        $log.debug("sumCorrectAnswers", total, scope.fullModel.correctResponse);
        return total;
      }

      function findFreeRowSlot() {
        var slot = 1;
        var rows = _.pluck(scope.model.rows, 'id');
        while (_.contains(rows, 'row-' + slot)) {
          slot++;
        }
        return slot;
      }

      function addRow() {
        var index = findFreeRowSlot();
        var rowId = 'row-' + index;
        $log.debug("addRow", rowId);
        scope.model.rows.push({
          id: rowId,
          labelHtml: 'Question text ' + index
        });
        addRowToCorrectResponseMatrix(rowId);

        updateEditorModels();
      }

      function removeRow(index) {
        var row = scope.model.rows[index];
        $log.debug("removeRow", index, row);
        scope.model.rows.splice(index, 1);
        removeRowFromCorrectResponseMatrix(row.id);
        updateEditorModels();
      }

      function createMatchModel() {
        var matchModel = {
          columns: makeHeaders(),
          rows: makeRows()
        };
        $log.debug("createMatchModel", matchModel);
        return matchModel;

        function makeHeaders() {
          var questionHeaders = [];
          questionHeaders.push({
            wiggiId: _.uniqueId(),
            cssClass: 'question-header',
            labelHtml: scope.model.columns[0].labelHtml
          });
          var answerHeaders = scope.model.columns.slice(1).map(function(col) {
            return {
              wiggiId: _.uniqueId(),
              cssClass: 'answer-header',
              labelHtml: col.labelHtml
            };
          });
          var columns = questionHeaders.concat(answerHeaders);
          return columns;
        }

        function makeRows() {
          var rows = scope.model.rows.map(makeRow);
          return rows;
        }

        function makeRow(sourceRow) {
          var correctRow = _.find(scope.fullModel.correctResponse, {
            id: sourceRow.id
          });
          console.log("makeRow", sourceRow, correctRow, scope.fullModel.correctResponse);
          var matchSet = correctRow.matchSet.map(function(match) {
            return {
              value: match
            };
          });
          var row = {
            id: sourceRow.id,
            wiggiId: _.uniqueId(),
            labelHtml: sourceRow.labelHtml,
            matchSet: matchSet
          };
          return row;
        }
      }

      function classForChoice(row, index) {
        var classes = [getInputTypeClass(scope.config.inputType), 'input'];
        if (row.matchSet[index].value) {
          classes.push('selected');
        }
        return classes.join(' ');

        function getInputTypeClass(inputType) {
          return 'match-' + (isCheckBox(inputType) ?
            INPUT_TYPE_CHECKBOX : INPUT_TYPE_RADIOBUTTON);
        }
      }

      function onClickMatch(row, index) {
        console.log("onClickMatch", row, index);
        if (isCheckBox(scope.config.inputType)) {
          row.matchSet[index].value = !row.matchSet[index].value;
        } else {
          _.forEach(row.matchSet, function(match, i) {
            match.value = (i === index);
          });
        }

        updateCorrectResponse();
        updateEditorModels();
      }

      function updateCorrectResponse() {
        var correctResponse = scope.matchModel.rows.map(function(row) {
          return {
            id: row.id,
            matchSet: row.matchSet.map(function(match) {
              return match.value;
            })
          };
        });
        scope.fullModel.correctResponse = correctResponse;
      }

      function makeCleanLabel() {
        var wiggiCleanerRe = new RegExp(String.fromCharCode(8203), 'g');
        return function(item) {
          return (item.labelHtml || '').replace(wiggiCleanerRe, '');
        };
      }

      function activate($event, $index) {
        $event.stopPropagation();
        scope.active = [];
        scope.active[$index] = true;
      }

      function onClickEdit($event, index) {
        $event.stopPropagation();

        if (!scope.active[index]) {
          $event.preventDefault();
          scope.active = [];
          scope.active[index] = true;
        }
      }

      function deactivate($event) {
        $log.debug("deactivate", $event);
        scope.active = [];
        scope.$emit('mathJaxUpdateRequest');
      }

      function columnLabelUpdated(index) {
        $log.debug("columnLabelUpdated", index);
        scope.model.columns[index].labelHtml = scope.matchModel.columns[index].labelHtml;
      }

      function rowLabelUpdated(index) {
        $log.debug("rowLabelUpdated", index);
        scope.model.rows[index].labelHtml = scope.matchModel.rows[index].labelHtml;
      }

      function isCheckBox(inputType) {
        return inputType === INPUT_TYPE_CHECKBOX;
      }

      function isRadioButton(inputType) {
        return inputType === INPUT_TYPE_RADIOBUTTON;
      }
    }

    function template() {
      return [
        '<div class="config-corespring-match" ng-click="deactivate($event)">',
        '  <div navigator-panel="Design">',
        designTemplate(),
        '  </div>',
        '  <div navigator-panel="Scoring">',
        scoringTemplate(),
        '  </div>',
        '</div>'
      ].join('');

      function scoringTemplate() {
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
          feedback(),
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
          '    <table class="corespring-match-table" ng-class="config.layout">',
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
                   headerColumns(),
          '      </tr>',
          '      <tr ng-repeat="row in matchModel.rows">',
          '        <td class="remove-row">',
          '          <i class="remove-row-button fa fa-trash-o fa-lg" ',
          '             tooltip="Remove Row"',
          '             tooltip-append-to-body="true"',
          '             ng-click="removeRow($index)" ',
          '           ></i>',
          '        </td>',
          '        <td class="question-col"',
          '           ng-click="onClickEdit($event, row.wiggiId)"',
          '          >',
          '          <div class="content-holder" ',
          '            ng-hide="active[row.wiggiId]" ',
          '            ng-bind-html-unsafe="cleanLabel(row)"',
          '           ></div>',
          '          <div mini-wiggi-wiz=""',
          '              ng-show="active[row.wiggiId]"',
          '              active="active[row.wiggiId]"',
          '              ng-model="row.labelHtml"',
          '              ng-change="rowLabelUpdated($index)"',
          '              dialog-launcher="external"',
          '              features="extraFeaturesForMatch"',
          '              parent-selector=".modal-body"',
          '              image-service="imageService()">',
          '          </div>',
          '        </td>',
          '        <td class="answer-col" ng-repeat="match in row.matchSet">',
          '          <div class="corespring-match-choice"',
          '             ng-class="classForChoice(row, $index)"',
          '             ng-click="onClickMatch(row, $index)"',
          '            >',
          '            <div class="background fa"></div>',
          '            <div class="foreground fa"></div>',
          '          </div>',
          '        </td>',
          '      </tr>',
          '      <tr>',
          '        <td class="no-border">',
          '        </td>',
          '        <td class="add-row" colspan="5">',
          '          <button type="button" class="add-row-button btn btn-default" ',
          '            ng-click="addRow()">+ Add a row</button>',
          '        </td>',
          '      </tr>',
          '    </table>',
          '  </div>',
          '</div>'
        ].join('');
      }

      function headerColumns() {
        return [
          '<th ng-repeat="column in matchModel.columns"',
          '  ng-click="onClickEdit($event, column.wiggiId)"',
          '  ng-class="column.cssClass">',
          '  <div class="content-holder" ',
          '    ng-hide="active[column.wiggiId]" ',
          '    ng-bind-html-unsafe="cleanLabel(column)"',
          '   ></div>',
          '  <div mini-wiggi-wiz=""',
          '      ng-show="active[column.wiggiId]"',
          '      active="active[column.wiggiId]"',
          '      ng-model="column.labelHtml"',
          '      ng-change="columnLabelUpdated($index)"',
          '      dialog-launcher="external"',
          '      features="extraFeaturesForMatch"',
          '      parent-selector=".modal-body"',
          '      image-service="imageService()">',
          '  </div>',
          '</th>'
        ].join('');
      }

      function feedback() {
        return [
          '<div class="row">',
          '  <div class="col-xs-12 feedback-panel-col">',
          '    <div feedback-panel>',
          '      <div feedback-selector',
          '          fb-sel-label="If correct, show"',
          '          fb-sel-class="correct"',
          '          fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
          '          fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
          '          fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
          '      </div>',
          '      <div feedback-selector',
          '          fb-sel-label="If partially correct, show"',
          '          fb-sel-class="partial"',
          '          fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
          '          fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
          '          fb-sel-default-feedback="{{defaultPartialFeedback}}">',
          '      </div>',
          '      <div feedback-selector',
          '          fb-sel-label="If incorrect, show"',
          '          fb-sel-class="incorrect"',
          '          fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
          '          fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
          '          fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join("\n");
      }

      function optionsPanel() {
        return [
          '<div class="row option shuffle">',
          '  <div class="col-xs-12">',
          '  </div>',
          '</div>',
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <checkbox class="shuffle-choices" ng-model="config.shuffle">Shuffle Choices</checkbox>',
          '  </div>',
          '</div>',
          '<div class="row option layout">',
          '  <div class="col-xs-12">',
          '    <span>Layout</span>',
          '    <select class="form-control" ng-model="config.layout"',
          '       ng-options="c.id as c.label for c in layouts">',
          '    </select>',
          '  </div>',
          '</div>',
          '<div class="row option input-type">',
          '  <div class="col-xs-12">',
          '    <span>Input Type</span>',
          '    <select class="form-control" ng-model="config.inputType"',
          '       ng-options="c.id as c.label for c in inputTypes">',
          '    </select>',
          '    <p class="help" ng-if="isRadioButton(config.inputType)">',
          '       This option allows students to select one',
          '       correct answer. You may, however, set more',
          '       than one answer as correct if you choose',
          '    </p>',
          '    <p class="help" ng-if="isCheckBox(config.inputType)">',
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