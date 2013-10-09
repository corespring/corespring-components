server = require('../../src/server')
assert = require 'assert'
should = require 'should'
_ = require 'lodash'

component =
  componentType: "corespring-multiple-choice"
  model:
    prompt: "Which of these is a vegetable?"
    config:
      orientation: "vertical"
      shuffle: true
    choices: [
      { label : "apple", value: "apple" }
      { label : "carrot", value: "carrot" }
      { label : "turnip", value: "turnip"}
    ]
  correctResponse:
    value: [ "carrot", "turnip"]
  feedback: [
    { value: "apple", feedback: "Huh?"}
    { value: "carrot", feedback: "Yes", notChosenFeedback: "This is a veggie"}
    { value: "turnip", feedback: "Yes", notChosenFeedback: "This is a veggie"}
  ]

settings = (feedback = true, userResponse = true, correctResponse = true) ->
  highlightUserResponse: userResponse
  highlightCorrectResponse: correctResponse
  showFeedback: feedback




describe 'single-choice server logic',  ->

  describe 'is correct', ->
    server.isCorrect(["1"], ["1"]).should.eql true
    server.isCorrect(["1", "2"], ["1"]).should.eql false
    server.isCorrect(["1"], ["1", "2"]).should.eql false

  describe 'respond', ->

    it 'should not show any feedback', ->
      response = server.respond(_.cloneDeep(component), ["apple"], settings(false, true, true))
      expected =
        correctness: "incorrect"
        score: 0
      response.should.eql expected

    it 'should respond to a correct answer', ->
      response = server.respond(_.cloneDeep(component), ["carrot", "turnip"], settings(true, true, true))
      expected =
        correctness: "correct"
        score: 1
        feedback: [
          { value: "carrot", feedback: "Yes", correct : true}
          { value: "turnip", feedback: "Yes", correct : true}
        ]
      response.should.eql expected

    it 'should respond to an incorrect response (show correct too)', ->
      response = server.respond(_.cloneDeep(component), ["apple"], settings(true, true, true))
      expected =
        correctness: "incorrect"
        score: 0
        feedback: [
          { value: "carrot", feedback: "This is a veggie", correct: true}
          { value: "turnip", feedback: "This is a veggie", correct: true}
          { value: "apple", feedback: "Huh?", correct: false}
        ]
      response.should.eql expected

    it 'should respond to an incorrect response (do not show correct too)', ->
      response = server.respond(_.cloneDeep(component), ["apple"], settings(true, true, false))
      expected =
        correctness: "incorrect"
        score: 0
        feedback: [
          { value: "apple", feedback: "Huh?", correct: false}
        ]
      response.should.eql expected

    it 'should respond to an incorrect response and show feedback for 1 incorrect and 1 correct', ->
      response = server.respond(_.cloneDeep(component), ["apple", "carrot"], settings(true, true, false))
      expected =
        correctness: "incorrect"
        score: 0.5
        feedback: [
          { value: "apple", feedback: "Huh?", correct: false}
          { value: "carrot", feedback: "Yes", correct: true}
        ]
      response.should.eql expected
