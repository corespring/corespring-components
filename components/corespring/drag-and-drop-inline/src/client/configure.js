var main = [
  "ChoiceTemplates", 'ServerLogic',
  function(ChoiceTemplates, ServerLogic) {
    var input, inputs, template;

    input = function(attrs, label) {
      return "<div style=\"margin-bottom: 20px\"> <input type=\"text\" class=\"form-control\" style=\"width: 80%; display: inline-block \"" + attrs + " />" + label + "</div>";
    };

    var inputHolder = function(header, body) {
      return [
        '<div class="input-holder">',
          ' <div class="header">' + header + '</div>',
        ' <div class="body">',
        body,
        ' </div>',
        '</div>'
      ].join("");
    };

    var choiceArea = [
      '  <div class="config-form-row">',
      '    <div class="col-sm-5">',
      '      <input type="text" class="form-control" ng-model="fullModel.model.config.choiceAreaLabel" placeholder="Enter choice area label or leave blank"/>',
      '    </div>',
      '  </div>',
      '  <div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice({
        correct: '',
        feedback: false,
        columnWidths: ["100px", "100px", "", "100px"]
      }),
      '    <div style="padding-left: 210px">',
      '      <input id="moveOnDrag{{$index}}" type="checkbox" ng-model="q.moveOnDrag" />',
      '      <label for="moveOnDrag{{$index}}">Remove tile after placing</label>',
      '    </div>',
      '  </div>',

      '<div class="clearfix"></div>',
      '<button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>',
      '<div class="config-form-row">',
      '  <div class="col-sm-8">',
      '    <input id="shuffle" type="checkbox" ng-model="fullModel.model.config.shuffle" />',
      '    <label for="shuffle" class="control-label">Shuffle Tiles</label>',
      '  </div>',
      '</div>'


    ].join("");

    var answerArea = [
      '<div class="well answer-area" ng-repeat="aa in model.answerAreas">',
      '  <div>Answer Blank {{($index+1)}}</div>',
      '     <form class="form-horizontal" role="form">',
      '       <div class="config-form-row">',
      '         <div class="col-sm-3">',
      '            Select Correct Answers',
      '         </div>',
      '         <div class="col-sm-6">',
      '           <select bootstrap-multiselect="{{componentState}}" class="answer-area-select form-control" multiple="true" ng-model="correctAnswers[aa.id]" ng-options="choiceToLetter(c) for c in model.choices">',
      '          </select>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-3">',
      '            Text Before (optional)',
      '         </div>',
      '         <div class="col-sm-6">',
      '            <input class="form-control" type="text" ng-model="aa.textBefore"/>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-3">',
      '            Text After (optional)',
      '         </div>',
      '         <div class="col-sm-6">',
      '            <input class="form-control" type="text" ng-model="aa.textAfter" />',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-8">',
      '            <input id="insertBr{{$index}}" type="checkbox" ng-model="aa.insertBr" />',
      '            <label for="insertBr{{$index}}">Insert Line Break</label>',
      '         </div>',
      '       </div>',
      '    </form>',
      '  <div><a ng-click="removeAnswerArea(aa)">Remove Answer Area</a></div>',
      '  <div></div>',
      '</div>',
      '<a ng-click="addAnswerArea()">Add Answer Area</a>'

    ].join("");

    var feedback = [
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="If correct, show"',
      '               fb-sel-class="correct"',
      '               fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '               fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '          ></div>',
      '        </div>',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="If partially correct, show"',
      '               fb-sel-class="partial"',
      '               fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '               fb-sel-default-feedback="{{defaultPartialFeedback}}"',
      '          ></div>',
      '        </div>',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="If incorrect, show"',
      '               fb-sel-class="incorrect"',
      '               fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '               fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '          ></div>',
      '        </div>'
    ].join("");

    var choiceAreaDisplayOptions = [
      '     <form class="form-horizontal" role="form">',
      '       <div class="config-form-row">',
      '         <div class="col-sm-5" ng-show="fullModel.model.config.choiceAreaHasLabel">',
      '           <input type="text" class="form-control" ng-model="fullModel.model.config.choiceAreaLabel" />',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">Layout',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-2 fixed-100">',
      '           <input id="vertical" type="radio" value="vertical" ng-model="fullModel.model.config.choiceAreaLayout" />',
      '           <label for="vertical" class="control-label">Vertical</label>',
      '         </div>',
      '         <div class="col-sm-2 fixed-120">',
      '           <input id="horizontal" type="radio" value="horizontal" ng-model="fullModel.model.config.choiceAreaLayout" />',
      '           <label for="horizontal" class="control-label">Horizontal</label>',
      '         </div>',
      '         <div class="col-sm-2 fixed-150">',
      '           <input id="tile" type="radio" value="tile" ng-model="fullModel.model.config.choiceAreaLayout" />',
      '           <label for="tile" class="control-label">Tile</label>',
      '         </div>',
      '       </div>',
      '     </form>'
    ].join('');

    var answerAreaDisplayOptions = [
      '<div class="config-form-row">',
      '    <label style="margin-right: 5px">Choice area is </label>',
      '    <select ng-model="fullModel.model.config.choiceAreaPosition" ng-options="c for c in [\'above\', \'below\']">',
      '    </select>',
      '    <label>answer blanks</label>',
      '</div>'
    ].join('');

    var displayOptions = [
      inputHolder('Choice Area', choiceAreaDisplayOptions),
      inputHolder('', answerAreaDisplayOptions)

    ].join("");

    template = [
      '<div class="drag-and-drop-config-panel" choice-template-controller="">',
      '  <div navigator="">',
      '    <div navigator-panel="Design">',
      inputHolder('Choices', choiceArea),
      inputHolder('Answer Blanks', answerArea),
      inputHolder('Feedback', feedback),
      '    </div>',

      '    <div navigator-panel="Scoring">',
      '      <div>',
      ChoiceTemplates.wrap(undefined, ChoiceTemplates.scoring({maxNumberOfPartialScores: "sumCorrectResponses() - 1"})),
      '      </div>',
      '    </div>',

      '    <div navigator-panel="Display">',
      '      <div>',
      displayOptions,
      '      </div>',
      '    </div>',


      '  </div>',
      '</div>'].join('\n');

    return {
      restrict: "E",
      scope: "isolate",
      template: template,
      replace: true,
      link: function($scope, element, attrs) {

        var server = ServerLogic.load('corespring-drag-and-drop-inline');
        $scope.defaultCorrectFeedback = server.DEFAULT_CORRECT_FEEDBACK;
        $scope.defaultPartialFeedback = server.DEFAULT_PARTIAL_FEEDBACK;
        $scope.defaultIncorrectFeedback = server.DEFAULT_INCORRECT_FEEDBACK;

        $scope.correctAnswers = {};
        $scope.correctMap = {};

        $scope.choiceToLetter = function(c) {
          var idx = $scope.model.choices.indexOf(c);
          return $scope.toChar(idx);
        };

        $scope.toChar = function(num) {
          return String.fromCharCode(65 + num);
        };

        $scope.sumCorrectResponses = function() {
          return _.reduce($scope.correctAnswers, function(memo, ca) {
            return ca.length + memo;
          }, 0);
        };

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;

            var choiceById = function(cid) {
              return _.find(model.model.choices, function(c) {
                return c.id === cid;
              });
            };

            _.each(model.correctResponse, function(val, key) {
              if (key === 'cat_1') {
                _.each(val, function(cid) {
                  $scope.correctMap[cid] = true;
                });
              }
              $scope.correctAnswers[key] = _.map(val, function(choiceId) {
                return choiceById(choiceId);
              });
            });

            $scope.componentState = "initialized";
            console.log(model);
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          },

          getAnswer: function() {
            console.log("returning answer for: Drag and drop");
            return {};
          }
        };

        $scope.$watch('correctMap', function(n) {
          if (n) {
            var res = [];
            for (var key in $scope.correctMap) {
              if ($scope.correctMap[key]) {
                res.push(key);
              }
            }
            $scope.fullModel.correctResponse.cat_1 = res;
          }
        }, true);

        $scope.$watch('correctAnswers', function(n) {
          if (n) {
            _.each($scope.correctAnswers, function(val, key) {
              if (key !== 'cat_1') {
                $scope.fullModel.correctResponse[key] = _.pluck(val, 'id');
              }
            });
          }
        }, true);

        $scope.$emit('registerConfigPanel', attrs.id, $scope.containerBridge);

        $scope.removeQuestion = function(c) {
          $scope.model.choices = _.filter($scope.model.choices, function(existing) {
            return existing !== c;
          });
        };

        $scope.addChoice = function() {
          $scope.model.choices.push({
            id: "choice_" + $scope.model.choices.length,
            labelType: "text",
            label: "",
            moveOnDrag: true
          });
        };

        $scope.removeAnswerArea = function(answerArea) {
          $scope.model.answerAreas = _.filter($scope.model.answerAreas, function(existing) {
            return existing !== answerArea;
          });
          delete $scope.correctAnswers[answerArea.id];
          delete $scope.fullModel.correctResponse[answerArea.id];

        };

        $scope.addAnswerArea = function() {
          var idx = $scope.model.answerAreas.length + 1;
          $scope.model.answerAreas.push({
            id: "aa_" + idx,
            textBefore: "",
            textAfter: ""
          });
        };

      }
    };
  }
];

var bootstrapMultiselect = [
  '$log',
  function($log) {
    return {
      link: function(scope, element, attrs) {
        attrs.$observe('bootstrapMultiselect', function(n) {
          if (n === 'initialized') {
            $(element).multiselect();
          }
        });
      }
    };

  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: 'bootstrapMultiselect',
    directive: bootstrapMultiselect
  }

];
