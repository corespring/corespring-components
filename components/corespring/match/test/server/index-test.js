var component, correctResponse;
var highlightUserResponse, highlightCorrectResponse, showFeedback;

var helper = require('../../../../../test-lib/test-helper');

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');

var server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu,
  'corespring.scoring-utils.server': {}
});

var assert = require('assert');
var _ = require('lodash');



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


function shouldEql(actual, expected){
  _.forEach(actual, function(value, key){
    value.should.eql(expected[key], 'key ' + key);
  });
}

function createOutcome(component, answers){
  return server.createOutcome(component, answers,
    helper.settings(highlightUserResponse, highlightCorrectResponse, showFeedback));
}

beforeEach(function() {
  component = _.cloneDeep(componentTemplate);
  correctResponse = _.cloneDeep(componentTemplate.correctResponse);
  highlightCorrectResponse = true;
  highlightUserResponse = true;
  showFeedback = true;
});

describe('match server logic', function() {

  it('should return warning if the answer is null', function() {
    var outcome = createOutcome(component, null);
    outcome.should.eql({
      correctness:'incorrect',
      correctClass: 'warning',
      score: 0,
      correctnessMatrix: [
        answerExpected("row-1"),
        answerExpected("row-2"),
        answerExpected("row-3"),
        answerExpected("row-4")
      ],
      feedback: fbu.defaults.warning,
      warningClass: 'answer-expected'
    });
  });

  it('should return warning if the answer is undefined', function() {
    var outcome = createOutcome(component, undefined);
    outcome.should.eql({
      correctness:'incorrect',
      correctClass: 'warning',
      score: 0,
      correctnessMatrix: [
        answerExpected("row-1"),
        answerExpected("row-2"),
        answerExpected("row-3"),
        answerExpected("row-4")
      ],
      feedback: fbu.defaults.warning,
      warningClass: 'answer-expected'
    });

  });


  describe('createOutcome', function() {

    it('should not show any feedback when no feedback is allowed', function() {
      var answers = [
        noAnswer("row-1"),
        noAnswer("row-2"),
        incorrectAnswer("row-3"),
        noAnswer("row-4")];

      highlightUserResponse = false;
      var response = createOutcome(component, answers);
      response.correctness.should.eql("incorrect");
      response.score.should.eql(0);
    });

    it('should respond to a correct answer (feedback + user + correct)', function() {
      var answers = _.cloneDeep(component.correctResponse);
      var response = createOutcome(component, answers);
      var expected = {
        correctness: "correct",
        correctClass: "correct",
        score: 1,
        correctnessMatrix: [
          correctUnknown("row-1"),
          correctUnknown("row-2"),
          correctUnknown("row-3"),
          correctUnknown("row-4")
          ],
        feedback: "Correct!"
      };

      response.should.eql(expected);
    });

    it('should respond to a correct answer (feedback - user - correct)', function() {
      var answers = _.cloneDeep(component.correctResponse);


      highlightCorrectResponse = false;
      showFeedback = false;
      var response = createOutcome(component, answers);
      var expected = {
        correctness: "correct",
        correctClass: "correct",
        score: 1,
        correctnessMatrix: [
          correctUnknown("row-1"),
          correctUnknown("row-2"),
          correctUnknown("row-3"),
          correctUnknown("row-4")
          ],
        feedback: "Correct!"
      };

      response.should.eql(expected);
    });

    it('should respond to incorrect result (feedback + user + correct) and user did not choose anything', function() {
      var answers = [
        noAnswer("row-1"),
        noAnswer("row-2"),
        noAnswer("row-3"),
        noAnswer("row-4")
      ];

      var response = createOutcome(component, answers);

      var expected = {
        correctness: "incorrect",
        correctClass: "warning",
        score: 0,
        correctnessMatrix: [
          answerExpected("row-1"),
          answerExpected("row-2"),
          answerExpected("row-3"),
          answerExpected("row-4")
        ],
        feedback:fbu.defaults.warning,
        warningClass: 'answer-expected'
      };
      response.should.eql(expected);
    });

    it('should respond to incorrect result (feedback + user + correct) and user chose incorrectly', function() {
      var answers = [
        incorrectAnswer("row-1"),
        incorrectAnswer("row-2"),
        incorrectAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      var response = createOutcome(component, answers);

      var expected = {
        correctness: "incorrect",
        correctClass: "incorrect",
        score: 0,
        correctnessMatrix: [
          unknownIncorrect("row-1"),
          unknownIncorrect("row-2"),
          unknownIncorrect("row-3"),
          unknownIncorrect("row-4")
          ],
        correctResponse: correctResponse,
        feedback: componentTemplate.feedback.incorrectFeedback
      };
      response.should.eql(expected);
    });

    it('should respond to incorrect result (feedback - user + correct) and user chose incorrectly', function() {
      var answers = [
        incorrectAnswer("row-1"),
        incorrectAnswer("row-2"),
        incorrectAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      highlightCorrectResponse = false;
      var response = createOutcome(component, answers);

      var expected = {
        correctness: "incorrect",
        correctClass: "incorrect",
        score: 0,
        correctnessMatrix: [
          unknownIncorrect("row-1"),
          unknownIncorrect("row-2"),
          unknownIncorrect("row-3"),
          unknownIncorrect("row-4")
        ],
        correctResponse: correctResponse,
        feedback:componentTemplate.feedback.incorrectFeedback
      };
      response.should.eql(expected);
    });

    it('should respond to partially correct result (feedback + user + correct)', function() {
      var answers = [
        correctAnswer("row-1"),
        incorrectAnswer("row-2"),
        correctAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      var radioComponent = _.cloneDeep(component);
      var response = createOutcome(radioComponent, answers);

      var expected = {
        correctness: "incorrect",
        correctClass: "partial",
        score: 0.2,
        correctnessMatrix: [
          correctUnknown("row-1"),
          unknownIncorrect("row-2"),
          correctUnknown("row-3"),
          unknownIncorrect("row-4")
        ],
        correctResponse: correctResponse,
        feedback:"Almost!"
      };
      response.should.eql(expected);
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
      var response = createOutcome(checkboxComponent, answers);
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
        ]
      };
      expected.should.eql(_.omit(response, 'score'));
      response.score.should.be.approximately(1/4, 0.000001);
    });

    it('should repond to partially correct result ( feedback - correct + user)', function() {
      var answers = [
        correctAnswer("row-1"),
        incorrectAnswer("row-2"),
        correctAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      showFeedback = false;
      var response = createOutcome(component, answers);

      response.correctness.should.eql("incorrect");
      response.correctClass.should.eql("partial");
      response.score.should.eql(0.2);
      response.feedback.should.eql("Almost!");
      response.correctnessMatrix.should.eql([
        correctUnknown("row-1"),
        unknownIncorrect("row-2"),
        correctUnknown("row-3"),
        unknownIncorrect("row-4")
      ]);

    });

    it('should not fail, when a correctResponse is missing', function(){
      component.correctResponse.pop();

      var answers = [
        correctAnswer("row-1"),
        incorrectAnswer("row-2"),
        correctAnswer("row-3"),
        incorrectAnswer("row-4")
      ];

      showFeedback = false;
      var response = createOutcome(component, answers);

      response.correctness.should.eql("incorrect");
      response.correctClass.should.eql("partial");
      response.score.should.eql(0.2);
      response.feedback.should.eql("Almost!");
      response.correctnessMatrix.should.eql([
        correctUnknown("row-1"),
        unknownIncorrect("row-2"),
        correctUnknown("row-3")
      ]);
    });
  });

});