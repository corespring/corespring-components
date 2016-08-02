/* globals JSON */

describe('corespring:dnd-categorize:render', function() {

  var testModel, scope, rootScope, container, element;

  function ignoreAngularIds(obj) {
    var json = angular.toJson(obj);
    return _.isString(json) ? JSON.parse(json) : undefined;
  }

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
          },
          {
            "id": "choice_3",
            "label": "c",
            "moveOnDrag": false
          }
        ],
        "config": {
          "shuffle": false,
          "answerAreaPosition": "below",
          "categoriesPerRow": 2,
          "choicesLabel": "some choices label",
          "choicesPerRow": 2
        }
      }
    },
    session: {}
  };

  var instructorData = {
    correctResponse: {
      "cat_1": ["choice_1"],
      "cat_2": ["choice_2"]
    }
  };


  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('MathJaxService', {
        parseDomForMath: function() {},
        off: function() {},
        onEndProcess: function() {}
      });
      $provide.value('Msgr', {
        send: function() {}
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

  function setModelAndDigestWithSession(session) {
    testModel.session = session;
    setModelAndDigest();
  }

  function setModelAndDigest() {
    container.elements['1'].setDataAndSession(testModel);
    rootScope.$digest();
  }

  function setInstructorDataAndDigest() {
    container.elements['1'].setInstructorData(instructorData);
    rootScope.$digest();
  }

  function mkCat(id) {
    return {
      id: id
    };
  }

  it('constructs', function() {
    expect(element).toBeDefined();
    expect(element).not.toBe(null);
  });

  describe('setDataAndSession', function() {
    it('should set renderModel', function() {
      expect(scope.renderModel).toEqual({});
      setModelAndDigest();
      expect(scope.dragAndDropScope).toMatch(/scope-\d+/);
      expect(scope.renderModel.choices.length).toBe(3);
      expect(scope.renderModel.allChoices).toEqual(scope.renderModel.choices);
      expect(scope.renderModel.categories.length).toBe(2);
    });
    it('should set the answers from the session', function() {
      setModelAndDigestWithSession({
        answers: {
          cat_1: ['choice_1']
        }
      });
      expect(scope.renderModel.categories[0].choices[0].model.id).toEqual('choice_1');
    });
    it('should not remove answers with moveOnDrag = true from the choices', function() {
      testModel.data.model.choices[0].moveOnDrag = true;
      setModelAndDigestWithSession({
        answers: {
          cat_1: ['choice_1']
        }
      });
      expect(scope.renderModel.choices.length).toEqual(3);
    });
  });

  describe('rows', function() {
    it('should put the categories into rows', function() {
      setModelAndDigest();
      expect(ignoreAngularIds(scope.rows)).toEqual(
      [{
          id: 0,
          categories: [{
            model: {
              id: 'cat_1',
              label: 'Category 1'
            },
            choices: []
          }, {
            model: {
              id: 'cat_2',
              label: 'Category 2'
            },
            choices: []
          }]
        }]
      );
    });

    it('should split categories into rows of size categoriesPerRow', function() {
      expect(testModel.data.model.config.categoriesPerRow).toBe(2);
      testModel.data.model.categories = [mkCat(1), mkCat(2), mkCat(3), mkCat(4), mkCat(5)];
      setModelAndDigest();
      expect(scope.rows.length).toBe(3);
    });

    it('should fill rows with placeholders up to categoriesPerRow', function() {
      expect(testModel.data.model.config.categoriesPerRow).toBe(2);
      testModel.data.model.categories = [mkCat(1), mkCat(2), mkCat(3), mkCat(4), mkCat(5)];
      setModelAndDigest();
      expect(scope.rows[2].categories.length).toBe(testModel.data.model.config.categoriesPerRow);
      expect(scope.rows[2].categories.pop().isPlaceHolder).toBe(true);
    });
  });

  describe('getSession', function() {
    it('should return answers', function() {
      setModelAndDigestWithSession({
        answers: {
          cat_1: ['choice_1'],
          cat_2: ['choice_1', 'choice_2']
        }
      });
      expect(container.elements['1'].getSession().answers.cat_1).toEqual(['choice_1']);
      expect(container.elements['1'].getSession().answers.cat_2).toEqual(['choice_1', 'choice_2']);
    });
    it('should return numberOfAnswers', function() {
      setModelAndDigestWithSession({
        answers: {
          cat_1: ['choice_1'],
          cat_2: ['choice_1', 'choice_2']
        }
      });
      expect(container.elements['1'].getSession().numberOfAnswers).toEqual(3);
    });
  });

  describe('reset', function() {
    beforeEach(setModelAndDigest);
    it('closes seeAnswerPanel', function() {
      scope.feedback.isSeeAnswerPanelExpanded = true;
      container.elements['1'].reset();
      expect(scope.feedback.isSeeAnswerPanelExpanded).toBe(false);
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
      expect(ignoreAngularIds(scope.renderModel)).toEqual(ignoreAngularIds(saveRenderModel));
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
      expect(ignoreAngularIds(scope.correctAnswerRows)).toEqual([{
        id: "correct-answer-row-0",
        categories: [{
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
      }]
    }]);
    });

    it('should split categories into rows of size categoriesPerRow', function() {
      expect(testModel.data.model.config.categoriesPerRow).toBe(2);
      testModel.data.model.categories = [mkCat(1), mkCat(2), mkCat(3), mkCat(4), mkCat(5)];
      setModelAndDigest();
      container.elements['1'].setResponse({
        correctResponse: {
          cat_1: ['choice_1'],
          cat_2: ['choice_2']
        }
      });
      expect(scope.correctAnswerRows.length).toBe(3);
    });

    it('should fill rows with placeholders up to categoriesPerRow', function() {
      expect(testModel.data.model.config.categoriesPerRow).toBe(2);
      testModel.data.model.categories = [mkCat(1), mkCat(2), mkCat(3), mkCat(4), mkCat(5)];
      setModelAndDigest();
      container.elements['1'].setResponse({
        correctResponse: {
          cat_1: ['choice_1'],
          cat_2: ['choice_2']
        }
      });
      expect(scope.correctAnswerRows[2].categories.length).toBe(testModel.data.model.config.categoriesPerRow);
      expect(scope.correctAnswerRows[2].categories.pop().isPlaceHolder).toBe(true);
    });

  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      setModelAndDigest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      setModelAndDigestWithSession({
        answers: {
          cat_1: ['choice_1']
        }
      });
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
    });

    it('does not get called initially', function() {
      setModelAndDigest();
      expect(changeHandlerCalled).toBe(false);
    });

    it('does not get called initially when session is set', function() {
      setModelAndDigestWithSession({
        answers: {
          cat_1: ['choice_1'],
          cat_2: ['choice_3']
        },
        numberOfAnswers: 2
      });
      expect(changeHandlerCalled).toBe(false);
    });

    it('does not get called by setResponse', function() {
      setModelAndDigest();
      container.elements['1'].setResponse({
        correctness: 'correct',
        correctClass: 'correct',
        score: 1,
        correctResponse: {
          cat_1: ['choice_1'],
          cat_2: ['choice_2']
        },
        detailedFeedback: {
          cat_1: {
            correctness: ['correct']
          },
          cat_2: {
            correctness: ['correct']
          }
        }
      });
      scope.$digest();
      expect(changeHandlerCalled).toBe(false);
    });

    it('does get called when an answer changes', function() {
      setModelAndDigest();
      scope.renderModel.categories[0].choices = [{
        model: {
          id: 'choice_1'
        }
      }];
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

    it('does not get called when an answer does not change', function() {
      setModelAndDigest();
      scope.renderModel.categories[0].choices = [{
        model: {
          id: 'choice_1'
        }
      }];
      scope.$digest();
      changeHandlerCalled = false;

      //now set same answer again
      scope.renderModel.categories[0].choices = [{
        model: {
          id: 'choice_1'
        }
      }];
      expect(changeHandlerCalled).toBe(false);
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
      var placedId;

      beforeEach(function() {
        placedId = "not placed";
        scope.$on('placed', function(ev, id) {
          placedId = id;
        });
      });

      it('should "place" the choice, if moveOnDrag is true and editMode is false', function() {
        scope.renderModel.choices[0].moveOnDrag = true;
        scope.isEditMode = false;
        scope.onCategoryDrop('cat_1', 'choice_1');
        expect(placedId).toBe('choice_1');
      });
      it('should not remove the choice, if moveOnDrag is false', function() {
        scope.renderModel.choices[0].moveOnDrag = false;
        scope.isEditMode = false;
        scope.onCategoryDrop('cat_1', 'choice_1');
        expect(placedId).toBe('not placed');
      });
      it('should not remove the choice, if editMode is true', function() {
        scope.renderModel.choices[0].moveOnDrag = true;
        scope.isEditMode = true;
        scope.onCategoryDrop('cat_1', 'choice_1');
        expect(placedId).toBe('not placed');
      });
    });
  });

  describe('onChoiceDeleteClicked', function() {
    beforeEach(setModelAndDigest);
    it('should delete the choice from the available choices', function() {
      expect(scope.renderModel.choices.length).toBe(3);
      scope.onChoiceDeleteClicked('choice_1');
      expect(scope.renderModel.choices.length).toBe(2);
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
    describe('unplace', function() {
      var unplacedId;

      beforeEach(function() {
        unplacedId = "still placed";
        scope.$on('unplaced', function(ev, id) {
          unplacedId = id;
        });
      });

      it('should "unplace" the choice', function() {
        scope.isEditMode = false;
        scope.renderModel.choices[0].moveOnDrag = true;
        scope.onCategoryDrop('cat_1', 'choice_1');
        scope.onChoiceRemovedFromCategory('cat_1', 'choice_1', 0);
        expect(unplacedId).toBe('choice_1');
      });

      it('should not "unplace" the choice when isEditMode is true', function() {
        scope.isEditMode = true;
        scope.renderModel.choices[0].moveOnDrag = true;
        scope.onCategoryDrop('cat_1', 'choice_1');
        scope.onChoiceRemovedFromCategory('cat_1', 'choice_1', 0);
        expect(unplacedId).toBe('still placed');
      });

      it('should not "unplace" the choice when moveOnDrag is false', function() {
        scope.isEditMode = false;
        scope.renderModel.choices[0].moveOnDrag = false;
        scope.onCategoryDrop('cat_1', 'choice_1');
        scope.onChoiceRemovedFromCategory('cat_1', 'choice_1', 0);
        expect(unplacedId).toBe('still placed');
      });
    });
  });

  describe('undo', function() {
    beforeEach(setModelAndDigest);
    it('should revert renderModel', function() {
      var saveState = _.cloneDeep(scope.renderModel);
      scope.renderModel = {};
      scope.$digest();
      scope.undoModel.undo();
      expect(scope.renderModel).toEqual(ignoreAngularIds(saveState));
    });
  });

  describe('startOver', function() {
    beforeEach(setModelAndDigest);
    it('should revert renderModel', function() {
      var saveState = _.cloneDeep(scope.renderModel);
      scope.renderModel = {};
      scope.$digest();
      scope.undoModel.startOver();
      expect(scope.renderModel).toEqual(ignoreAngularIds(saveState));
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

  describe('instructor data', function() {
    beforeEach(function() {
      spyOn(container.elements['1'], 'setResponse');
      setModelAndDigest();
      setInstructorDataAndDigest();
    });
    it('should call setResponse', function() {
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({
        correctness: 'correct',
        correctClass: 'correct',
        score: 1,
        correctResponse: {
          cat_1: ['choice_1'],
          cat_2: ['choice_2']
        },
        detailedFeedback: {
          cat_1: {
            correctness: ['correct']
          },
          cat_2: {
            correctness: ['correct']
          }
        }
      });
    });
    it('should set response to dummy', function() {
      expect(scope.response).toEqual('dummy');
    });
    it('should set editable to false', function() {
      expect(scope.editable).toEqual(false);
    });
    it('should show all choices regardless of moveOndDrag', function() {
      testModel.data.model.choices[0].moveOnDrag = true;
      setModelAndDigest();
      setInstructorDataAndDigest();
      expect(scope.renderModel.choices.length).toEqual(3);
    });
    it('should set the correctness of correct choices to instructor-mode-disabled', function() {
      expect(scope.renderModel.choices[0].correctness).toEqual('instructor-mode-disabled');
      expect(scope.renderModel.choices[1].correctness).toEqual('instructor-mode-disabled');
    });
    it('should set the correctness of incorrect choices to instructor-mode-disabled', function() {
      expect(scope.renderModel.choices[2].correctness).toEqual('instructor-mode-disabled');
    });
  });

  describe('canEdit', function() {
    describe('without a response', function() {
      beforeEach(function() {
        scope.response = null;
      });

      it('should be true after editable(true) has been called', function() {
        scope.containerBridge.editable(true);
        expect(scope.canEdit()).toBe(true);
      });

      it('should be false after editable(false) has been called', function() {
        scope.containerBridge.editable(false);
        expect(scope.canEdit()).toBe(false);
      });
    });

    describe('with response', function() {

      beforeEach(function() {
        scope.response = {};
      });

      it('should be false after editable(true) has been called', function() {
        scope.containerBridge.editable(true);
        expect(scope.canEdit()).toBe(false);
      });

      it('should be false after editable(false) has been called', function() {
        scope.containerBridge.editable(false);
        expect(scope.canEdit()).toBe(false);
      });
    });

  });

  describe('removeAllAfterPlacing', function() {
    beforeEach(function() {
      setModelAndDigest();
    });

    function setRemoveAllAfterPlacing(value) {
      //set the value like the checkbox would do
      scope.renderModel.removeAllAfterPlacing = {
        value: value
      };

      //set one choice to have the opposite value to be able to verify the action
      scope.renderModel.choices[0].moveOnDrag = !value;

      //call the toggle function that the checkbox would be calling
      scope.onToggleRemoveAllAfterPlacing();
      scope.$digest();
    }

    it('should set moveOnDrag to true for all choices if it is set to true', function() {
      setRemoveAllAfterPlacing(true);
      _.forEach(scope.renderModel.choices, function(choice) {
        expect(choice.moveOnDrag).toBe(true);
      });
    });

    it('should set moveOnDrag to false for all choices if it is set to false', function() {
      setRemoveAllAfterPlacing(false);
      _.forEach(scope.renderModel.choices, function(choice) {
        expect(choice.moveOnDrag).toBe(false);
      });
    });

    it('should be set to false if a choice toggles its moveOnDrag to false', function() {
      setRemoveAllAfterPlacing(true);
      var choice = scope.renderModel.choices[0];
      choice.moveOnDrag = false;
      scope.onToggleMoveOnDrag(choice);
      expect(scope.renderModel.removeAllAfterPlacing.value).toBe(false);
    });
  });


});
