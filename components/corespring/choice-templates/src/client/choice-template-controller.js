var def = [
  '$log',
  function ($log) {
    return {
      scope: true,
      link: function (scope, elm, attr) {
        scope.imageUploadedToChoice = function(q) {
          q.imageName = scope.uploadingFilename;
          scope.$apply();
        };

        scope.getUploadUrl = function(file) {
          scope.uploadingFilename = file.name;
          return file.name;
        };

        scope.addScoringScenario = function() {
          scope.fullModel.partialScoring.push({numberOfCorrect: 3, score: 1});
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
