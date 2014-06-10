exports.framework = 'angular';
exports.factory = [

  function() {
    function LineLogic() {
      this.ping = function() {
        return "pong";
      };
    }
    return LineLogic;
  }
];