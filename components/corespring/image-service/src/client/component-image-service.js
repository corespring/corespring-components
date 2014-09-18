/* global com */
var def = [
  '$log',
  '$http',
  'ImageUtils',
  '$timeout',
  function($log, $http, ImageUtils,$timeout) {

    function ComponentImageService() {

      this.deleteFile = function(url) {
        $http['delete'](url);
      };

      this.addFile = function(file, onComplete, onProgress) {
        var url = '' + file.name;

        if (ImageUtils.bytesToKb(file.size) > 500) {
          $timeout(function() {
            onComplete(ImageUtils.fileTooBigError(file.size, 500).message);
          });
          return;
        }

        var opts = {
          onUploadComplete: function(body, status) {
            $log.info('done: ', body, status);
            onComplete(null, url);
          },
          onUploadProgress: function(progress) {
            $log.info('progress', arguments);
            onProgress(null, progress);
          },
          onUploadFailed: function() {
            $log.info('failed', arguments);
            onComplete('<strong>Upload error</strong><br/>Your image was not uploaded. Please try again.');
          }
        };

        var reader = new FileReader();

        reader.onloadend = function() {
          var uploader = new com.ee.RawFileUploader(file, reader.result, url, name, opts);
          uploader.beginUpload();
        };

        reader.readAsBinaryString(file);
      };
    }

    return new ComponentImageService();
  }
];

exports.framework = "angular";
exports.service = def;