var main = [
  '$sce', '$log',

  function($sce, $log) {

    return {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

      var ALL_CORRECT = "all_correct";
      var CORRECT = "correct";
      var FALSE_LABEL = "False";
      var INCORRECT = "incorrect";
      var INPUT_TYPE_CHECKBOX = 'checkbox';
      var INPUT_TYPE_DEFAULT = INPUT_TYPE_RADIOBUTTON;
      var INPUT_TYPE_RADIOBUTTON = 'radiobutton';
      var MULTIPLE = 'MULTIPLE';
      var NO_LABEL = "No";
      var TRUE_FALSE = 'TRUE_FALSE';
      var TRUE_LABEL = "True";
      var UNKNOWN = "unknown";
      var YES_LABEL = "Yes";
      var YES_NO = 'YES_NO';

      scope.editable = true;
      scope.isSummaryFeedbackOpen = false;
      scope.isSeeCorrectAnswerOpen = false;

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setResponse: setResponse,
        setMode: function(newMode) {},
        reset: reset,
        resetStash: function() {},
        isAnswerEmpty: isAnswerEmpty,
        answerChangedHandler: answerChangedHandler,
        editable: setEditable
      };

      scope.showSeeCorrectAnswerLink = showSeeCorrectAnswerLink;
      scope.getCorrectness = getCorrectness;
      scope.onClickMatch = onClickMatch;
      scope.getIconClass = getIconClass;
      scope.isCheckBox = isCheckBox;
      scope.isRadioButton = isRadioButton;

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

      //-----------------------------------------------------------------

      function setDataAndSession(dataAndSession) {
        scope.session = dataAndSession.session;
        scope.data = dataAndSession.data;
        scope.matchModel = prepareModel(dataAndSession.data.model, scope.session);
        updateInputType(scope.matchModel);
        renderMath();
      }

      function getSession() {
        var answers = scope.matchModel.rows.map(function(row) {
          return {
            "id": row.id,
            "matchSet": row.matchSet.map(function(match) {
              return match.value;
            })
          };
        });
        return {
          answers: answers
        };
      }

      function setResponse(response) {
        console.log("setResponse", response);
        scope.response = response;

        if (response.feedback) {
          _.each(response.feedback.correctnessMatrix, function(correctnessRow) {
            var modelRow = _.find(scope.matchModel.rows, whereIdIsEqual(correctnessRow.id));
            if (modelRow) {
              _.forEach(modelRow.matchSet, function(matchSetItem, i){
                matchSetItem.correct = correctnessRow.matchSet[i].correctness;
              });
            }
          });
        }
      }

      function reset() {
        scope.session = {};
        scope.matchModel = prepareModel(scope.data.model, {});
        scope.isSummaryFeedbackOpen = false;
        scope.isSeeCorrectAnswerOpen = false;
        delete scope.response;
      }

      function updateInputType(model) {
        function getInputType(model) {
          switch (model.answerType) {
            case YES_NO:
            case TRUE_FALSE:
              return INPUT_TYPE_RADIOBUTTON;
            case MULTIPLE:
              return INPUT_TYPE_CHECKBOX;
            default:
              return INPUT_TYPE_DEFAULT;
          }
        }
        scope.inputType = getInputType(model || {});
      }

      function prepareModel(rawModel, session) {

        var answerType = rawModel.answerType || TRUE_FALSE;

        function prepareColumns() {
          var columns = _.cloneDeep(rawModel.columns);

          if (answerType === YES_NO || answerType === TRUE_FALSE) {
            if (columns.length !== 3) {
              $log.error('Match interaction with boolean answer type should have 2 columns, found ' + columns.length);
              while(columns.length < 3){
                columns.push({labelHtml: ''});
              }
            }
            if(_.isEmpty(columns[1].labelHtml)){
              columns[1].labelHtml = answerType === TRUE_FALSE ? TRUE_LABEL : YES_LABEL;
            }
            if(_.isEmpty(columns[2].labelHtml)){
              columns[2].labelHtml = answerType === TRUE_FALSE ? FALSE_LABEL : NO_LABEL;
            }
          }

          return columns;
        }

        var answersExist = (session && session.answers);

        function prepareRows() {
          return rawModel.rows.map(function(row) {
            var cloneRow = _.cloneDeep(row);

            cloneRow.matchSet = answersExist ?
              _.find(session.answers, whereIdIsEqual(row.id)).matchSet.map(function(match) {
                return {
                  "value": match
                };
              }) :
              _.range(rawModel.columns.length - 1).map(function() {
                return {
                  "value": false
                };
              });

            return cloneRow;
          });
        }

        return {
          "columns": prepareColumns(),
          "rows": prepareRows(),
          "answerType": answerType
        };
      }

      function answerChangedHandler(callback) {
        scope.$watch("matchModel", function(newValue, oldValue) {
          if (newValue !== oldValue) {
            callback();
          }
        }, true);
      }

      function showSeeCorrectAnswerLink(response) {
        return (response && response.correctness && response.correctness !== ALL_CORRECT);
      }

      function getCorrectness(correct) {
        switch (correct) {
          case 'correct':
          case 'incorrect':
            return correct;
        }
        return UNKNOWN;
      }

      function onClickMatch(matchSet, index) {
        if (scope.editable && !matchSet[index].correct) {
          if (isRadioButton(scope.inputType)) {
            _.forEach(matchSet, function(matchSetItem,i){
              matchSetItem.value = (i === index);
            });
          }
        }
      }

      function getIconClass(row, $index) {
        if (scope.response && scope.response.correctResponse) {
          var correctRow = _.find(scope.response.correctResponse, whereIdIsEqual(row.id));
          if (correctRow && correctRow.matchSet[$index]) {
            return (isRadioButton(scope.inputType)) ?
              "correct-indicator fa-check-circle" :
              "correct-indicator fa-check-square";
          }
        }
        return UNKNOWN;
      }

      function renderMath(){
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
        return function(match) {
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
        '  <table class="table">',
        '    <tr>',
        '      <th class="answer-header"',
        '          ng-repeat="column in matchModel.columns"',
        '          ng-bind-html-unsafe="column.labelHtml"/>',
        '    </tr>',
        '    <tr class="question-row"',
        '        ng-repeat="row in matchModel.rows"',
        '        question-id="{{row.id}}">',
        '      <td class="question-cell"',
        '          ng-bind-html-unsafe="row.labelHtml"></td>',
        '      <td class="answer-cell"',
        '          ng-class="{editable:editable}"',
        '          ng-repeat="match in row.matchSet track by $index">',
        '        <checkbox ng-if="isCheckBox(inputType)"',
        '            ng-disabled="!editable"',
        '            ng-model="match.value"',
        '            ng-value="true"',
        '            ng-change="onClickMatch(row.matchSet, $index)"',
        '            ng-class="getCorrectness(match.correct)"',
        '            ></checkbox>',
        '        <radio ng-if="isRadioButton(inputType)"',
        '            ng-disabled="!editable"',
        '            ng-model="match.value"',
        '            ng-value="true"',
        '            ng-change="onClickMatch(row.matchSet, $index)"',
        '            ng-class="getCorrectness(match.correct)"',
        '            ></radio>',
        '      </td>',
        '    </tr>',
        '  </table>',
        '  <div class="panel feedback {{response.correctness}}"',
        '      ng-if="response.feedback.summary">',
        '    <div class="panel-heading"></div>',
        '    <div class="panel-body"',
        '        ng-bind-html-unsafe="response.feedback.summary">',
        '    </div>',
        '  </div>',
        '  <div class="see-solution"',
        '      see-answer-panel=""',
        '      see-answer-panel-expanded="isSeeCorrectAnswerOpen"',
        '      ng-if="showSeeCorrectAnswerLink(response)">',
        '    <table class="table">',
        '      <tr>',
        '        <th class="answer-header"',
        '            ng-repeat="column in matchModel.columns"',
        '            ng-bind-html-unsafe="column.labelHtml"/>',
        '      </tr>',
        '      <tr class="question-row"',
        '          ng-repeat="row in matchModel.rows">',
        '        <td class="question-cell"',
        '            ng-bind-html-unsafe="row.labelHtml"></td>',
        '        <td class="answer-cell"',
        '            ng-repeat="match in row.matchSet track by $index">',
        '          <span class="{{getIconClass(row,$index)}}"></span>',
        '        </td>',
        '      </tr>',
        '    </table>',
        '  </div>',
        '  <div class="panel summary-feedback"',
        '      ng-if="response.summaryFeedback">',
        '    <div class="panel-heading"',
        '        ng-click="isSummaryFeedbackOpen=!isSummaryFeedbackOpen">',
        '      <span class="toggle fa-lightbulb-o"></span>',
        '      <span class="label">Learn More</span>',
        '    </div>',
        '    <div class="panel-body"',
        '        ng-show="isSummaryFeedbackOpen"',
        '        ng-bind-html-unsafe="response.summaryFeedback">',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n");
    }
  }
];

exports.framework = 'angular';
exports.directive = main;