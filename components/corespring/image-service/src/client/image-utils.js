/* global com */
var def = [

  function() {
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

      this.errors = {
        UNACCEPTABLE_TYPE: 'ERR_UNACCEPTABLE_TYPE',
        FILE_SIZE_EXCEEDED: 'ERR_FILE_SIZE_EXCEEDED'
      };

      this.acceptableType = function(fileType, acceptableTypes){
        if(!fileType){
          throw new Error('undefined fileType');
        } 

        if(!acceptableTypes){
          throw new Error('undefined acceptableTypes');
        }

        if(!_.contains(acceptableTypes, fileType)){
          return {
            code: this.errors.UNACCEPTABLE_TYPE,
            message: 'The fileType: ' + fileType + ' is not acceptable, it must be one of: ' + acceptableTypes.join(', ')
          };
        } 
      };
    };

    return new ImageUtils();
  }
];


exports.framework = "angular";
exports.service = def;