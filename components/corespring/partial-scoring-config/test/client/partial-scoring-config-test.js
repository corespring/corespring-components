describe('corespring', function() {

  describe('partial scoring config', function() {

    var MockComponentRegister = function() {
      this.elements = {};
      this.registerComponent = function(id, bridge) {
        this.elements[id] = bridge;
      };
    };

    var element, scope, rootScope, container;

    var testModel;

    var testModelTemplate = {
      data: {
        "model": {
          "columns": [
            {
              "labelHtml": "Custom header"
            },
            {
              "labelHtml": "Column 1"
            },
            {
              "labelHtml": "Column 2"
            }
          ],
          "rows": [
            {
              "id": "1",
              "labelHtml": "Question text 1"
            },
            {
              "id": "2",
              "labelHtml": "Question text 2"
            },
            {
              "id": "3",
              "labelHtml": "Question text 3"
            },
            {
              "id": "4",
              "labelHtml": "Question text 4"
            }
          ],
          "answerType": "YES_NO"
        }
      }
    };

    beforeEach(angular.mock.module('test-app'));

    beforeEach(function() {
      module(function($provide) {
        testModel = _.cloneDeep(testModelTemplate);
        $provide.value('LogFactory', {
          getLogger: function() {
            return {
              trace: function() {},
              log: function() {},
              debug: function() {},
              warn: function() {},
              error: function() {},
              fatal: function() {},
              info: function() {}
            };
          }
        });
      });
    });

    beforeEach(inject(function($compile, $rootScope) {
      container = new MockComponentRegister();

      $rootScope.$on('registerComponent', function(event, id, obj) {
        console.log('registerComponent');
        container.registerComponent(id, obj);
      });

      var $scope = $rootScope.$new();
      $scope.fullModel = {
        allowPartialScoring: true,
        partialScoring: [{
          "numberOfCorrect": 1,
          "scorePercentage": 25
        }]
      };
      $scope.numberOfCorrectResponses = 0;

      element = $compile([
        '<corespring-partial-scoring-config ' +
        '   full-model="fullModel"',
        '   number-of-correct-responses="numberOfCorrectResponses"',
        '></corespring-partial-scoring-config>'
      ].join(''))($scope);
      scope = element.scope().$$childHead;
      rootScope = $rootScope;
    }));

    it('scope', function() {
      expect(scope).toBeDefined();
    });

    describe('addScoringScenario', function() {
      it('should exist', function() {
        expect(scope.addScoringScenario).toBeDefined();
      });

      it('should add a scenario', function() {
        scope.updateNumberOfCorrectResponses(3); //make sure we are allowed to add one, otherwise it will be removed on digest
        scope.addScoringScenario();
        expect(scope.fullModel.partialScoring.length).toEqual(2);
        expect(scope.fullModel.partialScoring[1]).toEqual({
          numberOfCorrect: 2,
          scorePercentage: 20
        });
      });

    });

    describe('togglePartialScoring', function() {
      it('should exist', function() {
        expect(scope.togglePartialScoring).toBeDefined();
      });
      it('should toggle allowPartialScoring', function() {
        scope.numberOfCorrectResponses = 2;
        scope.fullModel.allowPartialScoring = true;
        scope.togglePartialScoring();
        scope.$digest();
        expect(scope.fullModel.allowPartialScoring).toBe(false);
      });
      it('should not toggle allowPartialScoring, if numberOfCorrectResponses is 1 or less', function() {
        scope.numberOfCorrectResponses = 1;
        scope.fullModel.allowPartialScoring = true;
        scope.togglePartialScoring();
        scope.$digest();
        expect(scope.fullModel.allowPartialScoring).toBe(true);
      });
    });

    describe('removeScoringScenario', function() {
      it('should exist', function() {
        expect(scope.removeScoringScenario).toBeDefined();
      });
      it('should remove scoringScenario', function() {
        var scoringScenario = {};
        scope.fullModel.partialScoring.push(scoringScenario);
        scope.removeScoringScenario(scoringScenario);
        expect(scope.fullModel.partialScoring.length).toEqual(1);
      });
    });

    describe('updatePartialScoringModel', function() {
      it('should exist', function() {
        expect(scope.updateNumberOfCorrectResponses).toBeDefined();
      });

      describe('numberOfCorrectResponses', function() {
        it('should be set to the value passed in', function() {
          scope.updateNumberOfCorrectResponses(123);
          scope.$digest();
          expect(scope.numberOfCorrectResponses).toEqual(123);
        });
        it('should accept negative numbers', function() {
          scope.updateNumberOfCorrectResponses(-1);
          scope.$digest();
          expect(scope.numberOfCorrectResponses).toEqual(0);
        });
        it('should accept undefined', function() {
          scope.updateNumberOfCorrectResponses(undefined);
          scope.$digest();
          expect(scope.numberOfCorrectResponses).toEqual(0);
        });
        it('should accept null', function() {
          scope.updateNumberOfCorrectResponses(null);
          scope.$digest();
          expect(scope.numberOfCorrectResponses).toEqual(0);
        });
        it('should accept NaN', function() {
          scope.updateNumberOfCorrectResponses(NaN);
          scope.$digest();
          expect(scope.numberOfCorrectResponses).toEqual(0);
        });
      });

      describe('maxNumberOfScoringScenarios', function() {
        it('should be one less that the correct answers', function() {
          scope.updateNumberOfCorrectResponses(123);
          scope.$digest();
          expect(scope.maxNumberOfScoringScenarios).toEqual(123 - 1);
        });
        it('should have a minimum of 1', function() {
          scope.updateNumberOfCorrectResponses(0);
          scope.$digest();
          expect(scope.maxNumberOfScoringScenarios).toEqual(1);
        });
      });

      describe('canAddScoringScenario', function() {
        it("should be false if we cannot add a scenario", function() {
          scope.updateNumberOfCorrectResponses(2);
          scope.$digest();
          expect(scope.canAddScoringScenario).toBe(false);
        });
        it("should be true if we can add a scenario", function() {
          scope.updateNumberOfCorrectResponses(3);
          scope.$digest();
          expect(scope.canAddScoringScenario).toBe(true);
        });
        it("should be false if we cannot add a scenario", function() {
          scope.updateNumberOfCorrectResponses(3);
          scope.addScoringScenario();
          scope.$digest();
          expect(scope.canAddScoringScenario).toBe(false);
        });
      });

      describe('canRemoveScoringScenario', function() {
        it("should be false if we have 1 or less scenarios", function() {
          scope.updateNumberOfCorrectResponses(1);
          scope.$digest();
          expect(scope.canRemoveScoringScenario).toBe(false);
        });

        it("should be true if we have 2 or more scenarios", function() {
          scope.updateNumberOfCorrectResponses(3);
          scope.addScoringScenario();
          scope.$digest();
          expect(scope.canRemoveScoringScenario).toBe(true);
        });
      });

      describe('automatic removal of scenarios', function() {
        it('should remove scenarios if we have more scenarios than allowed', function() {
          scope.updateNumberOfCorrectResponses(3);
          scope.addScoringScenario();
          scope.$digest();
          expect(scope.fullModel.partialScoring.length).toEqual(2);
          scope.updateNumberOfCorrectResponses(2);
          scope.$digest();
          expect(scope.fullModel.partialScoring.length).toEqual(1);
        });

        it('should not remove the first scenario', function() {
          scope.updateNumberOfCorrectResponses(3);
          scope.addScoringScenario();
          scope.$digest();
          expect(scope.fullModel.partialScoring.length).toEqual(2);
          scope.updateNumberOfCorrectResponses(0);
          scope.$digest();
          expect(scope.fullModel.partialScoring.length).toEqual(1);
        });
      });
    });
  });
});