var server = require('../../src/server');
var should = require('should');
var _ = require('lodash');

var component = {
  "componentType": "corespring-select-text",
  "model": {
    "prompt": "Select the fruits from the text",
    "config": {
      "selectionUnit": "word",
      "checkIfCorrect": "yes"
    },
    "text": "I ate some |banana and carrot and cheese and |apple"
  }
};

var componentIgnoreCorrect = {
  "componentType": "corespring-select-text",
  "model": {
    "prompt": "Select the fruits from the text",
    "config": {
      "selectionUnit": "word",
      "checkIfCorrect": "no",
      "minSelections": 2,
      "maxSelections": 3
    },
    "text": "I ate some banana and carrot and cheese and apple"
  }
};

var settings = function(feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ? true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};

describe('select text server logic', function() {
  it('should respond with correct true in answer is correct', function() {
    var response = server.respond(_.cloneDeep(component), ['3', '9'], settings(true, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  it('should respond with incorrect in answer is correct', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '2'], settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  it('should have incorrect selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '2'], settings(true, true, true));
    response.feedback['1'].should.eql({
      correct: false
    });
    response.feedback['2'].should.eql({
      correct: false
    });
  });

  it('should have correct selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '9'], settings(true, true, true));
    response.feedback['1'].should.eql({
      correct: false
    });
    response.feedback['9'].should.eql({
      correct: true
    });
  });

  it('should have incorrect non-selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '2'], settings(true, true, true));
    response.feedback['3'].should.eql({
      wouldBeCorrect: true
    });
    response.feedback['9'].should.eql({
      wouldBeCorrect: true
    });
  });

  it('should not have feedback is show feedback is false', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '2'], settings(false, true, true));
    response.should.not.have.property('feedback');
  });

  it('should have the tagged text in the model at the preprocess phase', function() {
    var response = server.preprocess(component);
    response.should.have.property('wrappedText');

    var wt = response.wrappedText;
    wt.should.match(/span class=.token. id=.0.*?<\/span>/);
  });

  it('selection should be marked correct if checkIfCorrect is false and selection count is okay', function() {
    var response = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1', '2'], settings(true, true, true));
    response.feedback['1'].should.eql({
      correct: true
    });
    response.feedback['2'].should.eql({
      correct: true
    });
  });

  it('selection should be marked incorrect if checkIfCorrect is false and selection count is not okay', function() {
    var response = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1'], settings(true, true, true));
    response.feedback['1'].should.eql({
      correct: false
    });

    var responseTwo = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1', '2', '3', '4'], settings(true, true, true));
    responseTwo.feedback['1'].should.eql({
      correct: false
    });
    responseTwo.feedback['2'].should.eql({
      correct: false
    });
    responseTwo.feedback['3'].should.eql({
      correct: false
    });
    responseTwo.feedback['4'].should.eql({
      correct: false
    });
  });

});
