var main = [
  '$http',
  '$timeout',
  'LogFactory',
  'WiggiLinkFeatureDef',
  'WiggiMathJaxFeatureDef',
  function(
    $http,
    $timeout,
    LogFactory,
    WiggiLinkFeatureDef,
    WiggiMathJaxFeatureDef
  ) {

    var $log = LogFactory.getLogger('corespring-match-configure');

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      controller: ['$scope', controller],
      link: link,
      template: template()
    };

    function controller(scope) {

      scope.extraFeaturesForMatch = {
        definitions: [
          new WiggiMathJaxFeatureDef()
        ]
      };

      scope.sumCorrectAnswers = function() {
        var total = _.reduce(scope.fullModel.correctResponse, function(sum, row) {
          return sum + ((row.matchSet && row.matchSet.indexOf(true) >= 0) ? 1 : 0);
        }, 0);
        $log.debug("sumCorrectAnswers", total, scope.fullModel.correctResponse);
        return total;
      };
    }

    function link(scope, element, attrs) {

      var MIN_COLUMNS = 3;
      var MAX_COLUMNS = 5;
      var INPUT_TYPE_CHECKBOX = 'checkbox';
      var INPUT_TYPE_RADIOBUTTON = 'radiobutton';

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
          label: 'Radio - One Answer'
        },
        {
          id: INPUT_TYPE_CHECKBOX,
          label: 'Checkbox - Multiple Answers'
        }
      ];

      scope.active = [];

      scope.numberOfCorrectResponses = 0;

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
      scope.onChangeLayout = onChangeLayout;
      scope.onChangeInputType = onChangeInputType;

      //the throttle is to avoid update problems of the editor models
      scope.$watch('config.layout', _.throttle(onChangeLayout, 50));

      //the throttle is to avoid update problems of the editor models
      scope.$watch('config.inputType', _.throttle(onChangeInputType, 50));

      scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      //-----------------------------------------------------------------------------

      function setModel(fullModel) {
        scope.fullModel = fullModel || {};
        if (!scope.fullModel.partialScoring || scope.fullModel.partialScoring.length === 0) {
          scope.fullModel.partialScoring = [{}];
        }
        scope.model = scope.fullModel.model;
        scope.config = getConfig(scope.model);

        updateEditorModels();
      }

      function getModel() {
        return _.cloneDeep(scope.fullModel);
      }

      function updatePartialScoring() {
        if (scope.fullModel.model.config.inputType === INPUT_TYPE_CHECKBOX) {
          scope.fullModel.partialScoring = scope.fullModel.partialScoring || {
            sections: []
          };
          if (_.isArray(scope.fullModel.partialScoring)) {
            scope.fullModel.partialScoring = {
              sections: []
            };
          }
          _.each(scope.fullModel.model.rows, function(row, idx) {
            var partialSection = _.findWhere(scope.fullModel.partialScoring.sections, {
              catId: row.id
            });
            if (!partialSection) {
              partialSection = {
                "catId": row.id,
                "label": "Row " + (idx + 1),
                "partialScoring": []
              };
              scope.fullModel.partialScoring.sections.push(partialSection);
            }
            var correctResponseForRow = _.findWhere(scope.fullModel.correctResponse, {
              id: row.id
            });

            var trueCount = _.reduce(correctResponseForRow.matchSet, function(acc, m) {
              return acc + (m ? 1 : 0);
            }, 0);
            partialSection.numberOfCorrectResponses = Math.max(trueCount, 0);
            partialSection.partialScoring = _.filter(partialSection.partialScoring, function(ps) {
              return ps.numberOfCorrect < trueCount;
            });
          });
          scope.fullModel.partialScoring.sections = _.filter(scope.fullModel.partialScoring.sections, function(section) {
            return _.findWhere(scope.fullModel.model.rows, {
              id: section.catId
            });
          });
        } else if (scope.fullModel.model.config.inputType === INPUT_TYPE_RADIOBUTTON) {
          scope.fullModel.partialScoring = scope.fullModel.partialScoring || [];
          if (!_.isArray(scope.fullModel.partialScoring)) {
            scope.fullModel.partialScoring = [];
          }
        }
      }

      function updateEditorModels() {
        $log.debug("updateEditorModels in");
        scope.matchModel = createMatchModel();
        scope.numberOfCorrectResponses = scope.sumCorrectAnswers();
        updatePartialScoring();

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

      function onChangeLayout(newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        var columns = scope.model.columns;
        var actualNumberOfColumns = columns.length;
        var expectedNumberOfColumns = getNumberOfColumnsForLayout(newValue);

        while (columns.length < expectedNumberOfColumns) {
          columns.push({
            labelHtml: "Column " + (columns.length + 1)
          });
          addColumnToCorrectResponseMatrix();
        }
        while (columns.length > expectedNumberOfColumns) {
          columns.pop();
          removeColumnFromCorrectResponseMatrix();
        }

        updateEditorModels();
      }

      function onChangeInputType(newValue, oldValue) {
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
        var matchSet = createEmptyMatchSet(scope.model.columns.length - 1);
        scope.fullModel.correctResponse.push({
          id: rowId,
          matchSet: matchSet
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
          var questionHeaders = [],
            questionHeaderId = _.uniqueId();

          questionHeaders.push({
            wiggiId: questionHeaderId,
            cssClass: 'question-header header' + questionHeaderId,
            labelHtml: scope.model.columns[0].labelHtml
          });
          var answerHeaders = scope.model.columns.slice(1).map(function(col) {
            var answerHeaderId = _.uniqueId();
            return {
              wiggiId: answerHeaderId,
              cssClass: 'answer-header header' + answerHeaderId,
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
            matchSet: _.pluck(row.matchSet, 'value')
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

      function onClickEdit($event, index, $this) {
        $event.stopPropagation();

        if (!scope.active[index]) {
          $event.preventDefault();
          scope.active = [];
          scope.active[index] = true;
        }

        if ($this.column) {
          var elementClass = '.header' + $this.column.wiggiId,
            elementHtml = $(elementClass).find('.wiggi-wiz-editable')[0].innerHTML;

          if (elementHtml === "Column 1" || elementHtml === "Column 2" || elementHtml === "Column 3" || elementHtml === "Column 4" || elementHtml === "Column 5") {
            $(elementClass).find('.wiggi-wiz-editable').html('');
          }
        }
      }

      function deactivate($event) {
        $log.debug("deactivate", $event);
        scope.active = [];
        scope.$emit('mathJaxUpdateRequest');
      }

      function columnLabelUpdated(index) {
        $log.debug("columnLabelUpdated", index);
        scope.model.columns[index].labelHtml = removeUnexpectedTags(scope.matchModel.columns[index].labelHtml);
      }

      function rowLabelUpdated(index) {
        $log.debug("rowLabelUpdated", index);
        scope.model.rows[index].labelHtml = removeUnexpectedTags(scope.matchModel.rows[index].labelHtml);
      }

      function removeUnexpectedTags(s) {
        var node = $('<div>');
        node.html(s);

        var sel = ":not(img)";
        node.find(sel).css('width', '');
        node.find(sel).css('min-width', '');
        node.find(sel).css('height', '');
        node.find(sel).css('min-height', '');

        node.find(sel).removeAttr('width');
        node.find(sel).removeAttr('min-width');
        node.find(sel).removeAttr('height');
        node.find(sel).removeAttr('min-height');

        var out = node.html();
        $log.debug(["removeUnexpectedTags", s, out].join('\n'));
        return out;
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
          '        <corespring-partial-scoring-config ng-if="fullModel.model.config.inputType == \'radiobutton\'"',
          '            full-model="fullModel"',
          '            number-of-correct-responses="numberOfCorrectResponses"',
          '        ></corespring-partial-scoring-config>',
          '        <corespring-multi-partial-scoring-config ng-if="fullModel.model.config.inputType == \'checkbox\'"',
          '            model="fullModel.partialScoring"',
          '            header-text="If there is more than one correct answer per row, you may allow partial credit based on the number of correct answers submitted per row. This is optional."',
          '            allow-partial-scoring="fullModel.allowPartialScoring"',
          '         ></corespring-multi-partial-scoring-config>',
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
          '      <div class="col-xs-12">',
          '        <p class="intro">',
          '          In Choice Matrix, students associate choices in the first column with options in the adjacent',
          '          rows. This interaction allows for either one or more correct answers. Setting more than one',
          '          answer as correct allows for partial credit (<i>see the Scoring tab</i>).',
          '        </p>',
          '      </div>',
          '    </div>',
          '    <div class="row option layout">',
          '      <div class="col-xs-4">',
          '        <span>Layout</span>',
          '        <select class="form-control" ng-model="config.layout" ng-options="c.id as c.label for c in layouts">',
          '        </select>',
          '      </div>',
          '      <div class="col-xs-5">',
          '        <span>Response Type</span>',
          '        <select class="form-control" ng-model="config.inputType"',
          '            ng-options="c.id as c.label for c in inputTypes">',
          '        </select>',
          '      </div>',
          '    </div>',
          '    <div class="row table-intro">',
          '      <div class="col-xs-12">',
          '        Click on the labels to edit or remove. Set the correct answers by clicking each correct answer',
          '        per row.',
          '      </div>',
          '    </div>',
          '    <div class="row">',
          '      <div class="col-xs-12">',
          '        <table class="corespring-match-table" ng-class="config.layout">',
          '          <tr>',
          '            <th ng-repeat="column in matchModel.columns"',
          '                ng-click="onClickEdit($event, column.wiggiId, this)"',
          '                ng-class="column.cssClass">',
          '              <div class="content-holder" ',
          '                  ng-hide="active[column.wiggiId]" ',
          '                  ng-bind-html-unsafe="cleanLabel(column)">',
          '              </div>',
          '              <div mini-wiggi-wiz=""',
          '                  ng-show="active[column.wiggiId]"',
          '                  active="active[column.wiggiId]"',
          '                  ng-model="column.labelHtml"',
          '                  ng-change="columnLabelUpdated($index)"',
          '                  features="extraFeaturesForMatch"',
          '                  parent-selector=".modal-body">',
          '              </div>',
          '            </th>',
          '          </tr>',
          '          <tr ng-repeat="row in matchModel.rows">',
          '            <td class="question-col"',
          '                ng-click="onClickEdit($event, row.wiggiId, this)">',
          '              <div class="content-holder" ',
          '                  ng-hide="active[row.wiggiId]" ',
          '                  ng-bind-html-unsafe="cleanLabel(row)"></div>',
          '              <div mini-wiggi-wiz=""',
          '                  ng-show="active[row.wiggiId]"',
          '                  active="active[row.wiggiId]"',
          '                  ng-model="row.labelHtml"',
          '                  ng-change="rowLabelUpdated($index)"',
          '                  features="extraFeaturesForMatch"',
          '                  parent-selector=".modal-body">',
          '              </div>',
          '            </td>',
          '            <td class="answer-col" ng-repeat="match in row.matchSet">',
          '              <div class="corespring-match-choice"',
          '                  ng-class="classForChoice(row, $index)"',
          '                  ng-click="onClickMatch(row, $index)">',
          '                <div class="background fa"></div>',
          '                <div class="foreground fa"></div>',
          '              </div>',
          '            </td>',
          '            <td class="remove-row">',
          '              <i class="remove-row-button fa fa-trash-o fa-lg" ',
          '                  tooltip="Remove Row"',
          '                  tooltip-append-to-body="true"',
          '                  ng-click="removeRow($index)">',
          '              </i>',
          '            </td>',
          '          </tr>',
          '          <tr>',
          '            <td class="add-row" colspan="5">',
          '              <button type="button" class="add-row-button btn btn-default" ',
          '                  ng-click="addRow()">+ Add a row</button>',
          '            </td>',
          '          </tr>',
          '        </table>',
          '      </div>',
          '    </div>',
          '    <div class="row">',
          '      <div class="col-xs-12">',
          '        <checkbox class="shuffle-choices" ng-model="config.shuffle">Shuffle Choices</checkbox>',
          '      </div>',
          '    </div>',
          '    <div class="row">',
          '      <div class="col-xs-12 feedback-panel-col">',
          '        <corespring-feedback-config ',
          '            full-model="fullModel"',
          '            component-type="corespring-match">',
          '        </corespring-feedback-config>',
          '      </div>',
          '    </div>',
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