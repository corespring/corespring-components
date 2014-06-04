/* global com */
var def = [
  '$log',
  '$http',
  'ImageUtils',
  function($log, $http, ImageUtils) {

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
    }

    return new CorespringImageService();
  }
];

exports.framework = "angular";
exports.service = def;