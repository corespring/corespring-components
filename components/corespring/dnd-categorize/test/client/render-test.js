describe('corespring:dnd-categorize:render', function() {

  var testModel, scope, rootScope, container, element;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      "model": {
        "categories": [
          {
            "id": "cat_1",
            "label": "Category 1"
          },
          {
            "id": "cat_2",
            "label": "Category 2"
          }
        ],
        "choices": [
          {
            "id": "choice_1",
            "label": "a",
            "moveOnDrag": false
          },
          {
            "id": "choice_2",
            "label": "b",
            "moveOnDrag": false
          }
        ],
        "config": {
          "shuffle": false,
          "answerAreaPosition": "below",
          "categoriesPerRow": 2,
          "choicesPerRow": 2
        }
      }
    },
    session: {}
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('MathJaxService', {
        parseDomForMath: function() {}
      });
    });
  });

  beforeEach(inject(function($compile, $rootScope) {

    $.fn.draggable = jasmine.createSpy('draggable');

    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-dnd-categorize-render id='1'></corespring-dnd-categorize-render>")($rootScope.$new());
    scope = element.isolateScope();
    rootScope = $rootScope;

    testModel = _.cloneDeep(testModelTemplate);
  }));

  it('constructs', function() {
    expect(element).toBeDefined();
    expect(element).not.toBe(null);
  });

  function setModelAndDigest() {
    container.elements['1'].setDataAndSession(testModel);
    rootScope.$digest();
  }

  describe('setDataAndSession', function() {
    it('should set renderModel', function() {
      expect(scope.renderModel).toEqual({});
      setModelAndDigest();
      expect(scope.renderModel.dragAndDropScope).toMatch(/scope-\d+/);
      expect(scope.renderModel.choices.length).toBe(2);
      expect(scope.renderModel.allChoices).toEqual(scope.renderModel.choices);
      expect(scope.renderModel.categories.length).toBe(2);
    });
    it('should set the answers from the session', function() {
      testModel.session = {
        answers: {
          cat_1: ['choice_1']
        }
      };
      setModelAndDigest();
      expect(scope.renderModel.categories[0].choices[0].model.id).toEqual('choice_1');
    });
  });

  describe('getSession', function() {
    it('should return answers', function() {
      testModel.session = {
        answers: {
          cat_1: ['choice_1'],
          cat_2: ['choice_1', 'choice_2']
        }
      };
      setModelAndDigest();
      expect(container.elements['1'].getSession().answers.cat_1).toEqual(['choice_1']);
      expect(container.elements['1'].getSession().answers.cat_2).toEqual(['choice_1', 'choice_2']);
    });
    it('should return numberOfAnswers', function() {
      testModel.session = {
        answers: {
          cat_1: ['choice_1'],
          cat_2: ['choice_1', 'choice_2']
        }
      };
      setModelAndDigest();
      expect(container.elements['1'].getSession().numberOfAnswers).toEqual(3);
    });
  });

  describe('reset', function() {
    beforeEach(setModelAndDigest);
    it('closes seeAnswerPanel', function() {
      scope.isSeeAnswerPanelExpanded = true;
      container.elements['1'].reset();
      expect(scope.isSeeAnswerPanelExpanded).toBe(false);
    });
    it('removes response', function() {
      scope.response = {};
      container.elements['1'].reset();
      expect(scope.response).toBeFalsy();
    });
    it('restores renderModel', function() {
      var saveRenderModel = scope.renderModel;
      scope.renderModel = {};
      container.elements['1'].reset();
      expect(scope.renderModel).toEqual(ignoreAngularIds(saveRenderModel));

      function ignoreAngularIds(renderModel) {
        renderModel = _.cloneDeep(renderModel);
        _.forEach(renderModel.categories, function(cat) {
          delete cat.$$hashKey;
        });
        return renderModel;
      }
    });
  });

  describe('setResponse', function() {
    beforeEach(setModelAndDigest);
    it('should set the response on the scope', function() {
      expect(scope.response).toBeFalsy();
      container.elements['1'].setResponse({});
      expect(scope.response).toBeTruthy();
    });
    it('should set the detailed feedback', function() {
      scope.renderModel.categories[1].choices = [{}, {}];
      container.elements['1'].setResponse({
        detailedFeedback: {
          cat_1: {
            answersExpected: true
          },
          cat_2: {
            correctness: ['correct', 'incorrect']
          }
        }
      });
      expect(scope.renderModel.categories[0].answersExpected).toBe(true);
      expect(scope.renderModel.categories[1].choices).toEqual([{
        correctness: 'correct'
      }, {
        correctness: 'incorrect'
      }]);
    });
    it('should create seeSolutionModel from correctResponse', function() {
      container.elements['1'].setResponse({
        correctResponse: {
          cat_1: ['choice_1'],
          cat_2: ['choice_2']
        }
      });
      expect(ignoreAngularIds(scope.correctAnswerRows)).toEqual([[{
        model: {
          id: 'cat_1',
          label: 'Category 1'
        },
        choices: [{
          model: {
            id: 'choice_1',
            label: 'a',
            moveOnDrag: false
          },
          correctness: 'correct'
        }]
      }, {
        model: {
          id: 'cat_2',
          label: 'Category 2'
        },
        choices: [{
          model: {
            id: 'choice_2',
            label: 'b',
            moveOnDrag: false
          },
          correctness: 'correct'
        }]
      }]]);

      function ignoreAngularIds(correctAnswerRows) {
        correctAnswerRows = _.cloneDeep(correctAnswerRows);
        _.forEach(correctAnswerRows[0], function(cat) {
          delete cat.$$hashKey;
        });
        return correctAnswerRows;
      }
    });

  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      setModelAndDigest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: {
          cat_1: ['choice_1']
        }
      };
      setModelAndDigest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      setModelAndDigest();
      scope.renderModel.categories[0].choices = [{
        model: {
          id: 'choice_1'
        }
      }];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  describe('answer change callback', function() {
    var changeHandlerCalled = false;

    beforeEach(function() {
      changeHandlerCalled = false;
      container.elements['1'].answerChangedHandler(function(c) {
        changeHandlerCalled = true;
      });
      setModelAndDigest();
    });

    it('does not get called initially', function() {
      expect(changeHandlerCalled).toBe(false);
    });

    it('does get called when a answer is selected', function() {
      scope.renderModel.categories[0].choices = [{
        model: {
          id: 'choice_1'
        }
      }];
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

  });

  describe('getEditMode', function() {
    it('should return empty string, if isEditMode is false', function() {
      scope.isEditMode = false;
      expect(scope.getEditMode()).toBe('');
    });

    it('should return "editable", if isEditMode is true', function() {
      scope.isEditMode = true;
      expect(scope.getEditMode()).toBe('editable');
    });
  });

  describe('onCategoryDeleteClicked', function() {
    it('should delete category from renderModel', function() {
      setModelAndDigest();
      expect(scope.renderModel.categories.length).toBe(2);
      expect(scope.renderModel.categories[0].model.id).toBe('cat_1');
      scope.onCategoryDeleteClicked('cat_1');
      expect(scope.renderModel.categories.length).toBe(1);
      expect(scope.renderModel.categories[0].model.id).not.toBe('cat_1');
    });
  });

  describe('onCategoryDrop', function() {
    beforeEach(setModelAndDigest);
    it('should add the choice to the category', function() {
      scope.onCategoryDrop('cat_1', 'choice_1');
      expect(scope.renderModel.categories[0].choices[0].model.id).toBe('choice_1');
    });
    it('should allow to add the choice multiple times', function() {
      scope.onCategoryDrop('cat_1', 'choice_1');
      scope.onCategoryDrop('cat_1', 'choice_1');
      expect(scope.renderModel.categories[0].choices[0].model.id).toBe('choice_1');
      expect(scope.renderModel.categories[0].choices[1].model.id).toBe('choice_1');
    });
    describe('available choices', function() {
      it('should remove the choice, if moveOnDrag is true and editMode is false', function() {
        scope.renderModel.choices[0].moveOnDrag = true;
        scope.isEditMode = false;
        expect(scope.renderModel.choices.length).toBe(2);
        expect(scope.renderModel.choices[0].id).toBe('choice_1');
        scope.onCategoryDrop('cat_1', 'choice_1');
        expect(scope.renderModel.choices.length).toBe(1);
        expect(scope.renderModel.choices[0].id).toBe('choice_2');
      });
      it('should not remove the choice, if moveOnDrag is false', function() {
        scope.renderModel.choices[0].moveOnDrag = false;
        scope.isEditMode = false;
        scope.onCategoryDrop('cat_1', 'choice_1');
        expect(scope.renderModel.choices.length).toBe(2);
      });
      it('should not remove the choice, if editMode is true', function() {
        scope.renderModel.choices[0].moveOnDrag = true;
        scope.isEditMode = true;
        scope.onCategoryDrop('cat_1', 'choice_1');
        expect(scope.renderModel.choices.length).toBe(2);
      });
    });
  });

  describe('onChoiceDeleteClicked', function() {
    beforeEach(setModelAndDigest);
    it('should delete the choice from the available choices', function() {
      expect(scope.renderModel.choices.length).toBe(2);
      scope.onChoiceDeleteClicked('choice_1');
      expect(scope.renderModel.choices.length).toBe(1);
    });
    it('should delete the choice from all categories', function() {
      scope.onCategoryDrop('cat_1', 'choice_1');
      scope.onCategoryDrop('cat_2', 'choice_1');
      expect(scope.renderModel.categories[0].choices.length).toBe(1);
      expect(scope.renderModel.categories[1].choices.length).toBe(1);
      scope.onChoiceDeleteClicked('choice_1');
      expect(scope.renderModel.categories[0].choices.length).toBe(0);
      expect(scope.renderModel.categories[1].choices.length).toBe(0);
    });
  });

  describe('onChoiceRemovedFromCategory', function() {
    beforeEach(setModelAndDigest);
    it('should remove choice from category', function() {
      scope.onCategoryDrop('cat_1', 'choice_1');
      expect(scope.renderModel.categories[0].choices.length).toBe(1);
      scope.onChoiceRemovedFromCategory('cat_1', 'choice_1', 0);
      expect(scope.renderModel.categories[0].choices.length).toBe(0);
    });
    it('should leave other choices alone', function() {
      scope.onCategoryDrop('cat_1', 'choice_1');
      scope.onCategoryDrop('cat_1', 'choice_1');
      expect(scope.renderModel.categories[0].choices.length).toBe(2);
      scope.onChoiceRemovedFromCategory('cat_1', 'choice_1', 0);
      expect(scope.renderModel.categories[0].choices.length).toBe(1);
    });
    it('should add the choice back in to available choices at the same position', function() {
      scope.isEditMode = false;
      scope.renderModel.choices[0].moveOnDrag = true;
      scope.onCategoryDrop('cat_1', 'choice_1');
      expect(scope.renderModel.choices.length).toBe(1);
      expect(scope.renderModel.choices[0].id).toBe('choice_2');
      scope.onChoiceRemovedFromCategory('cat_1', 'choice_1', 0);
      expect(scope.renderModel.choices.length).toBe(2);
      expect(scope.renderModel.choices[0].id).toBe('choice_1');
    });
  });

  describe('revertToState', function() {
    beforeEach(setModelAndDigest);
    it('should revert renderModel', function() {
      var state = scope.renderModel;
      scope.renderModel = null;
      scope.revertToState(state);
      expect(scope.renderModel).toEqual(state);
    });
  });

  describe('isDragEnabled', function() {
    it('should be true, if no response has been set', function() {
      delete scope.response;
      expect(scope.isDragEnabled({})).toBe(true);
    });
    it('should be false, if response has been set', function() {
      scope.response = {};
      expect(scope.isDragEnabled({})).toBe(false);
    });
  });

  describe('isDragEnabledFromCategory', function() {
    it('should be true, if no response has been set and not isEditMode', function() {
      delete scope.response;
      scope.isEditMode = false;
      expect(scope.isDragEnabledFromCategory()).toBe(true);
    });
    it('should be false, if response has been set', function() {
      scope.response = {};
      expect(scope.isDragEnabledFromCategory()).toBe(false);
    });
    it('should be false, if isEditMode', function() {
      delete scope.response;
      scope.isEditMode = true;
      expect(scope.isDragEnabledFromCategory()).toBe(false);
    });
  });



});