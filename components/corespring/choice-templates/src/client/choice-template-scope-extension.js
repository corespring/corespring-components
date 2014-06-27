exports.framework = "angular";
exports.factory = [
  '$rootScope',
  '$log',
  'MiniWiggiScopeExtension',

  function($rootScope, $log, MiniWiggiScopeExtension)
 {

    function ChoiceTemplateScopeExtension() {

      this.postLink = function(scope) {

        scope.imageUploadedToChoice = function(q) {
          q.imageName = scope.uploadingFilename;
          scope.$apply();
        };

        scope.getUploadUrl = function(file) {
          scope.uploadingFilename = file.name;
          return file.name;
        };

        scope.resetStash = function() {
          $rootScope.$broadcast('resetStash');
        };

        scope.addScoringScenario = function() {
          var maxNumberOfCorrect = 0;
          _.each(scope.fullModel.partialScoring, function(ps) {
            if (ps.numberOfCorrect > maxNumberOfCorrect) {
              maxNumberOfCorrect = ps.numberOfCorrect;
            }
          });
          scope.fullModel.partialScoring.push({
            numberOfCorrect: maxNumberOfCorrect + 1,
            scorePercentage: 20
          });
        };

        scope.removeScoringScenario = function(scoringScenario) {
          scope.fullModel.partialScoring = _.filter(scope.fullModel.partialScoring, function(ps) {
            return ps !== scoringScenario;
          });
        };

        scope.validClass = function(scoringScenario) {
          var sameScore = _.find(scope.fullModel.partialScoring, function(ps) {
            return ps !== scoringScenario && ps.numberOfCorrect === scoringScenario.numberOfCorrect;
          });

          return sameScore ? "invalid" : "";
        };

        new MiniWiggiScopeExtension().postLink(scope);

      };
    }

    return ChoiceTemplateScopeExtension;
  }
];
