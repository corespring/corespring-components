/* global com */
var def = [
  '$log',
  '$document',
  '$http',
  'ImageUtils',
  '$timeout',
  function($log, $document, $http, ImageUtils,$timeout) {

    function ComponentImageService() {

      function addQueryParamsIfPresent(path) {
        var doc = $document[0];
        var href = doc.location.href;
        return  path + (href.indexOf('?') === -1 ? '' :  '?' + href.split('?')[1]);
      }
      
      this.errorMessage = '<strong>Upload error</strong><br/>Your image was not uploaded. Please try again.';

      this.deleteFile = function(url) {
        $http['delete'](addQueryParamsIfPresent(url));
      };

      var acceptableTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

      this.addFile = function(file, onComplete, onProgress) {
        var url = addQueryParamsIfPresent('' + encodeURIComponent(file.name));

       var typeError = ImageUtils.acceptableType(file.type, acceptableTypes);

       if(typeError){
          $timeout(function() {
            onComplete(typeError.message);
          });
          return;
        }

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
            onComplete(this.errorMessage);
          }.bind(this)
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