/* global com */
var def = [
  '$rootScope',
  '$log',
  '$http',
  'ImageUtils',
  'WiggiMathJaxFeatureDef',
  function($rootScope, $log, $http, ImageUtils, WiggiMathJaxFeatureDef) {

    function CorespringImageService() {

      this.deleteFile = function(url) {
        $http['delete'](url);
      };

      this.addFile = function(file, onComplete, onProgress) {
        var url = '' + file.name;

        if (ImageUtils.bytesToKb(file.size) > 500) {
          onComplete(ImageUtils.fileTooBigError(file.size, 500));
          return;
        }

        var opts = {
          onUploadComplete: function(body, status) {
            $log.info('done: ', body, status);
            onComplete(null, url);
          },
          onUploadProgress: function() {
            $log.info('progress', arguments);
            onProgress(null, 'started');
          },
          onUploadFailed: function() {
            $log.info('failed', arguments);
            onComplete({
              code: 'UPLOAD_FAILED',
              message: 'upload failed!'
            });
          }
        };

        var reader = new FileReader();

        reader.onloadend = function() {
          var uploader = new com.ee.RawFileUploader(file, reader.result, url, name, opts);
          uploader.beginUpload();
        };

        reader.readAsBinaryString(file);
      };

      return this;
    }

    return {
      scope: true,
      link: function(scope, elm, attr) {

        scope.imageService = new CorespringImageService();

        scope.extraFeatures = {
          definitions: [{
            type: 'group',
            buttons: [new WiggiMathJaxFeatureDef()]
          }]
        };

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
