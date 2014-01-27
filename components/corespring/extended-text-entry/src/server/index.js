var _ = require('lodash');

exports.respond = function (question, answer, settings) {
  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var response = {
  };

  return response;
};
