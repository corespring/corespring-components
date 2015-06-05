exports.framework = 'angular';
exports.directives = [{
  directive: [
    'ComponentImageService',
    'MathJaxService',
    configureCorespringDndCategorize
  ]
}];

function configureCorespringDndCategorize(
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
    var log = console.log.bind(console, '[cs-dnd-cat:configure]');

    var MAX_CATEGORIES_PER_ROW = 4;
    var MAX_CHOICES_PER_ROW = 12;

    scope.answerAreaOptions = ['above', 'below'];
    scope.categoriesPerRowOptions = _.range(1, MAX_CATEGORIES_PER_ROW + 1);
    scope.choicesPerRowOptions = _.range(1, MAX_CHOICES_PER_ROW + 1);
    scope.imageService = ComponentImageService;
    scope.leftPanelClosed = false;
    scope.numberOfCorrectAnswers = 0;

    scope.addCategory = addCategory;
    scope.addChoice = addChoice;
    scope.deactivate = deactivate;

    var debouncedUpdatePartialScoring = _.debounce(updatePartialScoring, 200);

    scope.$watch('editorModel.choices', updateModel, true);
    scope.$watch('editorModel.categories', updateModel, true);
    scope.$watch('editorModel.partialScoring', debouncedUpdatePartialScoring, true);
    scope.$watch('model', renderMath, true);

    scope.containerBridge = {
      setModel: setModel,
      getModel: getModel
    };

    scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

    //----------------------------------------------------

    function setModel(fullModel) {
      //log('setModel in', _.cloneDeep(fullModel));
      scope.fullModel = fullModel;
      scope.fullModel.correctResponse = scope.fullModel.correctResponse || {};

      scope.model = scope.fullModel.model;
      scope.model.config.categoriesPerRow = scope.model.config.categoriesPerRow || 2;
      scope.model.config.choicesPerRow = scope.model.config.choicesPerRow || 4;

      scope.editorModel = prepareEditorModel();
      //log('setModel out', _.cloneDeep(fullModel), _.cloneDeep(scope.editorModel));
    }

    function prepareEditorModel() {
      var choices = _.cloneDeep(scope.model.choices);

      var categories = _.map(scope.model.categories, wrapCategoryModel);
      var correctResponses = scope.fullModel.correctResponse;
      _.forEach(categories, function (category) {
        var response = correctResponses[category.model.id] || {};
        category.choices = _(response).map(getChoiceForId).map(wrapChoiceModel).value();
      });

      var partialScoring = preparePartialScoringEditorModel(scope.fullModel.partialScoring);

      return {
        choices: choices,
        categories: categories,
        partialScoring: partialScoring
      };

      function getChoiceForId(choiceId) {
        return _.find(choices, {
          id: choiceId
        });
      }
    }

    function preparePartialScoringEditorModel(inputPartialScoring){
      var result = _.cloneDeep(inputPartialScoring || {});
      if(!result.sections){
        result.sections = _.map(scope.model.categories, makePartialScoringSection);
      }
      return result;
    }

    function makePartialScoringSection(cat){
      var correctResponses = scope.fullModel.correctResponse[cat.id] || [];
      var section = {
        catId: cat.id,
        label: cat.label,
        numberOfCorrectResponses: correctResponses.length,
        partialScoring: []
      };
      return section;
    }

    function getModel() {
      return scope.fullModel;
    }

    function updateModel() {
      updateChoices();
      updateCategories();
      updateCorrectResponse();
      updatePartialScoringEditorModel();

      //--------------------------------------

      function updateChoices(){
        scope.fullModel.model.choices = scope.editorModel.choices.map(cleanChoiceLabel);
      }

      function updateCategories(){
        scope.fullModel.model.categories = _.map(scope.editorModel.categories, function (category) {
          return _.cloneDeep(category.model);
        });
      }

      function updateCorrectResponse(){
        scope.fullModel.correctResponse = _.reduce(scope.editorModel.categories, function (acc, category) {
          if (category.choices) {
            acc[category.model.id] = _.map(category.choices, getModelIdForChoice);
          }
          return acc;
        }, {});
      }

      function updatePartialScoringEditorModel(){
        //if categories have been changed
        //add/remove sections if a category has been added/removed
        //update numberOfCorrectResponses in the sections
        //update labels

        var result = {sections:[]};
        _.forEach(scope.model.categories, function(cat){
          var section = _.find(scope.editorModel.partialScoring.sections, {catId:cat.id});
          log("[Warn] updatePartialScoringEditorModel: section for " + cat.id + " not found. Creating new section.");
          if(!section){
            section = makePartialScoringSection(cat);
          } else {
            section.label = cat.label;
            section.numberOfCorrectResponses = (scope.fullModel.correctResponse[cat.id] || []).length;
          }
          result.sections.push(section);
        });
        scope.editorModel.partialScoring = result;
      }
    }

    function updatePartialScoring(){
      var sections = _.map(scope.editorModel.partialScoring.sections, function(section){
        return {
          catId: section.catId,
          partialScoring: section.partialScoring
        };
      });
      //log("updatePartialScoring sections:", scope.editorModel.partialScoring.sections, sections);
      scope.fullModel.partialScoring = {
        sections: sections
      };
    }

    function countCorrectAnswers() {
      return _.reduce(scope.editorModel.categories, function (acc, category) {
        return acc + (category.choices ? category.choices.length : 0);
      }, 0);
    }

    function addChoice() {
      var idx = findFreeChoiceSlot();
      scope.editorModel.choices.push({
        id: makeChoiceId(idx),
        label: "&#8203;",
        moveOnDrag: false
      });
    }

    function addCategory() {
      var idx = findFreeCategorySlot();
      scope.editorModel.categories.push(wrapCategoryModel({
        id: makeCategoryId(idx),
        label: 'Category ' + idx
      }));
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

    function cleanChoiceLabel(choice) {
      var copy = _.cloneDeep(choice);
      if (_.isString(copy.label)) {
        copy.label = copy.label.replace(/[\u200B-\u200D\uFEFF]/g, '');
      }
      return copy;
    }

    function getModelIdForChoice(choice) {
      return choice.model.id;
    }

    function renderMath() {
      MathJaxService.parseDomForMath(0, $element[0]);
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
      return _.map(scope.editorModel.categories, function (category) {
        return category.model.id;
      });
    }

    function getChoiceIds() {
      return _.pluck(scope.editorModel.choices, 'id');
    }

    function makeCategoryId(slot) {
      return 'cat_' + slot;
    }

    function makeChoiceId(slot) {
      return 'choice_' + slot;
    }

    function deactivate() {
      scope.$broadcast('activate', 'none');
    }

  }

  function template() {
    return [
      '<div class="config-corespring-dnd-categorize" ng-click="deactivate()">',
      '  <div navigator-panel="Design">',
      designPanel(),
      '  </div>',
      '  <div navigator-panel="Scoring">',
      scoringPanel(),
      '  </div>',
      '</div>'
    ].join('');

    function designPanel() {
      return [
        '<div class="container-fluid">',
        '  <div class="row">',
        '    <div class="player-col">',
        playerColumn(),
        feedback(),
        '    </div>',
        '    <div class="settings-col">',
        configControls(),
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    }

    function playerColumn() {
      return [
        '<div class="row">',
        '  <p>',
        '    In Categorize, students may drag & drop answer tiles to ',
        '    the appropriate category area(s).',
        '  </p>',
        '</div>',
        '<div class="row" >',
        '  <corespring-dnd-categorize',
        '     id="chooser" ',
        '     categories-per-row="model.config.categoriesPerRow" ',
        '     categories="editorModel.categories"',
        '     choices-per-row="model.config.choicesPerRow" ',
        '     choices="editorModel.choices"',
        '     image-service="imageService"',
        '     mode="edit"',
        '   ></corespring-dnd-categorize>',
        '</div>'
      ].join('');
    }

    function feedback() {
      return [
        '<div class="row">',
        '  <corespring-feedback-config ',
        '     full-model="fullModel"',
        '     component-type="corespring-dnd-categorize"',
        '  ></corespring-feedback-config>',
        '</div>'
      ].join('\n');
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
        '  Choice area is',
        '  <select ng-model="model.config.answerAreaPosition" ',
        '     class="form-control" ',
        '     ng-options="o for o in answerAreaOptions"/>',
        '  </select>',
        '</div>',
        '<div class="row">',
        '  Max number of categories per row',
        '  <select ng-model="model.config.categoriesPerRow" ',
        '     class="form-control" ',
        '     ng-options="o for o in categoriesPerRowOptions">',
        '  </select>',
        '</div>',
        '<div class="row">',
        '  Max number of choices per row',
        '  <select ng-model="model.config.choicesPerRow" ',
        '    class="form-control"',
        '    ng-options="o for o in choicesPerRowOptions">',
        '  </select>',
        '  <i>Display of number of choices per row may not reflect in editor </i>',
        '</div>'
      ].join('');
    }

    function scoringPanel() {
      return [
        '<div class="container-fluid">',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <corespring-multi-partial-scoring-config ',
        '         model="editorModel.partialScoring"',
        '         allow-partial-scoring="fullModel.allowPartialScoring"',
        '      ></corespring-partial-scoring-config>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }
  }
}