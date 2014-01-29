var server = require('../../src/server');
var should = require('should');
var _ = require('lodash');

var component = {
  "componentType" : "corespring-select-text",
  "model" : {
    "prompt": "Select the fruits from the text",
    "config": {
      "selectionUnit": "word",
      "checkIfCorrect": true
    },
    "text": "I ate some |banana and carrot and cheese and |apple"
  }
};

var componentIgnoreCorrect = {
  "componentType" : "corespring-select-text",
  "model" : {
    "prompt": "Select the fruits from the text",
    "config": {
      "selectionUnit": "word",
      "checkIfCorrect": false,
      "minSelections": 2,
      "maxSelections": 3
    },
    "text": "I ate some banana and carrot and cheese and apple"
  }
};

var settings = function (feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ? true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};

describe('select text tokenizer logic', function () {

  // words
  it('should tokenize words from a simple sentence (happy path)', function () {
    var text = "I went to the pool and ate a sandwich.";
    var tokens = server.tokenizeText(text, "word");
    tokens.should.eql(["I","went","to","the","pool","and","ate","a","sandwich"]);
  });

  it('should handle quotes', function () {
    var text = "\"I went to\" the pool and ate a sandwich.";
    var tokens = server.tokenizeText(text, "word");
    tokens.should.eql(["I","went","to","the","pool","and","ate","a","sandwich"]);
  });

  it('should handle contraction', function () {
    var text = "I'm a robot.";
    var tokens = server.tokenizeText(text, "word");
    tokens.should.eql(["I'm","a","robot"]);
  });

  it('should handle html tags', function () {
    var text = "<b>I</b>went<i>to</i>the<u>   pool  </u>and ate a sandwich.";
    var tokens = server.tokenizeText(text, "word");
    tokens.should.eql(["I","went","to","the","pool","and","ate","a","sandwich"]);
  });

  it('should handle html entities', function () {
    var text = "I went to the&acute; pool and ate a sandwich.";
    var tokens = server.tokenizeText(text, "word");
    tokens.should.eql(["I","went","to","the&acute;","pool","and","ate","a","sandwich"]);
  });

  it('should handle newlines', function () {
    var text = "I went to the pool\n and ate a sandwich.";
    var tokens = server.tokenizeText(text, "word");
    tokens.should.eql(["I","went","to","the","pool","and","ate","a","sandwich"]);
  });

  // sentences
  it('should tokenize sentences from a simple sentence (happy path)', function () {
    var text = "I was hungry. I went to the pool and ate a sandwich. Then that's all.";
    var tokens = server.tokenizeText(text, "sentence");
    tokens.should.eql(["I was hungry","I went to the pool and ate a sandwich","Then that's all"]);
  });

  it('should handle html tags', function () {
    var text = "I <b>was</b> hungry.<p>I went to the <i>pool</i> and ate a sandwich.</p>Then that's all.";
    var tokens = server.tokenizeText(text, "sentence");
    tokens.should.eql(["I <b>was</b> hungry","I went to the <i>pool</i> and ate a sandwich","Then that's all"]);
  });

  it('should not consider mid-sentence capital letters as new sentences', function () {
    var text = "I talked to Mr Brown. I said hello.";
    var tokens = server.tokenizeText(text, "sentence");
    tokens.should.eql(["I talked to Mr Brown","I said hello"]);
  });

  it('should not consider names as new sentences', function () {
    var text = "I talked to Victor S. Brown. I said hello.";
    var tokens = server.tokenizeText(text, "sentence");
    tokens.should.eql(["I talked to Victor S&#46; Brown","I said hello"]);
  });

  it('should handle newlines', function () {
    var text = "I was hungry.\n I went to \nthe pool and ate a sandwich. Then that's all.";
    var tokens = server.tokenizeText(text, "sentence");
    tokens.should.eql(["I was hungry","I went to \nthe pool and ate a sandwich","Then that's all"]);
  });


});

describe('select text server logic', function () {
  it('should respond with correct true in answer is correct', function() {
    var response = server.respond(_.cloneDeep(component), ['3','9'], settings(true, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  it('should respond with incorrect in answer is correct', function() {
    var response = server.respond(_.cloneDeep(component), ['1','2'], settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  it('should have incorrect selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1','2'], settings(true, true, true));
    response.feedback['1'].should.eql({correct: false});
    response.feedback['2'].should.eql({correct: false});
  });

  it('should have correct selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1','9'], settings(true, true, true));
    response.feedback['1'].should.eql({correct: false});
    response.feedback['9'].should.eql({correct: true});
  });

  it('should have incorrect non-selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1','2'], settings(true, true, true));
    response.feedback['3'].should.eql({wouldBeCorrect: true});
    response.feedback['9'].should.eql({wouldBeCorrect: true});
  });

  it('should not have feedback is show feedback is false', function() {
    var response = server.respond(_.cloneDeep(component), ['1','2'], settings(false, true, true));
    response.should.not.have.property('feedback');
  });

  it('should have the tagged text in the model at the render phase', function() {
    var response = server.render(component);
    response.should.have.property('wrappedText');

    var wt = response.wrappedText;
    wt.should.match(/span class=.token. id=.0.*?<\/span>/);
  });

  it('selection should be marked correct if checkIfCorrect is false and selection count is okay', function() {
    var response = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1','2'], settings(true, true, true));
    response.feedback['1'].should.eql({correct: true});
    response.feedback['2'].should.eql({correct: true});
  });

  it('selection should be marked incorrect if checkIfCorrect is false and selection count is not okay', function() {
    var response = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1'], settings(true, true, true));
    response.feedback['1'].should.eql({correct: false});

    var response = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1','2','3','4'], settings(true, true, true));
    response.feedback['1'].should.eql({correct: false});
    response.feedback['2'].should.eql({correct: false});
    response.feedback['3'].should.eql({correct: false});
    response.feedback['4'].should.eql({correct: false});
  });

});

