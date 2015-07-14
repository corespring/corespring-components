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
        var href = $document.location.href;
        return  path + (href.indexOf('?') === -1 ? '' :  '?' + href.split('?')[1]);
      }

      function replaceHashIfPresent(url){
        return url.replace(/#/g, '_');
      }
      
      this.errorMessage = '<strong>Upload error</strong><br/>Your image was not uploaded. Please try again.';

      this.deleteFile = function(url) {
        $http['delete'](addQueryParamsIfPresent(url));
      };

      this.addFile = function(file, onComplete, onProgress) {
        var url = addQueryParamsIfPresent('' + file.name);
        url = replaceHashIfPresent(url);

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