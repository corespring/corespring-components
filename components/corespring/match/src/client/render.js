var main = [
  '$sce', '$log', 'CsUndoModel',

  function($sce, $log, CsUndoModel) {

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

      scope.editable = false;
      scope.bridge = {answerVisibe: false};


      scope.undoModel = new CsUndoModel();
      scope.undoModel.setGetState(getState);
      scope.undoModel.setRevertState(revertState);


      scope.classForChoice = classForChoice;
      scope.stateForChoice = stateForChoice;
      scope.classForSolution = classForSolution;
      scope.isCheckBox = isCheckBox;
      scope.isRadioButton = isRadioButton;
      scope.onClickMatch = onClickMatch;

      scope.containerBridge = {
        answerChangedHandler: saveAnswerChangedCallback,
        setInstructorData: setInstructorData,
        setPlayerSkin: setPlayerSkin,
        editable: setEditable,
        getSession: getSession,
        isAnswerEmpty: isAnswerEmpty,
        reset: reset,
        resetStash: function() {},
        setDataAndSession: setDataAndSession,
        setMode: function(newMode) {},
        setResponse: setResponse
      };

      scope.$watch("matchModel.rows", onChangeMatchModelRows, true);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

      //-----------------------------------------------------------------

      function setDataAndSession(dataAndSession) {
        scope.session = dataAndSession.session;
        scope.data = dataAndSession.data;
        setConfig(dataAndSession.data.model);
        scope.matchModel = prepareModel(dataAndSession.data.model, scope.session);
        scope.saveMatchModel = _.cloneDeep(scope.matchModel);
        scope.undoModel.init();
        renderMath();
      }

      /**
       * Some old existing items have an answerType
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

      function getInputTypeForConfig(configValue) {
        switch (configValue) {
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

      /**
       * @returns {answers: [{id:String, matchSet: [Boolean*]}*], numberOfAnswers: number}
       */
      function getSession() {
        var numberOfAnswers = 0;
        var answers = scope.matchModel.rows.map(function(row) {
          return {
            id: row.id,
            matchSet: row.matchSet.map(function(match) {
              numberOfAnswers += match.value ? 1 : 0;
              return match.value;
            })
          };
        });
        return {
          answers: answers,
          numberOfAnswers: numberOfAnswers
        };
      }

      function setResponse(response) {
        scope.response = response;

        if (response.correctnessMatrix) {
          setCorrectnessOnAnswers(response.correctnessMatrix);
        }
      }

      function setPlayerSkin(skin) {
        scope.iconset = skin.iconSet;
      }

      function setInstructorData(data) {
        var cr = _.cloneDeep(data.correctResponse);
        _.each(cr, function(r) {
          r.matchSet = _.map(r.matchSet, function(m) {
            return {
              correctness: m ? 'correct' : '',
              value: m
            };
          });
        });
        scope.containerBridge.setResponse({
          correctness: "correct",
          correctClass: "correct",
          score: 1,
          feedback: undefined,
          correctnessMatrix: cr
        });
      }

      function reset() {
        scope.bridge = {answerVisible: false};
        scope.editable = true;
        scope.session = {};
        scope.isSeeAnswerOpen = false;
        delete scope.response;
        scope.matchModel = _.cloneDeep(scope.saveMatchModel);
        scope.undoModel.init();
      }

      function setCorrectnessOnAnswers(correctnessRows) {
        _.each(correctnessRows, function(correctnessRow) {
          var modelRow = _.find(scope.matchModel.rows, whereIdIsEqual(correctnessRow.id));
          if (modelRow) {
            _.forEach(modelRow.matchSet, function(matchSetItem, i) {
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
          var columns = _.cloneDeep(rawModel.columns);

          var answerType = rawModel.answerType;
          if (answerType === YES_NO || answerType === TRUE_FALSE) {
            if (columns.length !== 3) {
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

          _.forEach(columns, function(col, index) {
            col.cssClass = index === 0 ? 'question-header' : 'answer-header';
            var labelWithoutTags = removeUnexpectedTags(col.labelHtml);
            col.labelHtml = isDefaultLabel(labelWithoutTags) ? '' : labelWithoutTags;
          });

          return columns;
        }

        function isDefaultLabel(s){
          switch(s){
            case "Custom header":
            case "Column 1":
            case "Column 2":
            case "Column 3":
            case "Column 4":
            case "Column 5":
              return true;
            default:
              return false;
          }
        }

        function prepareRows() {
          var answersExist = (session && session.answers);
          var rows = rawModel.rows.map(function(row) {
            var cloneRow = _.cloneDeep(row);

            cloneRow.labelHtml = removeUnexpectedTags(cloneRow.labelHtml);
            cloneRow.matchSet = answersExist ?
              createMatchSetFromSession(row.id) :
              createEmptyMatchSet(rawModel.columns.length - 1);

            return cloneRow;
          });
          return rows;
        }

        function createMatchSetFromSession(id) {
          return _.find(session.answers, whereIdIsEqual(id))
            .matchSet.map(function(match) {
              return {
                value: match
              };
            });
        }

        function createEmptyMatchSet(length) {
          return _.range(length).map(function() {
            return {
              value: false
            };
          });
        }
      }

      function saveAnswerChangedCallback(callback) {
        scope.answerChangedCallback = callback;
      }

      function onChangeMatchModelRows(newValue, oldValue) {
        if (_.isFunction(scope.answerChangedCallback)) {
          if (!_.isEqual(newValue, oldValue)) {
            scope.answerChangedCallback();
          }
        }
        scope.undoModel.remember();
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

      function classForChoice(row, index) {
        if (scope.bridge.answerVisible) {
          return classForSolution(row, index);
        }
        var classes = [getInputTypeClass(scope.inputType)];
        if (scope.editable) {
          classes.push('input');
          if (row.matchSet[index].value) {
            classes.push('selected');
          }
        } else {
          if (row.matchSet[index].value) {
            classes.push('selected');
          }

          classes.push(getCorrectClass(row, row.matchSet[index].correct));
        }
        return classes.join(' ');

        function getInputTypeClass(inputType) {
          return 'match-' + (inputType === INPUT_TYPE_CHECKBOX ? 'checkbox' : 'radiobutton');
        }

        function getCorrectClass(row, correct) {
          if (row.answerExpected) {
            return 'unknown answer-expected';
          }

          switch (correct) {
            case CORRECT:
              return CORRECT + ' checked';
            case INCORRECT:
              return INCORRECT;
            default:
              return UNKNOWN;
          }
        }
      }
      
      function stateForChoice(row, index) {
        var c = classForChoice(row, index);
        if (/incorrect/gi.test(c)) {
          return 'incorrect';
        }
        if (/correct/gi.test(c)) {
          return 'correct';
        }
        if (/selected/gi.test(c)) {
          return scope.editable ? 'selected' : 'selectedDisabled';
        }
        return !scope.editable ? 'muted' : 'ready';
      }

      function classForSolution(row, $index) {
        if (scope.response && scope.response.correctResponse) {
          var correctRow = _.find(scope.response.correctResponse, whereIdIsEqual(row.id));
          var answerRow = _.find(scope.matchModel.rows, whereIdIsEqual(row.id));
          if (correctRow && correctRow.matchSet[$index]) {
            return (isRadioButton(scope.inputType)) ?
              (answerRow.matchSet[$index].value ?
                'match-radiobutton correct checked' :
                'match-radiobutton correct') :
              (answerRow.matchSet[$index].value ?
                'match-checkbox correct checked' :
                'match-checkbox correct');
          } else {
            return (isRadioButton(scope.inputType) ?
              'match-radiobutton unknown' :
              'match-checkbox unknown');
          }
        }
        return '';
      }

      function onClickMatch(row, index) {
        if (scope.editable) {
          if (isRadioButton(scope.inputType)) {
            _.forEach(row.matchSet, function(match, i) {
              match.value = (i === index);
            });
          } else {
            row.matchSet[index].value = !row.matchSet[index].value;
          }
        }
      }

      function removeHtmlTags(html) {
        var node = $('<div>');
        node.html(html);
        return node.text();
      }

      function getState() {
        if (scope.matchModel && scope.matchModel.rows) {
          return scope.matchModel.rows;
        }
      }

      function revertState(state) {
        _.forEach(scope.matchModel.rows, function(row, i) {
          _.forEach(row.matchSet, function(match, j) {
            match.value = state[i].matchSet[j].value;
          });
        });
        renderMath();
      }

      function renderMath() {
        scope.$emit('rerender-math', {
          delay: 100,
          element: element[0]
        });
      }

      function isAnswerEmpty() {
        return 0 === this.getSession().numberOfAnswers;
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
        undoStartOver(),
        matchInteraction(),
        itemFeedbackPanel(),
        '</div>'
      ].join('\n');

      function undoStartOver() {
        return [
          '<div ng-show="editable" class="undo-start-over">',
          '  <span cs-undo-button-with-model></span>',
          '  <span cs-start-over-button-with-model></span>',
          '</div>',
          '<div class="clearfix"></div>'
        ].join('');
      }

      function matchInteraction() {
        return [
          '<div ng-class="{showToggle: response && response.correctness == \'incorrect\'}" icon-toggle icon-name="correct" class="icon-toggle-correct" ng-model="bridge.answerVisible" closed-label="Show Correct Answer" open-label="Show My Answer"></div>',
          '<table class="corespring-match-table" ng-class="layout">',
          '  <tr class="header-row">',
          '    <th ng-repeat="column in matchModel.columns"',
          '        ng-class="column.cssClass"',
          '        colspan="{{$index?1:2}}"',
          '        ng-bind-html-unsafe="column.labelHtml"/>',
          '  </tr>',
          '  <tr class="question-row"',
          '      ng-repeat="row in matchModel.rows"',
          '      question-id="{{row.id}}">',
          '    <td class="question-cell match-td-padded" ng-bind-html-unsafe="row.labelHtml"></td>',
          '    <td class="answer-expected-warning match-td-padded">',
          '      <div class="warning-holder" ng-if="row.answerExpected && !bridge.answerVisible">',
          '        <i class="fa fa-exclamation-triangle"></i>',
          '      </div>',
          '    </td>',
          '    <td class="answer-cell match-td-padded"',
          '        ng-class="{editable:editable}"',
          '        ng-repeat="match in row.matchSet">',
          '      <div ng-if="inputType == \'checkbox\'" choice-checkbox-button checkbox-button-state="{{stateForChoice(row, $index)}}" class="corespring-match-choice" ng-class="classForChoice(row, $index)" ng-click="onClickMatch(row, $index)" />',
          '      <div ng-if="inputType != \'checkbox\'" choice-radio-button radio-button-state="{{stateForChoice(row, $index)}}" class="corespring-match-choice" ng-class="classForChoice(row, $index)" ng-click="onClickMatch(row, $index)" />',
          '        <div class="background fa"></div>',
          '        <div class="foreground fa"></div>',
          '      </div>',
          '    </td>',
          '  </tr>',
          '</table>'
        ].join('');
      }

      function itemFeedbackPanel() {
        return [
          '<div feedback="response.feedback" icon-set="{{iconset}}" ',
          '   correct-class="{{response.correctClass}}"></div>'
        ].join('');
      }

    }
  }
];

exports.framework = 'angular';
exports.directive = main;