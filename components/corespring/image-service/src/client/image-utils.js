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
          code: 'ERR_FILE_SIZE_EXCEEDED',
          message: 'The file is too big (' + sizeInKb + 'kb), the maximum is: ' + maxSizeInKb + 'kb.'
        };
      };
    };

    return new ImageUtils();
  }
];


exports.framework = "angular";
exports.service = def;