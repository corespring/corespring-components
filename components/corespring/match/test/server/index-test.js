var assert, component, correctResponse, server, settings, should, _, helper;

helper = require('../../../../../test-lib/test-helper');

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu,
  'corespring.scoring-utils.server': {}
});

assert = require('assert');

var expect = require('chai').expect;

_ = require('lodash');

var componentTemplate = {
  componentType: "corespring-match",
  title: "Match component sample item",
  weight: 4,
  correctResponse: [
    {
      id: "1",
      matchSet: [true, false]
    },
    {
      id: "2",
      matchSet: [true, false]
    },
    {
      id: "3",
      matchSet: [true, false]
    },
    {
      id: "4",
      matchSet: [true, false]
    }
  ],
  allowPartialScoring: true,
  partialScores: {
    1: 25,
    2: 25,
    3: 25,
    4: 25
  },
  feedback: {
    all_correct: {
      type: "default"
    },
    some_correct: {
      type: "default"
    },
    all_incorrect: {
      type: "custom",
      text: "Everything is wrong !"
    }
  },
  model: {
    columns: [
      {
        labelHtml: "Custom header"
      },
      {
        labelHtml: "Column 1"
      },
      {
        labelHtml: "Column 2"
      }
    ],
    rows: [
      {
        id: "1",
        labelHtml: "Question text 1"
      },
      {
        id: "2",
        labelHtml: "Question text 2"
      },
      {
        id: "3",
        labelHtml: "Question text 3"
      },
      {
        id: "4",
        labelHtml: "Question text 4"
      }
    ],
    answerType: "MULTIPLE"
  }
};

function noAnswer(id){
  return {
    id: id,
    matchSet: [false, false]
  };
}

function correctAnswer(id){
  return {
    id: id,
    matchSet: [true, false]
  };
}

function incorrectAnswer(id){
  return {
    id: id,
    matchSet: [false, true]
  };
}

function superfluousAnswer(id){
  return {
    id: id,
    matchSet: [true, true]
  };
}

function answerExpected(id){
  return {
    id: id,
    matchSet: [
      {
        correctness: "unknown",
        value: false
      },
      {
        correctness: "unknown",
        value: false
      }
    ],
    answerExpected: true
  };
}

function correctUnknown(id){
  return {
    id: id,
    matchSet: [
      {
        correctness: "correct",
        value: true
      },
      {
        correctness: "unknown",
        value: false
      }
    ]
  };
}

function unknownIncorrect(id){
  return {
    id: id,
    matchSet: [
      {
        correctness: "unknown",
        value: false
      },
      {
        correctness: "incorrect",
        value: true
      }
    ]
  };
}

function correctIncorrect(id){
  return {
    id: id,
    matchSet: [
      {
        correctness: "correct",
        value: true
      },
      {
        correctness: "incorrect",
        value: true
      }
    ]
  };
}


beforeEach(function() {
  component = _.cloneDeep(componentTemplate);
  correctResponse = _.cloneDeep(componentTemplate.correctResponse);
});

describe('match server logic', function() {

  it('should return warning if the answer is null or undefined', function() {
    var outcome = server.createOutcome(component, null, helper.settings(true, true, true));
    outcome.should.eql({
      correctness: 'warning',
      correctResponse: correctResponse,
      score: 0,
      feedback: {
        summary: fbu.defaults.warning
      },
      correctnessMatrix: [
        answerExpected("1"),
        answerExpected("2"),
        answerExpected("3"),
        answerExpected("4")
      ]
    });

    outcome = server.createOutcome(component, undefined, helper.settings(true, true, true));
    outcome.should.eql({
      correctness: 'warning',
      correctResponse: correctResponse,
      score: 0,
      feedback: {
        summary: fbu.defaults.warning
      },
      correctnessMatrix: [
        answerExpected("1"),
        answerExpected("2"),
        answerExpected("3"),
        answerExpected("4")
      ]
    });

  });

  describe('createOutcome', function() {

    it('should not show any feedback when no feedback is allowed', function() {
      var answers = [
        noAnswer("1"),
        noAnswer("2"),
        incorrectAnswer("3"),
        noAnswer("4")];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(false, true, true));
      response.correctness.should.eql("all_incorrect");
      response.score.should.eql(0);
    });


    it('should respond to a correct answer (feedback + user + correct)', function() {
      var answers = _.cloneDeep(component.correctResponse);
      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));
      var expected = {
        correctness: "all_correct",
        correctResponse: correctResponse,
        score: 1,
        feedback: {
          summary: "Correct!"
        },
        correctnessMatrix: [
          correctUnknown("1"),
          correctUnknown("2"),
          correctUnknown("3"),
          correctUnknown("4")
          ]
      };

      response.should.eql(expected);
    });

    it('should respond to a correct answer (feedback - user - correct)', function() {
      var answers = _.cloneDeep(component.correctResponse);
      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, false, false));
      var expected = {
        correctness: "all_correct",
        correctResponse: correctResponse,
        score: 1,
        feedback: {
          summary: "Correct!",
        },
        correctnessMatrix: [
          correctUnknown("1"),
          correctUnknown("2"),
          correctUnknown("3"),
          correctUnknown("4")
          ]
      };

      response.should.eql(expected);
    });


    it('should respond to all_incorrect result (feedback + user + correct) and user did not choose anything', function() {
      var answers = [
        noAnswer("1"),
        noAnswer("2"),
        noAnswer("3"),
        noAnswer("4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "warning",
        correctResponse: correctResponse,
        score: 0,
        feedback: {
          summary: fbu.defaults.warning
        },
        correctnessMatrix: [
          answerExpected("1"),
          answerExpected("2"),
          answerExpected("3"),
          answerExpected("4")
        ]
      };
      response.should.eql(expected);
    });

    it('should respond to all_incorrect result (feedback + user + correct) and user chose incorrectly', function() {
      var answers = [
        incorrectAnswer("1"),
        incorrectAnswer("2"),
        incorrectAnswer("3"),
        incorrectAnswer("4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "all_incorrect",
        correctResponse: correctResponse,
        score: 0,
        feedback: {
          summary: componentTemplate.feedback.all_incorrect.text
        },
        correctnessMatrix: [
          unknownIncorrect("1"),
          unknownIncorrect("2"),
          unknownIncorrect("3"),
          unknownIncorrect("4")
          ]
      };
      response.should.eql(expected);
    });

    it('should respond to all_incorrect result (feedback - user + correct) and user chose incorrectly', function() {
      var answers = [
        incorrectAnswer("1"),
        incorrectAnswer("2"),
        incorrectAnswer("3"),
        incorrectAnswer("4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, false, true));

      var expected = {
        correctness: "all_incorrect",
        correctResponse: correctResponse,
        score: 0,
        feedback: {
          summary: componentTemplate.feedback.all_incorrect.text
        },
        correctnessMatrix: [
          unknownIncorrect("1"),
          unknownIncorrect("2"),
          unknownIncorrect("3"),
          unknownIncorrect("4")
        ]
      };
      response.should.eql(expected);
    });

    it('should respond to partially correct result (feedback + user + correct)', function() {
      var answers = [
        correctAnswer("1"),
        incorrectAnswer("2"),
        correctAnswer("3"),
        incorrectAnswer("4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "some_correct",
        correctResponse: correctResponse,
        score: 0.5,
        feedback: {
          summary: "Almost!"
        },
        correctnessMatrix: [
          correctUnknown("1"),
          unknownIncorrect("2"),
          correctUnknown("3"),
          unknownIncorrect("4")
        ]
      };
      response.should.eql(expected);
    });

    it('should respond to partially correct result in MULTIPLE choice case ', function() {
      var answers = [
        superfluousAnswer("1"),
        noAnswer("2"),
        noAnswer("3"),
        noAnswer("4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "some_correct",
        correctResponse: correctResponse,
        score: 0.125,
        feedback: {
          summary: "Almost!"
        },
        correctnessMatrix: [
          correctIncorrect("1"),
          answerExpected("2"),
          answerExpected("3"),
          answerExpected("4")
        ]
      };
      response.should.eql(expected);
    });


    it('should repond to partially correct result ( feedback - correct + user)', function() {
      var answers = [
        correctAnswer("1"),
        incorrectAnswer("2"),
        correctAnswer("3"),
        incorrectAnswer("4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, false));

      var expected = {
        correctness: "some_correct",
        correctResponse: correctResponse,
        score: 0.5,
        feedback: {
          summary: "Almost!"
        },
        correctnessMatrix: [
          correctUnknown("1"),
          unknownIncorrect("2"),
          correctUnknown("3"),
          unknownIncorrect("4")
        ]
      };
      response.should.eql(expected);
    });

  });
});