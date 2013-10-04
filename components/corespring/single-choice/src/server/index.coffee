_ = require('lodash')

exports.render = (element) ->
  element.choices = _.map element.choices, (e) ->
    label: e.label,
    value : e.value

  delete element.points
  delete element.correctResponse
  delete element.feedback

  if element.configuration?
    delete element.configuration.shuffle

  element

feedbackByValue = (q, v) -> _.find q.feedback, (f) -> f.value == v

correctResponseFeedback = (q, answerIsCorrect) ->
  fb = feedbackByValue(q, q.correctResponse.value)

  if answerIsCorrect
    delete fb.notChosenFeedback
  else
    nc = fb.notChosenFeedback
    delete fb.notChosenFeedback
    fb.feedback = nc
  fb.correct = true
  fb

userResponseFeedback = (q,a) ->
  fb = feedbackByValue(q, a.value)
  fb.correct = false
  fb

buildFeedback = (question, answer, settings, isCorrect) ->
  out = []

  if isCorrect
    if settings.showCorrectResponse || settings.showUserResponse
      out.push correctResponseFeedback(question, true)
  else
    if settings.showCorrectResponse
      out.push correctResponseFeedback(question, false)

    if settings.showUserResponse
      out.push userResponseFeedback(question, answer)
  out

###
Create a response to the answer based on the question, the answer and the respond settings
###
exports.respond = (question, answer, settings) ->

  answerIsCorrect = answer.value == question.correctResponse.value

  response =
    correctness: if answerIsCorrect then "correct" else "incorrect"

  response.feedback = buildFeedback(question, answer, settings, answerIsCorrect) if settings.showFeedback

  response