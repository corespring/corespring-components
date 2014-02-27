/* global KhanUtil */

exports.framework = "angular";
exports.service = [ '$log', function($log){
  return {
    KhanUtil: KhanUtil
  };
}];