var main = [
    'ChoiceTemplates',
    'MathJaxService',
    'ComponentImageService',
    function(ChoiceTemplates, MathJaxService, ComponentImageService) {

    return {
      restrict: "E",
      scope: "isolate",
      template: template(),
      replace: true,
      link: function($scope, $element, $attrs) {

        function getOrNull(host, path) {
          if (!host) {
            return null;
          }
          var object = host;
          var args = path.split('.');
          do {
            var propName = args.shift();
            object = (propName && (propName in object)) ? object[propName] : null;
          } while (object && args.length > 0);
          return object;
        }

        $scope.imageService = ComponentImageService;

        $scope.choiceToLetter = function(c) {
          var idx = $scope.model.choices.indexOf(c);
          return $scope.toChar(idx);
        };

        $scope.canAddScenarios = function(category) {
          if (!category || !category.choices || category.choices.length === 0) {
            return false;
          }
          var scenarios = getOrNull(category, "scoring.partial.scenarios");
          return category.choices.length === 0 || scenarios && scenarios.length >= category.choices.length;
        };

        function byId(id) {
          return function(object) {
            return object.id === id;
          };
        }

        function byModelId(id) {
          return function(object) {
            return object.model.id === id;
          };
        }

        function all() {
          return true;
        }

        function wrapCategoryModel(categoryModel) {
          return {
            model: categoryModel,
            choices: []
          };
        }

        $scope.removeScoringScenario = function(categoryId, scenario) {
          var category = _.find($scope.categories, byModelId(categoryId));
          if (category) {
            _.remove(category.scoring.partial.scenarios, function(sc) {
              return sc === scenario;
            });
          }
        };

        $scope.addScoringScenario = function(categoryId) {
          var category = _.find($scope.categories, byModelId(categoryId));
          if (category) {
            category.scoring = category.scoring || {};
            category.scoring.partial = category.scoring.partial || {};
            category.scoring.partial.scenarios = category.scoring.partial.scenarios || [];

            if (category.scoring.partial.scenarios.length < category.choices.length) {
              category.scoring.partial.scenarios.push({});
            }
          }
        };

        $scope.containerBridge = {

          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;

            $scope.categories = _.map($scope.model.categories, wrapCategoryModel);

            $scope.choices = _.cloneDeep($scope.model.choices);

            var correctResponses = $scope.fullModel.correctResponse || {};

            _.forEach($scope.categories, function(category) {
              var response = correctResponses[category.model.id] || {};
              category.choices = _.map(response, function(choiceId) {
                return {
                  model: _.find($scope.choices, byId(choiceId))
                };
              });
            });

            _.forEach($scope.fullModel.partialScoring, function(scenarios, categoryId) {
              var category = _.find($scope.categories, byModelId(categoryId));
              category.scoring = {
                partial: {
                  scenarios: _.take(scenarios, all)
                }
              };
            });

            $scope.model.config.categoriesPerRow = $scope.model.config.categoriesPerRow || 2;
            $scope.model.config.choicesPerRow = $scope.model.config.choicesPerRow || 4;
          },

          getModel: function() {
            return $scope.fullModel;
          },

          getAnswer: function() {
            return {};
          }
        };

        function findFreeChoiceSlot() {
          var slot = 1;
          var usedSlots = _.pluck($scope.model.choices, 'id');
          while (_.contains(usedSlots, "choice_" + slot)) {
            slot++;
          }
          return slot;
        }

        $scope.addChoice = function() {
          $scope.choices.push({
            id: "choice_" + findFreeChoiceSlot(),
            labelType: "text",
            label: "",
            moveOnDrag: false
          });
        };

        $scope.$watch('categories', function() {
          updateModel();
        }, true);

        $scope.$watch('choices', function() {
          updateModel();
        }, true);

        function updateModel() {

          function cleanChoicesLabel(choices) {
            var choicesCopy = _.cloneDeep(choices);
            _.forEach(choicesCopy, function(choice) {
              if (choice && _.isString(choice.label)) {
                choice.label = choice.label.replace(/[\u200B-\u200D\uFEFF]/g, '');
              }
            });
            return choicesCopy;
          }

          $scope.fullModel.model.choices = cleanChoicesLabel($scope.choices);

          $scope.fullModel.correctResponse = _.reduce($scope.categories, function(acc, category) {
            if (category.choices && category.choices.length > 0) {
              acc[category.model.id] = _.map(category.choices, function(choice) {
                return choice.model.id;
              });
            }
            return acc;
          }, {});

          $scope.fullModel.model.categories = _.map($scope.categories, function(category) {
            return _.cloneDeep(category.model);
          });

          $scope.fullModel.partialScoring = _.reduce($scope.categories, function(acc, category) {
            var scenarios = getOrNull(category, "scoring.partial.scenarios");
            if (scenarios) {
              category.scoring.partial.scenarios = _.take(scenarios, Math.min(category.choices.length, scenarios.length));
              if (scenarios.length > 0) {
                acc[category.model.id] = scenarios;
              }
            }
            return acc;
          }, {});

          $scope.fullModel.allowPartialScoring = !_.isEmpty($scope.fullModel.partialScoring);

          _.forEach($scope.fullModel.partialScoring, function(scenarios, categoryId) {
            var category = _.find($scope.categories, byModelId(categoryId));
            category.scoring = {
              partial: {
                scenarios: _.take(scenarios, all)
              }
            };
          });
        }

        $scope.$watch('model', function() {
          MathJaxService.parseDomForMath(0); //TODO on every model change?
        }, true);

        function findFreeCategorySlot() {
          var slot = 1; //categories start at 1
          var usedSlots = _.reduce($scope.categories, function(acc, category) {
            acc.push(category.model.id);
            return acc;
          }, []);
          while (_.contains(usedSlots, "cat_" + slot)) {
            slot++;
          }
          return slot;
        }

        $scope.addCategory = function() {
          var idx = findFreeCategorySlot();
          $scope.categories.push({
            model: {
              id: "cat_" + idx,
              hasLabel: true,
              label: "Category " + idx,
              layout: "vertical"
            },
            choices: []
          });
        };

        $scope.leftPanelClosed = false;
        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
      }
    };

    function template() {
      return [
        '<div class="config-corespring-dnd-categorize">',
        '  <div navigator-panel="Design">',
        designPanel(),
        '  </div>',
        '  <div navigator-panel="Scoring">',
        scoringPanel(),
        '  </div>',
        '</div>'
      ].join('');

      function playerColumn() {
        return [
            '<div class="row">',
            '  <p>In Categorize, students may drag & drop answer tiles to the appropriate category area(s).</p>',
            '</div>',
            '<div class="row" >',
          /*
            '  <corespring-dnd-categorize id="chooser" ',
            '     categories-per-row="model.config.categoriesPerRow" ',
            '     mode="edit"',
            '     choices="choices"',
            '     categories="categories"',
            '     image-service="imageService"',
            '   ></corespring-dnd-categorize>',
          */
            '</div>'
                ].join("");
      }

      function configControls() {
        return [
            '<div class="row">',
            '  <button type="button" id="add-choice" class="btn btn-default" ',
            '    ng-click="addCategory()">Add a Category</button>',
            '</div>',
            '<div class="row">',
            '  <button type="button" class="btn btn-default" ng-click="addChoice()">Add a Choice</button>',
            '</div>',
            '<div class="row">',
            '  <checkbox ng-model="model.config.shuffle" class="control-label">Shuffle Tiles</checkbox>',
            '</div>',
            '<div class="row">',
            '  Answer area is',
            '  <select ng-model="model.config.answerAreaPosition" class="form-control">',
            '    <option value="above">above</option>',
            '    <option value="below">below</option>',
            '  </select>',
            '</div>',
            '<div class="row">',
            '  Max Number of categories per row',
            '  <select ng-model="model.config.categoriesPerRow" class="form-control">',
            '    <option value="1">1</option>',
            '    <option value="2">2</option>',
            '    <option value="3">3</option>',
            '    <option value="4">4</option>',
            '  </select>',
            '</div>',
            '<div class="row">',
            '  Max Number of choices per row',
            '  <select ng-model="model.config.choicesPerRow" class="form-control">',
            '    <option value="1">1</option>',
            '    <option value="2">2</option>',
            '    <option value="3">3</option>',
            '    <option value="4">4</option>',
            '    <option value="5">5</option>',
            '    <option value="6">6</option>',
            '    <option value="7">7</option>',
            '    <option value="8">8</option>',
            '    <option value="9">9</option>',
            '    <option value="10">10</option>',
            '    <option value="11">11</option>',
            '    <option value="12">12</option>',
            '  </select>',
            '</div>'

        ].join("");
      }

      function designPanel() {
        return [
            '<div class="container-fluid">',
            '  <div class="row">',
            '    <div class="player-col">',
                    playerColumn(),
            '    </div>',
            '    <div class="settings-col">',
                   configControls(),
            '    </div>',
            '  </div>',
            '  <div class="row feedback-row">',
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
         ].join("");
      }

      function scoringPanel() {
        return [
            '<div class="container-fluid scoring-panel">',
            '  <div class="row partial-scoring">',
            '    <span>Partial scoring</span>',
            '    <div class="category-scoring" ng-repeat="category in categories">',
            '      <span class="label">{{category.model.label}}</span>',
            '      <div class="scenario" ng-repeat="scenario in category.scoring.partial.scenarios track by $index" >',
            '        <span>If</span>',
            '        <input type="number" ng-model="scenario.numCorrectAnswers" min="1" max="{{category.choices.length}}"/>',
            '        <span>of correct answers is selected, award</span>',
            '        <input type="number" ng-model="scenario.scorePercentage" min="1" max="100"/>',
            '        <span>%</span>',
            '        <i class="fa fa-trash remove-btn" ng-click="removeScoringScenario(category.model.id,scenario)"></i>',
            '      </div>',
            '      <button class="add-scoring-scenario" ',
            '         ng-click="addScoringScenario(category.model.id)" ',
            '         ng-disabled="canAddScenarios(category)" >Add scoring scenario to {{category.model.label}}</button>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join("");
      }
    }
}];


exports.framework = 'angular';
exports.directives = [{
  directive: main
}];