link = (CorespringContainer, $sce) ->
  (scope, element, attrs) ->
    scope.answer = { choices : {}}

    scope.$watch 'session', (newValue) ->
      return if !newValue?
      scope.sessionFinished = newValue.isFinished
    , true

    scope.containerBridge =
      setModel : (model) ->
        scope.question = model

      setAnswer: (answer) ->
        for key in answer
          scope.answer.choices[key] = true

      getAnswer: ->
        out = []
        for key, selected of scope.answer.choices
          out.push(key) if selected
        out

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

main = [ 'CorespringContainer', '$sce', (CorespringContainer, $sce) ->
  def =
    scope: 'isolate'
    restrict :  'E'
    replace : true
    link: link(CorespringContainer, $sce)
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
      <label ng-bind-html-unsafe="question.prompt"></label>
      <div ng-repeat="o in question.choices">
        <label>{{o.label}}</label>
        <input type="checkbox" ng-disabled="sessionFinished" name="group" ng-value="o.label" ng-model="answer.choices[o.value]"></input>
        <span
          class="cs-feedback"
          ng-class="{true:'correct', false:'incorrect'}[o.correct]"
          ng-show="o.feedback">{{o.feedback}}</span>
      </div>
    </div>
    """
  def
]

componentDefinition =
  framework: 'angular'
  directive: main