exports.respond = function(question, answer, settings){
  return {
    correctness: "correct",
    answer : "corespring-drag-and-drop TODO",
    score: 1
  };
};

exports.render = function(model){
  delete model.correctResponse;
  delete model.feedback;
  return model;
};