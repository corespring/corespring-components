module.exports.respond = function(question, answer, settings){
  return { correctness: "correct", answer : "hello there" };
}

module.exports.render = function(model){
  delete model.correctResponse;
  delete model.feedback;
  return model;
}