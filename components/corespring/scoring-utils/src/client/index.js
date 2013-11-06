// module: corespring.scoring-utils
// service: ScoringUtils

exports.framework = "angular";
exports.service = [ '$log', function($log){
  $log.debug("Service created!");
  return {
    sayHello: function(msg){
      return "!!" + msg;
    }
  };
}];