var main = [
  'ChoiceTemplates',
  'ServerLogic',
  'MathJaxService',
  'ComponentImageService',
  function(ChoiceTemplates,
           ServerLogic,
           MathJaxService,
           ComponentImageService) {
    var input, inputs, template;

    input = function(attrs, label) {
      return "<div style=\"margin-bottom: 20px\"> <input type=\"text\" class=\"form-control\" style=\"width: 80%; display: inline-block \"" + attrs + " />" + label + "</div>";
    };

    var categories = [
      '  <div class="category-row" ng-repeat="cat in model.categories">',
      '   <span class="category-remove-button" ng-click="removeCategory(cat)">',
      '     <i class="fa fa-times-circle"></i>',
      '   </span>',
      '    <input type="text" class="form-control" ng-model="cat.label" placeholder="Enter category label" />',
      '  </div>',

      '<div class="clearfix"></div>',
      '  <button class=\"btn\" ng-click=\"addCategory()\">Add category</button>'

    ].join("");

    var choiceArea = [
      '  <div class="config-form-row">',
      '    <div class="col-sm-8">',
      '      <input type="text" class="form-control" ng-model="fullModel.model.config.choiceAreaLabel" placeholder="Enter choice area label or leave blank" />',
      '    </div>',
      '  </div>',

      '  <div class="pull-right select-correct-answers">Select Correct Categories</div>',
      '  <div class="choice" ng-repeat="q in model.choices">',
      ChoiceTemplates.choice({
        correct: '<select bootstrap-multiselect="{{componentState}}" multiple="true" ng-model="correctMap[q.id]" ng-options="c.label for c in model.categories"></select>',
        feedback: false,
        columnWidths: ["100px", "100%", "", "100px"]
      }),
      '    <div style="padding-left: 210px">',
      '      <input id="moveOnDrag{{$index}}" type="checkbox" ng-model="q.moveOnDrag" />',
      '      <label for="moveOnDrag{{$index}}">Remove tile after placing</label>',
      '    </div>',
      '  </div>',

      '<div class="clearfix"></div>',
      '<button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>',
      '<div style="margin-top: 10px" class="config-form-row">',
      '  <div class="col-sm-8">',
      '    <input id="shuffle" type="checkbox" ng-model="fullModel.model.config.shuffle" />',
      '    <label for="shuffle" class="control-label">Shuffle Tiles</label>',
      '  </div>',
      '</div>'


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
      '       <div class="config-form-row" ng-show="fullModel.model.config.choiceAreaLayout == \'tile\'">',
      '         <div class="col-sm-3">',
      '           <label for="itemsPerRow" class="control-label">Items Per Row</label>',
      '         </div>',
      '         <div class="col-sm-3">',
      '           <input id="itemsPerRow" type="text" class="form-control" ng-model="fullModel.model.config.itemsPerRow" />',
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
      '  {{area.label}}',
      '  <form class="form-horizontal" role="form">',
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
      ChoiceTemplates.inputHolder('Choice Area', choiceAreaDisplayOptions),
      ChoiceTemplates.inputHolder('Answer Areas', answerAreaDisplayOptions)

    ].join("");

    template = [
      '<div class="drag-and-drop-config-panel" choice-template-controller="">',
      '  <div navigator="">',
      '    <div navigator-panel="Design">',
      '      <div class="description">',
      '      In Categorize, students may drag & drop answer tiles to the appropriate category area(s).',
      '      </div>',
      ChoiceTemplates.inputHolder('Categories', categories),
      ChoiceTemplates.inputHolder('Choices', choiceArea),
      ChoiceTemplates.inputHolder('Feedback', feedback),
      '    </div>',

      '    <div navigator-panel="Scoring">',
      '      <div>',
      ChoiceTemplates.scoring({maxNumberOfPartialScores: "sumCorrectResponses() - 1"}),
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
      controller: ['$scope',
        function($scope) {
          $scope.imageService = function() {
            return ComponentImageService;
          };
        }
      ],
      replace: true,
      link: function($scope, $element, $attrs) {

        ChoiceTemplates.extendScope($scope);

        var server = ServerLogic.load('corespring-drag-and-drop-categorize');
        $scope.defaultCorrectFeedback = server.DEFAULT_CORRECT_FEEDBACK;
        $scope.defaultPartialFeedback = server.DEFAULT_PARTIAL_FEEDBACK;
        $scope.defaultIncorrectFeedback = server.DEFAULT_INCORRECT_FEEDBACK;

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

            var categoryById = function(cid) {
              return _.find(model.model.categories, function(c) {
                return c.id === cid;
              });
            };

            $scope.correctMap = {};
            console.log("Correct repsonse is ", model.correctResponse);
            _.each(model.correctResponse, function(val, catId) {
              _.each(val, function(cr) {
                $scope.correctMap[cr] = $scope.correctMap[cr] || [];
                $scope.correctMap[cr].push(categoryById(catId));
              });
            });
            console.log("Correct map  is ", $scope.correctMap);

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
            var res = {};
            _.each(n, function(correctCategories, choiceId) {
              _.each(correctCategories, function(category) {
                res[category.id] = res[category.id] || [];
                res[category.id].push(choiceId);
              });
            });
            $scope.fullModel.correctResponse = res;
          }
        }, true);

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);

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
            moveOnDrag: false
          });
        };

        $scope.removeCategory = function(category) {
          $scope.model.categories = _.filter($scope.model.categories, function(existing) {
            return existing !== category;
          });
          _.each($scope.correctMap, function(val, key) {
            $scope.correctMap[key] = _.filter(val, function(cat) {
              return cat.id !== category.id;
            });
          });
          delete $scope.fullModel.correctResponse[category.id];

        };

        $scope.$watch('model', function() {
          MathJaxService.parseDomForMath(0);
        }, true);

        $scope.addCategory = function() {
          var idx = $scope.model.categories.length + 1;
          $scope.model.categories.push({
            id: "cat_" + idx,
            hasLabel: true,
            label: "Category " + idx,
            layout: "vertical"
          });
        };
        $scope.leftPanelClosed = false;
      }
  };
  }
];

var bootstrapMultiselect = [
  '$log',
  function($log) {
    return {
      scope: true,
      link: function(scope, element, attrs) {
        var rebuild = function() {
          $(element).multiselect('setOptions', {
            numberDisplayed: 1
          });
          $(element).multiselect('rebuild');
        };
        attrs.$observe('bootstrapMultiselect', function(n) {
          if (n === 'initialized') {
            rebuild();
          }
        });
        var n = attrs.ngOptions;
        if (n) {
          var model = n.split("in ")[1];
          scope.$watch(model, function(n) {
            rebuild();
          }, true);
        }
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
