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

  return null if !fb?

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
  if fb?
    fb.correct = false
    fb
  else
    null

buildFeedback = (question, answer, settings, isCorrect) ->
  out = []

  if isCorrect
    if settings.showCorrectResponse || settings.showUserResponse
      crFb = correctResponseFeedback(question, true)
      out.push(crFb) if crFb?
  else
    if settings.showCorrectResponse
      crFb = correctResponseFeedback(question, false)
      out.push(crFb) if crFb?

    if settings.showUserResponse
      userFb = userResponseFeedback(question, answer)
      out.push(userFb) if userFb?
  out

###
Create a response to the answer based on the question, the answer and the respond settings
###
exports.respond = (question, answer, settings) ->

  answerIsCorrect = answer.value == question.correctResponse.value

  response =
    correctness: if answerIsCorrect then "correct" else "incorrect"
    score: if answerIsCorrect then 1 else 0

  response.feedback = buildFeedback(question, answer, settings, answerIsCorrect) if settings.showFeedback


  response