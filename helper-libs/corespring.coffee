class ArrayHelper

  constructor: ->

  orderedMatch: (a, b) -> true

  anyOrderMatch: (a, b) -> true

  contains: (a, b) -> true

class ArrayScore

  constructor: ->

  score: (a, b) ->

exports.arrays = new ArrayHelper()