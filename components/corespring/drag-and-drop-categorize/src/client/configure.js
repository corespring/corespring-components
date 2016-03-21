var main = [
  'ChoiceTemplates',
  'MathJaxService',
  'ComponentImageService',
  function(ChoiceTemplates,
    MathJaxService,
    ComponentImageService) {

    var displayPanel = [
      '<form class="form-horizontal" role="form">',
      '  <div class="container-fluid">',
      '    <div class="row"><div class="col-xs-12"><label class="control-label">Choice Area</label></div></div>',
      '    <div class="row choice-area-row">',
      '      <div class="col-xs-12">',
      '        <div class="container-fluid">',
      '          <div class="row"><div class="col-xs-12"><label class="control-label">Layout</label></div></div>',
      '          <div class="row">',
      '            <div class="col-xs-2">',
      '              <radio value="vertical" ng-model="model.config.choiceAreaLayout">Vertical</radio>',
      '            </div>',
      '            <div class="col-xs-2">',
      '              <radio value="horizontal" ng-model="model.config.choiceAreaLayout">Horizontal</radio>',
      '            </div>',
      '            <div class="col-xs-2">',
      '              <radio value="tile" ng-model="model.config.choiceAreaLayout">Tile</radio>',
      '            </div>',
      '          </div>',
      '          <div class="row" ng-show="model.config.choiceAreaLayout == \'tile\'">',
      '            <div class="col-xs-offset-4 col-xs-2">',
      '              <label class="control-label">Items Per Row</label>',
      '            </div>',
      '            <div class="col-xs-2">',
      '              <input type="text" class="form-control" ng-model="model.config.itemsPerRow" />',
      '            </div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="row"><div class="col-xs-12"><label class="control-label">Answers Area</label></div></div>',
      '    <div class="row answer-area-row">',
      '      <div class="col-xs-12">',
      '        <div class="container-fluid">',
      '          <div class="row answer-area-position-row">',
      '            <div class="col-xs-12">',
      '              Answer area is',
      '              <select ng-model="model.config.answerAreaPosition" class="form-control">',
      '                <option value="above">above</option>',
      '                <option value="below">below</option>',
      '              </select>',
      '              choices.',
      '            </div>',
      '          </div>',
      '          <div class="row answer-area-category-row" ng-repeat="category in model.categories">',
      '            <div class="col-xs-12">',
      '              <div class="well">',
      '                <div class="container-fluid">',
      '                  <div class="row">',
      '                    <label class="control-label">{{category.label}}</label>',
      '                  </div>',
      '                  <div class="row">',
      '                    <div class="col-xs-2">',
      '                      <radio value="vertical" ng-model="area.layout">Vertical</radio>',
      '                    </div>',
      '                    <div class="col-xs-2">',
      '                      <radio value="horizontal" ng-model="area.layout">Horizontal</radio>',
      '                    </div>',
      '                  </div>',
      '                </div>',
      '              </div>',
      '            </div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</form>'
    ].join("");

    var designPanel = [
      '<div class="container-fluid">',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <p>In Categorize, students may drag & drop answer tiles to the appropriate category area(s).</p>',
      '    </div>',
      '  </div>',
      '  <div class="row"><div class="col-xs-12"><label class="control-label">Categories</label></div></div>',
      '  <div class="row categorize-category-row" ng-repeat="category in model.categories">',
      '    <div class="col-xs-1 text-center">',
      '      <i class="fa fa-trash-o fa-lg" title="Delete" data-tggle="tooltip" ng-click="removeCategory(category)">',
      '      </i>',
      '    </div>',
      '    <div class="col-xs-8 text-center">',
      '      <input type=text" class="form-control" ng-model="category.label" placeholder="Enter category label"/>',
      '    </div>',
      '  </div>',
      '  <div class="row add-category-row">',
      '    <div class="col-xs-offset-1 col-xs-11">',
      '      <button type="button" id="add-choice" class="btn btn-default" ',
      '              ng-click="addCategory()">Add a Category</button>',
      '    </div>',
      '  </div>',
      '  <div class="row"> <div class="col-xs-12"><label class="control-label">Choices</label></div></div>',
      '  <div class="row">',
      '    <div class="col-xs-9">',
      '      <input type="text" class="form-control" ng-model="model.config.choiceAreaLabel" ',
      '        placeholder="Enter choice area label or leave blank"/>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-offset-9 col-md-offset-9 col-md-3 col-xs-3 text-center choice-header-row">',
      '      <label class="control-label">Select Correct Categories</label>',
      '    </div>',
      '  </div>',
      '  <div class="choice-row-group" ng-repeat="choice in model.choices">',
      '    <div class="row choice-row">',
      '      <div class="col-md-2 col-xs-3 text-center choice-letter">',
      '        <i class="fa fa-trash-o fa-lg" title="Delete" data-toggle="tooltip"',
      '            ng-click="removeChoice(choice)"></i>',
      '      </div>',
      '      <div class="col-md-7 col-xs-6">',
      '        <div mini-wiggi-wiz="" ng-model="choice.label" placeholder="Enter a choice"',
      '            features="extraFeatures" feature-overrides="overrideFeatures"',
      '            parent-selector=".modal-body">',
      '          <edit-pane-toolbar alignment="bottom">',
      '            <div class="btn-group pull-right">',
      '              <button ng-click="closePane()" class="btn btn-sm btn-success" style="float:right;">Done</button>',
      '            </div>',
      '          </edit-pane-toolbar>',
      '        </div>',
      '      </div>',
      '      <div class="col-md-3 col-xs-3 text-center">',
      '        <select bootstrap-multiselect="{{componentState}}" multiple="multiple" ng-model="correctMap[choice.id]" ',
      '            ng-options="c.label for c in model.categories"></select>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-offset-3 col-md-offset-2 col-xs-9 col-md-10">',
      '        <checkbox ng-model="choice.moveOnDrag">Remove tile after placing</checkbox>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="row add-choice-row">',
      '    <div class="col-xs-12">',
      '      <button type="button" class="btn btn-default" ',
      '          ng-click="addChoice()"><i class="fa fa-plus"></i>  Add a Choice</button>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <checkbox ng-model="model.config.shuffle" class="control-label">Shuffle Tiles</checkbox>',
      '    </div>',
      '  </div>',
      '  <div class="row feedback-row">',
      '    <div class="col-xs-12">',
      '      <div feedback-panel>',
      '        <div feedback-selector',
      '            fb-sel-label="If correct, show"',
      '            fb-sel-class="correct"',
      '            fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '            fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '            fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '        </div>',
      '        <div feedback-selector',
      '            fb-sel-label="If partially correct, show"',
      '            fb-sel-class="partial"',
      '            fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '            fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '            fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '        </div>',
      '        <div feedback-selector',
      '            fb-sel-label="If incorrect, show"',
      '            fb-sel-class="incorrect"',
      '            fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '            fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '            fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'

    ].join('\n');

    return {
      restrict: "E",
      scope: {},
      template: [
        '<div class="drag-and-drop-config-panel drag-and-drop-categorize-config-panel" choice-template-controller="">',
        '  <div navigator-panel="Design">',
        designPanel,
        '  </div>',
        '  <div navigator-panel="Scoring">',
        '    <div class="container-fluid">',
        '      <div class="row">',
        '        <div class="col-xs-12">',
        ChoiceTemplates.scoring(),
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div navigator-panel="Display">',
        displayPanel,
        '  </div>',
        '</div>'].join('\n'),
      controller: ['$scope',
        function($scope) {
        }
      ],
      replace: true,
      link: function($scope, $element, $attrs) {

        ChoiceTemplates.extendScope($scope, 'corespring-drag-and-drop-categorize');

        $scope.correctMap = {};

        $scope.choiceToLetter = function(c) {
          var idx = $scope.model.choices.indexOf(c);
          return $scope.toChar(idx);
        };

        function sumCorrectResponses() {
          return _.reduce($scope.correctMap, function(memo, ca) {
            return ca.length + memo;
          }, 0);
        }

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;

            function categoryById(cid) {
              return _.find(model.model.categories, function(c) {
                return c.id === cid;
              });
            }

            $scope.correctMap = {};
            _.each(model.correctResponse, function(val, catId) {
              _.each(val, function(cr) {
                $scope.correctMap[cr] = $scope.correctMap[cr] || [];
                $scope.correctMap[cr].push(categoryById(catId));
              });
            });

            $scope.updateNumberOfCorrectResponses(sumCorrectResponses());

            $scope.componentState = "initialized";
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          },

          getAnswer: function() {
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
            $scope.updateNumberOfCorrectResponses(sumCorrectResponses());
          }
        }, true);

        $scope.removeChoice = function(c) {
          $scope.model.choices = _.filter($scope.model.choices, function(existing) {
            return existing !== c;
          });
          delete $scope.correctMap[c.id];
        };

        function findFreeChoiceSlot() {
          var slot = 0;
          var usedSlots = _.pluck($scope.model.choices, 'id');
          while (_.contains(usedSlots, "choice_" + slot)) {
            slot++;
          }
          return slot;
        }

        $scope.addChoice = function() {
          $scope.model.choices.push({
            id: "choice_" + findFreeChoiceSlot(),
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
          MathJaxService.parseDomForMath(0); //TODO on every model change?
        }, true);

        function findFreeCategorySlot() {
          var slot = 1; //categories start at 1
          var usedSlots = _.pluck($scope.model.categories, 'id');
          while (_.contains(usedSlots, "cat_" + slot)) {
            slot++;
          }
          return slot;
        }

        $scope.addCategory = function() {
          var idx = findFreeCategorySlot();
          $scope.model.categories.push({
            id: "cat_" + idx,
            hasLabel: true,
            label: "Category " + idx,
            layout: "vertical"
          });
        };

        $scope.leftPanelClosed = false;
        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
      }
    };
  }
];


exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
