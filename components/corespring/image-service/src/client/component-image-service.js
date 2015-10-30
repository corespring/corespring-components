/* global com */
var def = [
  '$log',
  '$document',
  '$http',
  '$timeout',
  function($log, $document, $http, $timeout) {

    //TODO - this is lifted from wiggi-wiz. Remove the duplication.
    var ImageUtils = function() {

      var byteToKBMultiplier = 0.000976563;

      this.bytesToKb = function(bytes) {
        var sizeInKb = bytes * byteToKBMultiplier;
        var rounded = Math.floor(sizeInKb * 100) / 100;
        return rounded;
      };

      this.fileTooBigError = function(sizeInBytes, maxSizeInKb) {
        var sizeInKb = this.bytesToKb(sizeInBytes);
        return {
          code: this.errors.FILE_SIZE_EXCEEDED,
          message: 'The file is too big (' + sizeInKb + 'kb), the maximum is: ' + maxSizeInKb + 'kb.'
        };
      };

      this.imageTypes = function(){
        return ['image/png', 'image/gif', 'image/jpeg'];
      };

      this.errors = {
        UNACCEPTABLE_TYPE: 'ERR_UNACCEPTABLE_TYPE',
        FILE_SIZE_EXCEEDED: 'ERR_FILE_SIZE_EXCEEDED'
      };


      this.acceptableType = function(fileType, acceptableTypes){
       
        fileType = fileType || 'unknown-filetype'; 
        acceptableTypes = acceptableTypes  || [];

        if(!_.contains(acceptableTypes, fileType)){
          return {
            code: this.errors.UNACCEPTABLE_TYPE,
            message: 'The fileType: ' + fileType + ' is not acceptable, it must be one of: ' + acceptableTypes.join(', ')
          };
        } 
      };
    };

    var imageUtils = new ImageUtils();

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

      this.addFile = function(file, onComplete, onProgress) {
        var url = addQueryParamsIfPresent('' + encodeURIComponent(file.name));

       var typeError = imageUtils.acceptableType(file.type, imageUtils.imageTypes());

       if(typeError){
          $timeout(function() {
            onComplete(typeError.message);
          });
          return;
        }

        if (imageUtils.bytesToKb(file.size) > 500) {
          $timeout(function() {
            onComplete(imageUtils.fileTooBigError(file.size, 500).message);
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