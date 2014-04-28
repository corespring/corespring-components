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
      '  <div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice({feedback: false, correct: ''}),
      '  </div>',

        '<div class="clearfix"></div>',
        '  <button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>'

        ].join("");

    var answerArea = [
        '<div class="answer-area" ng-repeat="category in model.categories">',
        '  <div>Correct tiles for {{$first ? "Default Answer Area" :"Answer Area "+($index+1)}}</div>',
        '  <select class="answer-area-select" multiple="true" ng-model="correctAnswers[category.id]" ng-options="choiceToLetter(c) for c in model.choices"></select>',
        '  <div><a href="#" ng-hide="$first" ng-click="removeCategory(category)">Remove Answer Area</a></div>',
        '</div>',
        '<a ng-click="addCategory()">Add Answer Area</a>'

      ].join("");

    var feedback = [
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="Correct"',
      '               fb-sel-class="correct"',
      '               fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '               fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '          ></div>',
      '        </div>',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="Partial"',
      '               fb-sel-class="correct"',
      '               fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '               fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '               fb-sel-default-feedback="{{defaultPartialFeedback}}"',
      '          ></div>',
      '        </div>',
      '        <div class="well">',
      '          <div feedback-selector',
      '               fb-sel-label="Incorrect"',
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
      '         <div class="col-sm-4">',
      '           <input id="includeLabel" type="checkbox" ng-model="fullModel.model.config.choiceAreaHasLabel" />',
      '           <label for="includeLabel" class="control-label">Include a label</label>',
      '         </div>',
      '         <div class="col-sm-5" ng-show="fullModel.model.config.choiceAreaHasLabel">',
      '           <input type="text" class="form-control" ng-model="fullModel.model.config.choiceAreaLabel" />',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">Layout',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-3">',
      '           <input id="vertical" type="radio" value="vertical" ng-model="fullModel.model.config.choiceAreaLayout" />',
      '           <label for="vertical" class="control-label">Vertical</label>',
      '         </div>',
      '         <div class="col-sm-3">',
      '           <input id="horizontal" type="radio" value="horizontal" ng-model="fullModel.model.config.choiceAreaLayout" />',
      '           <label for="horizontal" class="control-label">Horizontal</label>',
      '         </div>',
      '         <div class="col-sm-3">',
      '           <input id="tile" type="radio" value="tile" ng-model="fullModel.model.config.choiceAreaLayout" />',
      '           <label for="tile" class="control-label">Tile</label>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-8">',
      '           <input id="shuffle" type="checkbox" ng-model="fullModel.model.config.shuffle" />',
      '           <label for="shuffle" class="control-label">Shuffle Tiles</label>',
      '         </div>',
      '       </div>',
      '       <div class="config-form-row">',
      '         <div class="col-sm-8">',
      '           <input id="removetiles" type="checkbox" ng-model="fullModel.model.config.removeTilesOnDrop" />',
      '           <label for="removetiles" class="control-label">Remove tiles when selected</label>',
      '         </div>',
      '       </div>',


      '     </form>'
    ].join('');

    var answerAreaDisplayOptions = [
      '<div class="config-form-row">',
      '  <div class="col-sm-4">',
      '    <label>Answer area is </label>',
      '  </div>',
      '  <div class="col-sm-3">',
      '    <input id="above" type="radio" value="above" ng-model="fullModel.model.config.answerAreaPosition" />',
      '    <label for="above" class="control-label">above</label>',
      '  </div>',
      '  <div class="col-sm-3">',
      '    <input id="below" type="radio" value="below" ng-model="fullModel.model.config.answerAreaPosition" />',
      '    <label for="below" class="control-label">below</label>',
      '  </div>',
      '  <div class="col-sm-2">',
      '    <label>choices</label>',
      '  </div>',
      '</div>',

      '<div ng-repeat="area in model.categories">',
      '  <div class="well">',
      '  {{$first ? \'Default\' : \'\'}} Answer area {{$first ? \'\' : \'#\'+($index+1)}}',
      '  <form class="form-horizontal" role="form">',
      '    <div class="config-form-row">',
      '      <div class="col-sm-4">',
      '        <input id="includeLabelAnswerArea{{$index}}" type="checkbox" ng-model="area.hasLabel" />',
      '        <label for="includeLabelAnswerArea{{$index}}" class="control-label">Include a label</label>',
      '      </div>',
      '      <div class="col-sm-5" ng-show="area.hasLabel">',
      '        <input type="text" class="form-control" ng-model="area.label" />',
      '      </div>',
      '    </div>',

      '    <div class="config-form-row">',
      '      <div class="col-sm-5"><label>Answer Area Display</label></div>',
      '    </div>',
      '    <div class="config-form-row">',
      '      <div class="col-sm-4">',
      '        <input id="vertical{{$index}}" type="radio" value="vertical" ng-model="area.layout" />',
      '        <label for="vertical{{$index}}" class="control-label">Vertical</label>',
      '      </div>',
      '      <div class="col-sm-4">',
      '        <input id="horizontal{{$index}}" type="radio" value="horizontal" ng-model="area.layout" />',
      '        <label for="horizontal{{$index}}" class="control-label">Horizontal</label>',
      '      </div>',
      '    </div>',
      '  </form>',
      '  </div>',
      '</div>'
    ].join('');

    var displayOptions = [
      inputHolder('Choice Area', choiceAreaDisplayOptions),
      inputHolder('Answer Areas', answerAreaDisplayOptions)

    ].join("");

    template = [
      '<div class="drag-and-drop-config-panel" choice-template-controller="">',
      '  <div navigator="">',
      '    <div navigator-panel="Design">',
      inputHolder('Choices', choiceArea),
      inputHolder('Answer Areas', answerArea),
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

        var server = ServerLogic.load('corespring-drag-and-drop-categorize');
        $scope.defaultCorrectFeedback = server.DEFAULT_CORRECT_FEEDBACK;
        $scope.defaultPartialFeedback = server.DEFAULT_PARTIAL_FEEDBACK;
        $scope.defaultIncorrectFeedback = server.DEFAULT_INCORRECT_FEEDBACK;

        $scope.correctAnswers = {};

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
               $scope.correctAnswers[key] = _.map(val, function(choiceId) {
                  return choiceById(choiceId);
               });
            });
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

        $scope.$watch('correctAnswers', function(n) {
          if (n) {
            $scope.fullModel.correctResponse = _.cloneDeep($scope.correctAnswers);
            _.each($scope.fullModel.correctResponse, function(val, key) {
              $scope.fullModel.correctResponse[key] = _.pluck(val, 'id');
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
            label: ""
          });
        };

        $scope.removeCategory = function(category) {
          $scope.model.categories = _.filter($scope.model.categories, function(existing) {
            return existing !== category;
          });
        };

        $scope.addCategory = function() {
          var idx = $scope.model.categories.length + 1;
          $scope.model.categories.push({
            id: "cat_"+idx,
            label: "Category "+idx,
            layout: "vertical"
          });
        };

      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
