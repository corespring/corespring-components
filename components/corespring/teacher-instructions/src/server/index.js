/** Do not serialize the instructions to the client. **/
exports.preprocess = function(json) {
  return {};
};

exports.isScoreable = function() {
  return false;
};

exports.createOutcome = function() {
  return {
    correctness: 'unknown'
  };
};