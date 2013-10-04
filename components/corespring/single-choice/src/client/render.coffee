link = (CorespringContainer) ->
  (scope, element, attrs) ->
    scope.answer = {}

    scope.$watch 'session', (newValue) ->
      return if !newValue?
      scope.sessionFinished = newValue.isFinished
    , true

    scope.containerBridge =
      setModel : (model) -> scope.question = model
      setAnswer: (answer) -> scope.answer = answer
      getAnswer: -> scope.answer
      setSession: (session) ->
        scope.session = session
      setResponse: (response) ->
        scope.response = response
        console.log "set response for single-choice", response
        if response.feedback
          _.each response.feedback, (fb) ->
            choice = _.find scope.question.choices, (c) -> c.value == fb.value
            choice.feedback = fb.feedback if choice?
            choice.correct = fb.correct if choice?
            console.log "choice: ", choice

    CorespringContainer.register(attrs['id'], scope.containerBridge)

main = [ 'CorespringContainer', (CorespringContainer) ->
  def =
    scope: 'isolate'
    restrict :  'E'
    replace : true
    link: link(CorespringContainer)
    template : """
    <div class="view-single-choice">
      <style>
        .view-single-choice  .feedback.incorrect {
          border: solid 1px red;
        }
        .view-single-choice  .feedback.correct {
          border: solid 1px green;
        }
      </style>
      <label>{{question.prompt}}</label>
      <div ng-repeat="o in question.choices">
        <label>{{o.label}}</label>
        <input type="radio" ng-disabled="sessionFinished" ng-value="o.label" ng-model="answer.value"></input>
        <span
          class="feedback"
          ng-class="{true:'correct', false:'incorrect'}[o.correct]"
          ng-show="o.feedback">{{o.feedback}}</span>
      </div>
      <label>{{response.correctness}}</label>
    </div>
    """
  def
]

componentDefinition =
  framework: 'angular'
  directive: main