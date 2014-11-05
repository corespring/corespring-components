var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {

      scope.editable = true;
      scope.isSummaryFeedbackOpen = false;
      scope.isFeedbackOpen = false;

      var YES_NO = 'YES_NO';
      var TRUE_FALSE = 'TRUE_FALSE';
      var MULTIPLE = 'MULTIPLE';
      var INPUT_TYPE_RADIOBUTTON = 'radiobutton';
      var INPUT_TYPE_CHECKBOX = 'checkbox';
      var INPUT_TYPE_DEFAULT = INPUT_TYPE_RADIOBUTTON;
      var TRUE_LABEL = "True";
      var FALSE_LABEL = "False";
      var YES_LABEL = "Yes";
      var NO_LABEL = "No";
      var UNKNOWN = "unknown";
      var CORRECT = "correct";
      var INCORRECT = "incorrect";
      var ALL_CORRECT = "all_correct";
      var SOME_CORRECT = "some_correct";
      var ALL_INCORRECT = "all_incorrect";

      function updateInputType(model){
        if (!model || !model.answerType){
          scope.inputType = INPUT_TYPE_DEFAULT;
        }
        else if (model.answerType === YES_NO || model.answerType === TRUE_FALSE){
          scope.inputType = INPUT_TYPE_RADIOBUTTON;
        }
        else if (model.answerType === MULTIPLE){
          scope.inputType = INPUT_TYPE_CHECKBOX;
        }
        else{
          scope.inputType = INPUT_TYPE_DEFAULT;
        }
      }

      function whereIdIsEqual(id){
        return function(match){
          return match.id === id;
        }};


      function getAnswers(){
         var result = scope.matchModel.rows.map(function(row){
          return {
            "id" : row.id,
            "matchSet" : row.matchSet.map(function(match){
              return match.value;
            })
          };
        });

        return result;
      }

      function prepareModel(rawModel, session){

        var answerType = rawModel.answerType || TRUE_FALSE;

        function prepareColumns(){
          if (answerType === YES_NO || answerType === TRUE_FALSE) {
            if (rawModel.columns.length !== 3){
              $log.error('Match interaction with boolean answer type should have 2 columns, found ' + rawModel.columns.length);
            }
            return [  _.cloneDeep(rawModel.columns[0]),
                      { "labelHtml": answerType === TRUE_FALSE ? TRUE_LABEL : YES_LABEL},
                      { "labelHtml": answerType === TRUE_FALSE ? FALSE_LABEL : NO_LABEL } ];
          }

          return _.cloneDeep(rawModel.columns);
        }

        var answersExist = (session && session.answers);

        function prepareRows(){
          return rawModel.rows.map(function(row){
            var cloneRow = _.cloneDeep(row);

            cloneRow.matchSet = answersExist ?
              _.find(session.answers, whereIdIsEqual(row.id)).matchSet.map(function(match){
                return { "value": match }
              }) :
              _.range(rawModel.columns.length - 1).map(function(){
                return { "value": false };
              });

            return cloneRow;
          });
        }

        //var selectionRows = (session && session.answers) ? session.answers : rawModel.rows

        return {
          "columns" : prepareColumns(),
          "rows" : prepareRows(),
          "answerType" : answerType
        };
      }

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          scope.session = dataAndSession.session ;
          scope.data = dataAndSession.data;
          scope.matchModel = prepareModel(dataAndSession.data.model , scope.session);
          updateInputType(scope.matchModel);
          scope.$emit('rerender-math', {delay: 100});
        },

        getSession: function() {
          return { answers: getAnswers() };
        },

        // sets the server's response
        setResponse: function(response) {
          scope.response = response;
          if (response.feedback) {
            _.each(response.feedback.correctnessMatrix, function(correctnessRow) {
              var modelRow = _.find(scope.matchModel.rows, whereIdIsEqual(correctnessRow.id));
              if (modelRow !== null) {
                for(var i=0;i<modelRow.matchSet.length;i++){
                  modelRow.matchSet[i].correct = correctnessRow.matchSet[i].correctness;
                }
              }
            });
          }
        },
        setMode: function(newMode) {},
        /**
         * Reset the ui back to an unanswered state
         */
        reset: function() {
          scope.session = {};
          scope.matchModel = prepareModel(scope.data.model , {});
          scope.isSummaryFeedbackOpen = false;
          scope.isFeedbackOpen = false;
          delete scope.response;
        },
        resetStash: function() {
          //scope.session.stash = {};
        },
        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },
        answerChangedHandler: function(callback) {
          scope.$watch("answer", function(newValue, oldValue) {
            if (newValue !== oldValue) {
              callback();
            }
          }, true);
        },
        editable: function(e) {
          scope.editable = e;
        }
      };

      scope.showSeeCorrectAnswerLink = function(feedback){
        return (feedback && feedback.correctness && feedback.correctness !== ALL_CORRECT);
      };

      scope.getCorrectness = function(correct){
        return !correct ? UNKNOWN : correct;
      };

      scope.onClickMatch = function(matchSet,index){
        if(scope.editable && !matchSet[index].correct ) {
          if (scope.inputType === INPUT_TYPE_RADIOBUTTON) {
            for (var i =0 ;i < matchSet.length; i++){
              matchSet[i].value = (i === index);
            }
          }
        }
      };

      scope.seeCorrectAnswer =function(){
        _.each(scope.data.correctResponse, function(correctRow) {
          var modelRow = _.find(scope.matchModel.rows, whereIdIsEqual(correctRow.id));
          for(var i=0; i<modelRow.matchSet.length; i++){
            if (correctRow.matchSet[i]){
              modelRow.matchSet[i].value = true;
              modelRow.matchSet[i].correct = CORRECT ;
            }
          }
        });
      };

      scope.isCheckBox = function(inputType){
        return inputType === 'checkbox';
      };

      scope.isRadioButton = function(inputType){
        return inputType === 'radiobutton';
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };

    def = {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: [
        '<div class="view-match">',
        '   <table class="table">',
        '     <tr>',
        '       <th class="answer-header" ng-repeat="column in matchModel.columns" ng-bind-html-unsafe="column.labelHtml"/>',
        '     </tr>',
        '     <tr class="question-row" ng-repeat="row in matchModel.rows">',
        '       <td class="question-cell" ng-bind-html-unsafe="row.labelHtml" ng-switch="inputType"></td>',
        '       <td class="answer-cell" ng-repeat="match in row.matchSet track by $index">',
        '           <checkbox ng-if="isCheckBox(inputType)" ng-disabled="!editable" ng-model="match.value" ',
        '                     ng-value="true" ng-change="onClickMatch(row.matchSet ,$index)"',
        '                     ng-class="{correct:\'correct\', incorrect:\'incorrect\', unknown:\'unknown\'}[getCorrectness(match.correct)]"></checkbox>',
        '           <radio ng-if="isRadioButton(inputType)" ng-disabled="!editable" ng-model="match.value" ',
        '                   ng-value="true" ng-change="onClickMatch(row.matchSet ,$index)"',
        '                   ng-class="{correct:\'correct\', incorrect:\'incorrect\', unknown:\'unknown\'}[getCorrectness(match.correct)]"></radio>',
        '       </td>',
        '     </tr>',
        '   </table>',

        '   <div class="panel feedback {{response.correctness}}" ng-if="response.feedback.summary">',
        '    <div class="panel-heading" ng-click="isFeedbackOpen=!isFeedbackOpen">',
        '     <span class="toggle" ng-click="isFeedbackOpen=!isFeedbackOpen" ng-class="{false:\'fa-plus-circle\', true:\'fa-minus-circle\'}[isFeedbackOpen]"></span>',
        '     <span class="label">Feedback</span>',
        '    </div>',
        '    <div class="panel-body" ng-show="isFeedbackOpen">',
        '    {{response.feedback.summary}}',
        '   </div>',
        '   </div>',


        '   <div class="panel summary-feedback" ng-if="response.summaryFeedback">',
        '    <div class="panel-heading" ng-click="isSummaryFeedbackOpen=!isSummaryFeedbackOpen">',
        '     <span class="toggle fa-lightbulb-o" ></span>',
        '     <span class="label">Summary feedback</span>',
        '    </div>',
        '    <div class="panel-body" ng-show="isSummaryFeedbackOpen">',
        '    {{response.summaryFeedback}}',
        '   </div>',
        '   </div>',

        '<a ng-show="showSeeCorrectAnswerLink(response)" href ng-click="seeCorrectAnswer()">See correct answer</a>',

        '</div>'
      ].join("\n")

    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
