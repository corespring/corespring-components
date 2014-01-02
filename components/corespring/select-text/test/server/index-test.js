var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-select-text"
};

settings = function (feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ? true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};

describe('tokenizer logic', function () {

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

});

describe('server logic', function () {
});
