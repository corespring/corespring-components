var main = [
    'ChoiceTemplates',
    'MathJaxService',
    'ComponentImageService',
    function(ChoiceTemplates, MathJaxService, ComponentImageService) {

    return {
      replace: true,
      restrict: "AE",
      scope: {},
      link: link,
      template: template()
    };

    function link($scope, $element, $attrs) {

      $scope.imageService = ComponentImageService;
      $scope.leftPanelClosed = false;

      $scope.addChoice = addChoice;
      $scope.choiceToLetter = choiceToLetter;

      $scope.$watch('categories', updateModel, true);
      $scope.$watch('choices', updateModel, true);
      $scope.$watch('model', renderMath, true);

      $scope.containerBridge = {
        setModel: setModel,
        getModel: getModel,
        getAnswer: getAnswer
      };

      $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);

      //----------------------------------------------------

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

      function choiceToLetter(c) {
        var idx = $scope.model.choices.indexOf(c);
        return $scope.toChar(idx);
      }

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

      function wrapChoiceModel(choiceModel) {
        return {
          model: choiceModel
        };
      }

      function getChoiceForId(choiceId) {
        return _.find($scope.choices, byId(choiceId));
      }

      function setModel(fullModel) {
        $scope.fullModel = fullModel;
        $scope.model = $scope.fullModel.model;
        $scope.model.config.categoriesPerRow = $scope.model.config.categoriesPerRow || 2;
        $scope.model.config.choicesPerRow = $scope.model.config.choicesPerRow || 4;

        $scope.categories = _.map($scope.model.categories, wrapCategoryModel);
        $scope.choices = _.cloneDeep($scope.model.choices);

        var correctResponses = $scope.fullModel.correctResponse || {};

        _.forEach($scope.categories, function(category) {
          var response = correctResponses[category.model.id] || {};
          category.choices = _(response).map(getChoiceForId).map(wrapChoiceModel).value();
        });

      }

      function getModel() {
        return $scope.fullModel;
      }

      function getAnswer() {
        return {};
      }

      function findFreeChoiceSlot() {
        var slot = 1;
        var usedSlots = _.pluck($scope.model.choices, 'id');
        while (_.contains(usedSlots, "choice_" + slot)) {
          slot++;
        }
        return slot;
      }

      function addChoice() {
        $scope.choices.push({
          id: "choice_" + findFreeChoiceSlot(),
          label: "",
          moveOnDrag: false
        });
      }

      function updateModel() {
        $scope.fullModel.correctResponse = getChoicesForCorrectResponse();
        $scope.fullModel.model.choices = $scope.choices.map(cleanChoiceLabel);
        $scope.fullModel.model.categories = _.map($scope.categories, function(category) {
          return _.cloneDeep(category.model);
        });
      }

      function cleanChoiceLabel(choice) {
        var copy = _.cloneDeep(choice);
        if (_.isString(copy.label)) {
          copy.label = copy.label.replace(/[\u200B-\u200D\uFEFF]/g, '');
        }
        return copy;
      }

      function getChoicesForCorrectResponse() {
        return _.reduce($scope.categories, function(acc, category) {
          if (category.choices) {
            acc[category.model.id] = _.map(category.choices, getIdForChoice);
          }
          return acc;
        }, {});
      }

      function getIdForChoice(choice) {
        return choice.model.id;
      }

      function renderMath() {
        MathJaxService.parseDomForMath(0);
      }

      function findFreeCategorySlot() {
        var slot = 1; //categories start at 1
        var usedSlots = _.map($scope.categories, function(category) {
          return category.model.id;
        });
        while (_.contains(usedSlots, "cat_" + slot)) {
          slot++;
        }
        return slot;
      }

      function addCategory() {
        var idx = findFreeCategorySlot();
        $scope.categories.push(wrapCategoryModel({
          id: "cat_" + idx,
          label: "Category " + idx
        }));
      }
    }


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
            '  <corespring-dnd-categorize id="chooser" ',
            '     categories-per-row="parseInt(model.config.categoriesPerRow, 10)" ',
            '     choices-per-row="parseInt(model.config.choicesPerRow, 10)" ',
            '     mode="edit"',
            '     choices="choices"',
            '     categories="categories"',
            '     image-service="imageService"',
            '   ></corespring-dnd-categorize>',
            '</div>'
        ].join('');
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

        ].join('');
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
         ].join('');
      }

      function scoringPanel() {
        return [
          '<div class="container-fluid">',
          '  <div class="row">',
          '    <div class="col-xs-12">',
          ChoiceTemplates.scoring(),
          '    </div>',
          '  </div>',
          '</div>'
        ].join('\n');
      }
    }
}];


exports.framework = 'angular';
exports.directives = [{
  directive: main
}];