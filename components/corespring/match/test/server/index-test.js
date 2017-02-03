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
      id: "row-1",
      matchSet: [true, false]
    },
    {
      id: "row-2",
      matchSet: [true, false]
    },
    {
      id: "row-3",
      matchSet: [true, false]
    },
    {
      id: "row-4",
      matchSet: [true, false]
    }
  ],
  allowPartialScoring: true,
  "legacyScoring": {
    "default": 0,
    "lowerBound": 0,
    "upperBound": 2,
    "mapping": {
      "row-1": {
        "0": 0.5
      },
      "row-2": {
        "0": 0.5
      },
      "row-3": {
        "0": 0.5
      },
      "row-4": {
        "0": 0.5
      }
    }
  },
  "partialScoring": [
    {"numberOfCorrect": 1, "scorePercentage": 10},
    {"numberOfCorrect": 2, "scorePercentage": 20},
    {"numberOfCorrect": 3, "scorePercentage": 30},
    {"numberOfCorrect": 4, "scorePercentage": 40}
  ],
  feedback: {
    "correctFeedbackType": "default",
    "partialFeedbackType": "Almost",
    "incorrectFeedbackType": "custom",
    "incorrectFeedback": "Everything is wrong !"
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
        id: "row-1",
        labelHtml: "Question text 1"
      },
      {
        id: "row-2",
        labelHtml: "Question text 2"
      },
      {
        id: "row-3",
        labelHtml: "Question text 3"
      },
      {
        id: "row-4",
        labelHtml: "Question text 4"
      }
    ],
    config: {
      inputType: "radiobutton"
    },
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

function legacyScoreFor(rowIdentifier) {
  return componentTemplate.legacyScoring.mapping[rowIdentifier][0];
}

function shouldEql(actual, expected){
  _.forEach(actual, function(value, key){
    value.should.eql(expected[key], 'key ' + key);
  });
}

beforeEach(function() {
  component = _.cloneDeep(componentTemplate);
  correctResponse = _.cloneDeep(componentTemplate.correctResponse);
});

describe('match server logic', function() {

  it('should return warning if the answer is null', function() {
    var outcome = server.createOutcome(component, null, helper.settings(true, true, true));
    outcome.should.eql({
      correctness:'incorrect',
      correctClass: 'warning',
      score: 0,
      feedback: fbu.defaults.warning,
      warningClass: 'answer-expected',
      correctnessMatrix: [
        answerExpected("row-1"),
        answerExpected("row-2"),
        answerExpected("row-3"),
        answerExpected("row-4")
      ],
      correctNum: 0,
      legacyScore: 0
    });
    outcome.score.should.equal(0);
  });

  it('should return warning if the answer is undefined', function() {
    var outcome = server.createOutcome(component, undefined, helper.settings(true, true, true));
    outcome.should.eql({
      correctness:'incorrect',
      correctClass: 'warning',
      score: 0,
      feedback: fbu.defaults.warning,
      warningClass: 'answer-expected',
      correctnessMatrix: [
        answerExpected("row-1"),
        answerExpected("row-2"),
        answerExpected("row-3"),
        answerExpected("row-4")
      ],
      correctNum: 0,
      legacyScore: 0
    });
    outcome.score.should.equal(0);

  });


  describe('createOutcome', function() {

    describe('legacyScore', function() {
      var answer = [
        correctAnswer('row-1'),
        correctAnswer('row-2'),
        correctAnswer('row-3'),
        correctAnswer('row-4')
      ];

      it('should be defined', function() {
        var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
        outcome.legacyScore.should.not.eql(undefined);
      });

      it('should equal the sum of legacy scores for the indexes', function() {
        var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
        var expectedScore = _(['row-1', 'row-2', 'row-3', 'row-4']).map(legacyScoreFor).reduce(function(a, b) {
          return a + b;
        }, 0);
        outcome.legacyScore.should.eql(expectedScore);
      });

    });

    it('should not show any feedback when no feedback is allowed', function() {
      var answers = [
        noAnswer("row-1"),
        noAnswer("row-2"),
        incorrectAnswer("row-3"),
        noAnswer("row-4")];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(false, true, true));
      response.correctness.should.equal("incorrect");
      response.score.should.equal(0);
    });

    it('should respond to a correct answer (feedback + user + correct)', function() {
      var answers = _.cloneDeep(component.correctResponse);
      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));
      var expected = {
        correctness: "correct",
        correctClass: "correct",
        score: 1,
        feedback: "Correct!",
        correctnessMatrix: [
          correctUnknown("row-1"),
          correctUnknown("row-2"),
          correctUnknown("row-3"),
          correctUnknown("row-4")
          ],
        correctNum: 4,
        legacyScore: 2
      };

      response.should.eql(expected);
      response.score.should.equal(expected.score);
    });

    it('should respond to a correct answer (feedback - user - correct)', function() {
      var answers = _.cloneDeep(component.correctResponse);
      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, false, false));
      var expected = {
        correctness: "correct",
        correctClass: "correct",
        score: 1,
        feedback: "Correct!",
        correctnessMatrix: [
          correctUnknown("row-1"),
          correctUnknown("row-2"),
          correctUnknown("row-3"),
          correctUnknown("row-4")
          ],
        correctNum: 4,
        legacyScore: 2
      };

      response.should.eql(expected);
      response.score.should.equal(expected.score);
    });


    it('should respond to incorrect result (feedback + user + correct) and user did not choose anything', function() {
      var answers = [
        noAnswer("row-1"),
        noAnswer("row-2"),
        noAnswer("row-3"),
        noAnswer("row-4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "warning",
        score: 0,
        feedback:fbu.defaults.warning,
        warningClass: 'answer-expected',
        correctnessMatrix: [
          answerExpected("row-1"),
          answerExpected("row-2"),
          answerExpected("row-3"),
          answerExpected("row-4")
        ],
        correctNum: 0,
        legacyScore: 0
      };
      response.should.eql(expected);
      response.score.should.equal(expected.score);
    });

    it('should respond to incorrect result (feedback + user + correct) and user chose incorrectly', function() {
      var answers = [
        incorrectAnswer("row-1"),
        incorrectAnswer("row-2"),
        incorrectAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "incorrect",
        score: 0,
        correctResponse: correctResponse,
        feedback: componentTemplate.feedback.incorrectFeedback,
        correctnessMatrix: [
          unknownIncorrect("row-1"),
          unknownIncorrect("row-2"),
          unknownIncorrect("row-3"),
          unknownIncorrect("row-4")
        ],
        correctNum: 0,
        legacyScore: 0
      };
      response.should.eql(expected);
      response.score.should.equal(expected.score);
    });

    it('should respond to incorrect result (feedback - user + correct) and user chose incorrectly', function() {
      var answers = [
        incorrectAnswer("row-1"),
        incorrectAnswer("row-2"),
        incorrectAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, false, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "incorrect",
        score: 0,
        correctResponse: correctResponse,
        feedback: componentTemplate.feedback.incorrectFeedback,
        correctnessMatrix: [
          unknownIncorrect("row-1"),
          unknownIncorrect("row-2"),
          unknownIncorrect("row-3"),
          unknownIncorrect("row-4")
        ],
        correctNum: 0,
        legacyScore: 0
      };
      response.should.eql(expected);
      response.score.should.equal(expected.score);
    });

    it('should respond to partially correct result (feedback + user + correct)', function() {
      var answers = [
        correctAnswer("row-1"),
        incorrectAnswer("row-2"),
        correctAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      var radioComponent = _.cloneDeep(component);
      var response = server.createOutcome(radioComponent, answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "partial",
        score: 0.2,
        correctResponse: correctResponse,
        feedback:"Almost!",
        correctnessMatrix: [
          correctUnknown("row-1"),
          unknownIncorrect("row-2"),
          correctUnknown("row-3"),
          unknownIncorrect("row-4")
        ],
        correctNum: 2,
        legacyScore: 1
      };
      response.should.eql(expected);
      response.score.should.equal(expected.score);
    });


    it('should respond to partial result in MULTIPLE choice case ', function() {
      var answers = [
        superfluousAnswer("row-1"),
        noAnswer("row-2"),
        noAnswer("row-3"),
        noAnswer("row-4")
      ];

      var checkboxComponent = _.merge(_.cloneDeep(component), {
        partialScoring: {
          sections: [
            {
              catId: "row-1",
              "partialScoring": [
                {
                  "numberOfCorrect": 1,
                  "scorePercentage": 10
                }
              ]
            },
            {
              catId: "row-2",
              "partialScoring": [
                {
                  "numberOfCorrect": 1,
                  "scorePercentage": 20
                }
              ]
            }
          ]
        },
        model: {config: {inputType: 'checkbox'}}
      });
      var response = server.createOutcome(checkboxComponent, answers, helper.settings(true, true, true));
      var expected = {
        correctness: "incorrect",
        correctClass: "partial",
        correctResponse: correctResponse,
        feedback:"Almost!",
        correctnessMatrix: [
          correctIncorrect("row-1"),
          answerExpected("row-2"),
          answerExpected("row-3"),
          answerExpected("row-4")
        ],
        correctNum: 0,
        legacyScore: 0.5
      };
      expected.should.eql(_.omit(response, 'score'));
      response.score.should.be.approximately(1/4, 0.000001);
    });

    it('should respond to partially correct result (feedback - correct + user)', function() {
      var answers = [
        correctAnswer("row-1"),
        incorrectAnswer("row-2"),
        correctAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, false));

      var expected = {
        correctness: "incorrect",
        correctClass: "partial",
        score: 0.2,
        correctResponse: correctResponse,
        feedback:"Almost!",
        correctnessMatrix: [
          correctUnknown("row-1"),
          unknownIncorrect("row-2"),
          correctUnknown("row-3"),
          unknownIncorrect("row-4")
        ],
        correctNum: 2,
        legacyScore: 1
      };
      response.should.eql(expected);
      response.score.should.equal(expected.score);
    });

  });

  describe('legacyScore', function() {
    function makeQuestion(defalt, lowerBound, upperBound, mapping) {
      var legacyScoring = _.merge({
        "default": defalt,
        "lowerBound": lowerBound,
        "upperBound": upperBound
      },
      {
        mapping: mapping
      });
      return {
        legacyScoring: legacyScoring
      }
    }

    describe('overall score lower than lowerBound', function() {
      var lowerBound = 0;
      var question = makeQuestion(0, lowerBound, 10, {
        "row-1": {
          "0": -1
        }
      });

      it('should return lowerBound', function() {
        var answer = [
          {
            id: "row-1",
            matchSet: [true, false]
          }
        ];
        server.legacyScore(question, answer).should.equal(lowerBound);
      });

    });

    describe('overall score higher than upperBound', function() {
      var upperBound = 10;
      var question = makeQuestion(0, 0, upperBound, {
        "row-1": {
          "0": 100
        }
      });

      it('should return upperBound', function() {
        var answer = [
          {
            id: "row-1",
            matchSet: [true, false]
          }
        ];
        server.legacyScore(question, answer).should.equal(upperBound);
      });

    });

    describe('mapping is missing value', function() {
      var defalt = 10;
      var question = makeQuestion(defalt, 0, 100, {
        "row-1": {
          "0": 20
        }
      });

      it('should use default value', function() {
        var answer = [
          {
            id: "row-1",
            matchSet: [false, true]
          }
        ];
        server.legacyScore(question, answer).should.equal(defalt);
      });

    });

  });

});