exports.framework = "angular";
exports.factory = [
  '$rootScope',
  '$log',

  function($rootScope, $log) {

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

        scope.numToString = function(num) {
          //TODO Works for single digits only
          return String.fromCharCode(65 + num);
        };

      };
    }

    return ChoiceTemplateScopeExtension;
  }
];
