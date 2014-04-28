var def = [
  '$log',
  function($log) {
    return {
      scope: true,
      link: function(scope, elm, attr) {
        scope.imageUploadedToChoice = function(q) {
          q.imageName = scope.uploadingFilename;
          scope.$apply();
        };

        scope.getUploadUrl = function(file) {
          scope.uploadingFilename = file.name;
          return file.name;
        };

        scope.addScoringScenario = function() {
          var maxNumberOfCorrect = 0;
          _.each(scope.fullModel.partialScoring, function(ps) {
            if (ps.numberOfCorrect > maxNumberOfCorrect) {
              maxNumberOfCorrect = ps.numberOfCorrect;
            }
          });
          scope.fullModel.partialScoring.push({numberOfCorrect: maxNumberOfCorrect + 1, scorePercentage: 20});
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

      }
    };
  }
];


exports.framework = "angular";
exports.directive = {
  name: "choiceTemplateController",
  directive: def
};
