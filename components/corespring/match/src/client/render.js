var main = [
  '$sce', '$log',

  function ($sce, $log) {

    return {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

      var ALL_CORRECT = 'all_correct';
      var CORRECT = 'correct';
      var FALSE_LABEL = 'False';
      var INCORRECT = 'incorrect';
      var INPUT_TYPE_CHECKBOX = 'checkbox';
      var INPUT_TYPE_RADIOBUTTON = 'radiobutton';
      var MULTIPLE = 'MULTIPLE';
      var NO_LABEL = 'No';
      var TRUE_FALSE = 'TRUE_FALSE';
      var TRUE_LABEL = 'True';
      var UNKNOWN = 'unknown';
      var YES_LABEL = 'Yes';
      var YES_NO = 'YES_NO';

      scope.stack = [];
      scope.editable = true;
      scope.isSeeAnswerOpen = false;

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setResponse: setResponse,
        setMode: function (newMode) {
        },
        reset: reset,
        resetStash: function () {
        },
        isAnswerEmpty: isAnswerEmpty,
        editable: setEditable
      };

      scope.showSeeCorrectAnswerLink = showSeeCorrectAnswerLink;
      scope.classForCorrectness = classForCorrectness;
      scope.onClickMatch = onClickMatch;
      scope.undo = undo;
      scope.startOver = startOver;
      scope.getIconClass = getIconClass;
      scope.isCheckBox = isCheckBox;
      scope.isRadioButton = isRadioButton;

      scope.$watch("matchModel", watchMatchModel, true);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

      //-----------------------------------------------------------------

      function setDataAndSession(dataAndSession) {
        console.log("corespring match:setDataAndSession", dataAndSession);
        scope.session = dataAndSession.session;
        scope.data = dataAndSession.data;
        scope.config = setConfig(dataAndSession.data.model);
        scope.matchModel = prepareModel(dataAndSession.data.model, scope.session);
        scope.saveMatchModel = _.cloneDeep(scope.matchModel);
        renderMath();
      }

      /**
       * Some existing items have an answerType
       * while visual editor items have a config object.
       * We are using one or the other to set local 
       * properties for scope.inputType, scope.layout and scope.shuffle
       * @param model
       */
      function setConfig(model) {
        var config = model.config || {};

        if (config.inputType) {
          scope.inputType = getInputTypeForConfig(config.inputType);
        } else {
          scope.inputType = getInputTypeForConfig(model.answerType);
        }

        if (config.layout) {
          scope.layout = getLayoutForConfig(config.layout);
        } else {
          var columns = _.isArray(model.columns) ? model.columns.length : 0;
          scope.layout = getLayoutForConfig(Math.min(5, Math.max(3, columns)));
        }

        scope.shuffle = !!config.shuffle;
      }

      function getInputTypeForConfig(configValue){
        switch(configValue){
          case 'checkbox':
          case 'Checkbox':
          case 'MULTIPLE':
            return INPUT_TYPE_CHECKBOX;
          default:
            return INPUT_TYPE_RADIOBUTTON;
        }
      }

      function getLayoutForConfig(configValue) {
        switch (configValue) {
          case 4:
          case '4 Columns':
          case 'four-columns':
            return 'four-columns';

          case 5:
          case '5 Columns':
          case 'five-columns':
            return 'five-columns';

          default:
            return 'three-columns';
        }
      }

      function getSession() {
        var answers = scope.matchModel.rows.map(function (row) {
          return {
            id: row.id,
            matchSet: row.matchSet.map(function (match) {
              return match.value;
            })
          };
        });
        return {
          answers: answers
        };
      }

      function setResponse(response) {
        console.log("corespring match: setResponse", response);
        scope.response = response;

        if (response.correctnessMatrix) {
          setCorrectnessOnAnswers(response.correctnessMatrix);
        }
      }

      function reset() {
        scope.stack = [];
        scope.session = {};
        scope.isSeeAnswerOpen = false;
        delete scope.response;
        scope.matchModel = _.cloneDeep(scope.saveMatchModel);
      }

      function setCorrectnessOnAnswers(correctnessRows) {
        _.each(correctnessRows, function (correctnessRow) {
          var modelRow = _.find(scope.matchModel.rows, whereIdIsEqual(correctnessRow.id));
          if (modelRow) {
            _.forEach(modelRow.matchSet, function (matchSetItem, i) {
              matchSetItem.correct = correctnessRow.matchSet[i].correctness;
            });
            modelRow.answerExpected = correctnessRow.answerExpected;
          }
        });
      }

      function prepareModel(rawModel, session) {
        return {
          columns: prepareColumns(),
          rows: scope.shuffle ? _.shuffle(prepareRows()) : prepareRows()
        };

        function prepareColumns() {
          var answerType = rawModel.answerType || TRUE_FALSE;
          var columns = _.cloneDeep(rawModel.columns);

          if (answerType === YES_NO || answerType === TRUE_FALSE) {
            if (rawModel.answerType && columns.length !== 3) {
              $log.warn('Match interaction with boolean answer type should have 2 columns, found ' + columns.length);
              while (columns.length < 3) {
                columns.push({
                  labelHtml: ''
                });
              }
            }
            if (_.isEmpty(columns[1].labelHtml)) {
              columns[1].labelHtml = answerType === TRUE_FALSE ? TRUE_LABEL : YES_LABEL;
            }
            if (_.isEmpty(columns[2].labelHtml)) {
              columns[2].labelHtml = answerType === TRUE_FALSE ? FALSE_LABEL : NO_LABEL;
            }
          }

          return columns;
        }

        function prepareRows() {
          var answersExist = (session && session.answers);
          return rawModel.rows.map(function (row) {
            var cloneRow = _.cloneDeep(row);

            cloneRow.matchSet = answersExist ?
              _.find(session.answers, whereIdIsEqual(row.id)).matchSet.map(function (match) {
                return {
                  value: match
                };
              }) :
              _.range(rawModel.columns.length - 1).map(function () {
                return {
                  value: false
                };
              });

            return cloneRow;
          });
        }
      }

      function showSeeCorrectAnswerLink(response) {
        return (response && response.correctness && response.correctness !== ALL_CORRECT);
      }

      function classForCorrectness(row, index) {
        return getInputTypeClass(scope.inputType) + ' ' + getCorrectClass(row, row.matchSet[index].correct);

        function getInputTypeClass(inputType){
          return inputType === INPUT_TYPE_CHECKBOX ? 'checkbox' : 'radiobutton';
        }

        function getCorrectClass(row, correct) {
          if(row.answerExpected){
            return 'unknown answer-expected';
          }

          switch (correct) {
            case CORRECT:
              return CORRECT;
            case INCORRECT:
              return INCORRECT;
            default:
              return UNKNOWN;
          }
        }
      }

      function onClickMatch(matchSet, index) {
        if (scope.editable && !matchSet[index].correct) {
          if (isRadioButton(scope.inputType)) {
            _.forEach(matchSet, function (matchSetItem, i) {
              matchSetItem.value = (i === index);
            });
          }
        }
      }

      function getIconClass(row, $index) {
        if (scope.response && scope.response.correctResponse) {
          var correctRow = _.find(scope.response.correctResponse, whereIdIsEqual(row.id));
          var answerRow = _.find(scope.matchModel.rows, whereIdIsEqual(row.id));
          if (correctRow && correctRow.matchSet[$index]) {
            return (isRadioButton(scope.inputType)) ?
              (answerRow.matchSet[$index].value ?
                'radiobutton correct' :
                'radiobutton correct unchecked') :
              (answerRow.matchSet[$index].value ?
                'checkbox correct' :
                'checkbox correct unchecked');
          }
        }
        return UNKNOWN;
      }

      function watchMatchModel(newValue, oldValue) {
        console.log("watchMatchModel", newValue);
        if (newValue && !_.isEqual(newValue.rows, _.last(scope.stack))) {
          scope.stack.push(_.cloneDeep(newValue.rows));
        }
      }

      function startOver() {
        scope.stack = [_.first(scope.stack)];
        revertToState(_.first(scope.stack));
      }

      function undo() {
        if (scope.stack.length < 2) {
          return;
        }
        scope.stack.pop();
        revertToState(_.last(scope.stack));
      }

      function revertToState(state) {
        _.forEach(scope.matchModel.rows, function (row, i) {
          _.forEach(row.matchSet, function (match, j) {
            match.value = state[i].matchSet[j].value;
          });
        });
      }

      function renderMath() {
        scope.$emit('rerender-math', {
          delay: 100,
          element: element[0]
        });
      }

      function isAnswerEmpty() {
        return _.isEmpty(this.getSession().answers);
      }

      function setEditable(e) {
        scope.editable = e;
      }

      function whereIdIsEqual(id) {
        return function (match) {
          return match.id === id;
        };
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
        '<div class="render-corespring-match">',
        undoStartOver(),
        matchInteraction(),
        itemFeedbackPanel(),
        seeSolutionPanel(),
        '</div>'
      ].join('\n');

      function undoStartOver() {
        return [
          '<div ng-show="editable" class="undo-start-over pull-right">',
          '  <button type="button" class="btn btn-default" ng-click="undo()" ng-disabled="stack.length < 2"><i class="fa fa-undo"></i> Undo</button>',
          '  <button type="button" class="btn btn-default" ng-click="startOver()" ng-disabled="stack.length < 2">Start over</button>',
          '</div>',
          '<div class="clearfix"></div>'
        ].join('');
      }

      function matchInteraction() {
        return [
          '<table class="table" ng-class="layout">',
          '  <tr>',
          '    <th class="answer-header"',
          '        ng-repeat="column in matchModel.columns"',
          '        ng-bind-html-unsafe="column.labelHtml"/>',
          '  </tr>',
          '  <tr class="question-row"',
          '      ng-repeat="row in matchModel.rows"',
          '      question-id="{{row.id}}">',
          '    <td class="question-cell">',
          '      <table>',
          '       <tr>',
          '         <td class="question-label" ng-bind-html-unsafe="row.labelHtml">',
          '         </td>',
          '         <td class="answer-expected-warning">',
          '           <div ng-if="row.answerExpected"><i class="fa fa-exclamation-triangle" alt="answer expected"></i></div>',
          '         </td>',
          '       </tr>',
          '      </table>',
          '    </td>',
          '    <td class="answer-cell"',
          '        ng-class="{editable:editable}"',
          '        ng-repeat="match in row.matchSet">',
          '      <checkbox ng-if="isCheckBox(inputType) && editable"',
          '          ng-model="match.value"',
          '          ng-value="true"',
          '          ng-change="onClickMatch(row.matchSet, $index)"',
          '          ></checkbox>',
          '      <radio ng-if="isRadioButton(inputType) && editable"',
          '          ng-model="match.value"',
          '          ng-value="true"',
          '          ng-change="onClickMatch(row.matchSet, $index)"',
          '          ></radio>',
          '      <div ng-if="!editable"',
          '         ng-class="classForCorrectness(row, $index)"',
          '        >',
          '        <i class="background fa"></i>',
          '        <i class="foreground fa"></i>',
          '      </div>',
          '    </td>',
          '  </tr>',
          '</table>'
        ].join('');
      }

      function itemFeedbackPanel() {
        return [
          '<div class="panel feedback {{response.correctness}}"',
          '    ng-if="response.feedback.summary">',
          '  <div class="panel-heading"></div>',
          '  <div class="panel-body"',
          '      ng-bind-html-unsafe="response.feedback.summary">',
          '  </div>',
          '</div>'
        ].join('');
      }

      function seeSolutionPanel() {
        return [
          '<div see-answer-panel="true"',
          '    see-answer-panel-expanded="isSeeAnswerPanelExpanded"',
          '    ng-if="showSeeCorrectAnswerLink(response)">',
          '  <table class="table" ng-class="layout">',
          '    <tr>',
          '      <th class="answer-header"',
          '          ng-class="{notFirst:!$first}"',
          '          ng-repeat="column in matchModel.columns"',
          '          ng-bind-html-unsafe="column.labelHtml"/>',
          '    </tr>',
          '    <tr class="question-row"',
          '        ng-repeat="row in matchModel.rows">',
          '      <td class="question-cell"',
          '          ng-bind-html-unsafe="row.labelHtml"></td>',
          '      <td class="answer-cell"',
          '          ng-repeat="match in row.matchSet track by $index">',
          '        <div ng-if="!editable"',
          '           ng-class="getIconClass(row,$index)"',
          '          >',
          '            <i class="background fa"></i>',
          '            <i class="foreground fa"></i>',
          '        </div>',
          '      </td>',
          '    </tr>',
          '  </table>',
          '</div>'
        ].join('');
      }
    }
  }
];

exports.framework = 'angular';
exports.directive = main;