var def = [
  '$log',
  function ($log) {
    return {
      scope: true,
      link: function (scope, elm, attr) {
        console.log("Linking File Uploader Host");
        scope.imageUploadedToChoice = function(q) {
          q.imageName = scope.uploadingFilename;
          scope.$apply();
        };

        scope.getUploadUrl = function(file) {
          scope.uploadingFilename = file.name;
          return file.name;
        };

      }
    };
  }
];


exports.framework = "angular";
exports.directive = {
  name: "fileUploaderHost",
  directive: def
};
