/*global exports */

exports.framework = "angular";
exports.factory = [
  '$rootScope',
  '$log',

  function($rootScope, $log) {

    "use strict";

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
          return (!num || isNaN(num) ? 0 : num).toString(10);
        };

      };
    }

    return ChoiceTemplateScopeExtension;
  }
];
