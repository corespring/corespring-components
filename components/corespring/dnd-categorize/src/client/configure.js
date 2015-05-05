var main = [
    'ChoiceTemplates',
    'ComponentImageService',
    'MathJaxService',
  function(
    ChoiceTemplates,
    ComponentImageService,
    MathJaxService
    ) {

    return {
      replace: true,
      restrict: 'AE',
      scope: {},
      link: link,
      template: template()
    };

    function link(scope, $element, attrs) {

      var MAX_CATEGORIES_PER_ROW = 4;
      var MAX_CHOICES_PER_ROW = 12;

      scope.answerAreaOptions = ['above','below'];
      scope.categoriesPerRowOptions = _.range(1, MAX_CATEGORIES_PER_ROW);
      scope.choicesPerRowOptions = _.range(1, MAX_CHOICES_PER_ROW);
      scope.imageService = ComponentImageService;
      scope.leftPanelClosed = false;

      scope.addChoice = addChoice;
      scope.choiceToLetter = choiceToLetter;

      scope.$watch('categories', updateModel, true);
      scope.$watch('choices', updateModel, true);
      scope.$watch('model', renderMath, true);

      scope.containerBridge = {
        setModel: setModel,
        getModel: getModel,
        getAnswer: getAnswer
      };

      scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      //----------------------------------------------------

      function setModel(fullModel) {
        scope.fullModel = fullModel;
        scope.fullModel.correctResponse = scope.fullModel.correctResponse || {};
        scope.model = scope.fullModel.model;
        scope.model.config.categoriesPerRow = scope.model.config.categoriesPerRow || 2;
        scope.model.config.choicesPerRow = scope.model.config.choicesPerRow || 4;

        scope.categories = _.map(scope.model.categories, wrapCategoryModel);
        scope.choices = _.cloneDeep(scope.model.choices);

        var correctResponses = scope.fullModel.correctResponse;

        _.forEach(scope.categories, function(category) {
          var response = correctResponses[category.model.id] || {};
          category.choices = _(response).map(getChoiceForId).map(wrapChoiceModel).value();
        });

      }

      function getModel() {
        return scope.fullModel;
      }

      function updateModel() {
        scope.fullModel.correctResponse = getChoicesForCorrectResponse();
        scope.fullModel.model.choices = scope.choices.map(cleanChoiceLabel);
        scope.fullModel.model.categories = _.map(scope.categories, function(category) {
          return _.cloneDeep(category.model);
        });
      }

      function addChoice() {
        var idx = findFreeChoiceSlot();
        scope.choices.push({
          id: makeChoiceId(idx),
          label: '',
          moveOnDrag: false
        });
      }

      function addCategory() {
        var idx = findFreeCategorySlot();
        scope.categories.push(wrapCategoryModel({
          id: makeCategoryId(idx),
          label: 'Category ' + idx
        }));
      }

      function choiceToLetter(c) {
        var idx = scope.model.choices.indexOf(c);
        return scope.toChar(idx);
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
        return _.find(scope.choices, {
          id: choiceId
        });
      }

      function getAnswer() {
        return {};
      }

      function cleanChoiceLabel(choice) {
        var copy = _.cloneDeep(choice);
        if (_.isString(copy.label)) {
          copy.label = copy.label.replace(/[\u200B-\u200D\uFEFF]/g, '');
        }
        return copy;
      }

      function getChoicesForCorrectResponse() {
        return _.reduce(scope.categories, function(acc, category) {
          if (category.choices) {
            acc[category.model.id] = _.map(category.choices, getIdForWrappedChoice);
          }
          return acc;
        }, {});
      }

      function getIdForWrappedChoice(choice) {
        return choice.model.id;
      }

      function renderMath() {
        MathJaxService.parseDomForMath(0, $element);
      }

      function findFreeChoiceSlot() {
        return findFreeSlot(getChoiceIds(), makeChoiceId);
      }

      function findFreeCategorySlot() {
        return findFreeSlot(getCategoryIds(), makeCategoryId);
      }

      function findFreeSlot(usedSlots, makeId) {
        var slot = 1;
        while (_.contains(usedSlots, makeId(slot))) {
          slot++;
        }
        return slot;
      }

      function getCategoryIds() {
        return _.map(scope.categories, function(category) {
          return category.model.id;
        });
      }

      function getChoiceIds() {
        return _.pluck(scope.model.choices, 'id');
      }

      function makeCategoryId(slot) {
        return 'cat_' + slot;
      }

      function makeChoiceId(slot) {
        return 'choice_' + slot;
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
            '  <p>',
            '    In Categorize, students may drag & drop answer tiles to ',
            '    the appropriate category area(s).',
            '  </p>',
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
            '  <button type="button" class="btn btn-default" ',
            '     ng-click="addChoice()">Add a Choice</button>',
            '</div>',
            '<div class="row">',
            '  <checkbox ng-model="model.config.shuffle" ',
            '     class="control-label">Shuffle Tiles</checkbox>',
            '</div>',
            '<div class="row">',
            '  Answer area is',
            '  <select ng-model="model.config.answerAreaPosition" ',
            '     class="form-control" ',
            '     ng-options="answerAreaOptions"/>',
            '  </select>',
            '</div>',
            '<div class="row">',
            '  Max Number of categories per row',
            '  <select ng-model="model.config.categoriesPerRow" ',
            '     class="form-control" ' +
            '     ng-options="categoriesPerRowOptions">',
            '  </select>',
            '</div>',
            '<div class="row">',
            '  Max Number of choices per row',
            '  <select ng-model="model.config.choicesPerRow" ',
            '    class="form-control"' +
            '    ng-options="choicesPerRowOptions">',
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
               feedback(),
            '</div>'
         ].join('');
      }

      function feedback() {
        return [
          '<div class="row">',
          '  <div class="col-xs-12 feedback-panel-col">',
          '    <corespring-feedback-config ',
          '       full-model="fullModel"',
          '       component-type="corespring-dnd-categorize"',
          '    ></corespring-feedback-config>',
          '  </div>',
          '</div>'
        ].join('\n');
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