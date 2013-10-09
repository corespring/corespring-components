_ = require('lodash')

exports.render = (element) ->
  element.choices = _.map element.choices, (e) ->
    label: e.label,
    value : e.value

  delete element.points
  delete element.correctResponse
  delete element.feedback

  element

feedbackByValue = (q, v) -> _.find q.feedback, (f) -> f.value == v

correctResponseFeedback = (fbArray, q, userGotItRight, answer) ->

  for correctKey in q.correctResponse.value
    fb = feedbackByValue(q, correctKey)

    if userGotItRight
      delete fb.notChosenFeedback
    else
      if _.indexOf(answer, correctKey) == -1
        nc = fb.notChosenFeedback
        delete fb.notChosenFeedback
        fb.feedback = nc
      else
        delete fb.notChosenFeedback

    fb.correct = true
    fbArray.push(fb)

exports.isCorrect = (answer, correctAnswer) ->
  diff = _.difference answer, correctAnswer
  diff2 = _.difference correctAnswer, answer
  diff.length == 0 and diff2.length == 0

isCorrectChoice = (q, choice) -> _.indexOf(q.correctResponse.value, choice) != -1

userResponseFeedback = (fbArray, q, answer) ->

  for userChoice in answer
    fb = feedbackByValue(q, userChoice)
    fb.correct = isCorrectChoice(q, userChoice)
    delete fb.notChosenFeedback if fb.correct
    fbArray.push(fb)

buildFeedback = (question, answer, settings, isCorrect) ->
  out = []

  if isCorrect
    if settings.highlightCorrectResponse || settings.highlightUserResponse
      correctResponseFeedback(out, question, true, answer)
  else
    if settings.highlightCorrectResponse
      correctResponseFeedback(out, question, false, answer)

    if settings.highlightUserResponse
      userResponseFeedback(out, question, answer)
  out

calculateScore = (question, answer) ->
  maxCorrect = question.correctResponse.value.length
  wrongAnswers = _.without.apply(null, [question.correctResponse.value].concat(answer))
  correctCount = Math.max(question.correctResponse.value.length - wrongAnswers.length, 0)
  rawScore =  correctCount / maxCorrect
  Math.round( rawScore * 100 ) / 100

###
Create a response to the answer based on the question, the answer and the respond settings
###
exports.respond = (question, answer, settings) ->

  throw "Error - the uids must match" if(question._uid != answer._uid)

  answerIsCorrect = @isCorrect(answer, question.correctResponse.value)

  response =
    correctness: if answerIsCorrect then "correct" else "incorrect"
    score: calculateScore(question, answer)
  response.feedback = buildFeedback(question, answer, settings, answerIsCorrect) if settings.showFeedback

  response