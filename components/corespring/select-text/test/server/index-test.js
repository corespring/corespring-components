var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');
var server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});
var should = require('should');
var _ = require('lodash');
var helper = require('../../../../../test-lib/test-helper');

var component = {
  "componentType": "corespring-select-text",
  "model": {
    "config": {
      "selectionUnit": "word",
      "checkIfCorrect": true
    },
    "choices": [{
      data: "I"
    }, {
      data: "ate"
    }, {
      data: "some"
    }, {
      data: "banana",
      correct: true
    }, {
      data: "and"
    }, {
      data: "carrot"
    }, {
      data: "and",
      selectable: false
    }, {
      data: "cheese"
    }, {
      data: "and"
    }, {
      data: "apple",
      correct: true
    }]
  }
};

var componentIgnoreCorrect = {
  "componentType": "corespring-select-text",
  "model": {
    "prompt": "Select the fruits from the text",
    "config": {
      "selectionUnit": "word",
      "checkIfCorrect": false,
      "minSelections": 2,
      "maxSelections": 3
    },
    "choices": [{
      data: "I"
    }, {
      data: "ate"
    }, {
      data: "some"
    }, {
      data: "banana"
    }, {
      data: "and"
    }, {
      data: "carrot"
    }, {
      data: "and"
    }, {
      data: "cheese"
    }, {
      data: "and"
    }, {
      data: "apple"
    }]
  }
};

describe('select text server logic', function() {

  it('should return an incorrect outcome if answer is empty', function() {
    var outcome = server.respond(_.cloneDeep(component), null, helper.settings(true, true, true));
    var expected = {
      correctness: "incorrect",
      score: 0,
      feedback: {
        choices: {
          3: {
            wouldBeCorrect: true
          },
          9: {
            wouldBeCorrect: true
          }
        },
        message: "Good try but that is not the correct answer."
      },
      outcome: [],
      correctClass: "incorrect"
    };
    outcome.should.eql(expected);
  });

  it('should respond with correct true in answer is correct', function() {
    var response = server.respond(_.cloneDeep(component), ['3', '9'], helper.settings(true, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  it('should respond with incorrect in answer is correct', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '2'], helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  it('should have incorrect selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '2'], helper.settings(true, true, true));
    response.feedback.choices['1'].should.eql({
      correct: false
    });
    response.feedback.choices['2'].should.eql({
      correct: false
    });
  });

  it('should have correct selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '9'], helper.settings(true, true, true));

    response.feedback.choices['1'].should.eql({
      correct: false
    });
    response.feedback.choices['9'].should.eql({
      correct: true
    });
  });

  it('should have incorrect non-selections in the feedback', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '2'], helper.settings(true, true, true));
    response.feedback.choices['3'].should.eql({
      wouldBeCorrect: true
    });
    response.feedback.choices['9'].should.eql({
      wouldBeCorrect: true
    });
  });

  it('should not have feedback is show feedback is false', function() {
    var response = server.respond(_.cloneDeep(component), ['1', '2'], helper.settings(false, true, true));
    response.should.not.have.property('feedback');
  });

  it('should have the tagged text in the model at the preprocess phase', function() {
    var response = server.preprocess(component);
    response.should.have.property('wrappedText');

    var wt = response.wrappedText;
    wt.should.match(/span class=.token. id=.0.*?<\/span>/);
  });

  it('selection should be marked correct if checkIfCorrect is false and selection count is okay', function() {
    var response = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1', '2'], helper.settings(true, true, true));
    response.feedback.choices['1'].should.eql({
      correct: true
    });
    response.feedback.choices['2'].should.eql({
      correct: true
    });
  });

  it('selection should be marked incorrect if checkIfCorrect is false and selection count is not okay', function() {
    var response = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1'], helper.settings(true, true, true));
    response.feedback.choices['1'].should.eql({
      correct: false
    });

    var responseTwo = server.respond(_.cloneDeep(componentIgnoreCorrect), ['1', '2', '3', '4'], helper.settings(true, true, true));
    responseTwo.feedback.choices['1'].should.eql({
      correct: false
    });
    responseTwo.feedback.choices['2'].should.eql({
      correct: false
    });
    responseTwo.feedback.choices['3'].should.eql({
      correct: false
    });
    responseTwo.feedback.choices['4'].should.eql({
      correct: false
    });
  });

  describe('wrapTokensWithHtml', function() {
    it('should not return span.token for unselectable token', function() {
      var wrappedTokens = server.wrapTokensWithHtml(component.model.choices);
      var unselectableIndex = _.findIndex(component.model.choices, function(choice) {
        return choice.selectable === false;
      });
      wrappedTokens.should.not.match(new RegExp("span class=.token. id=." + unselectableIndex + ".*?<\/span>"));
    });
  });

});