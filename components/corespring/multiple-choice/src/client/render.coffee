link = (CorespringContainer, $sce) ->
  (scope, element, attrs) ->
    scope.inputType = 'checkbox'
    scope.answer = { choices: {}}

    scope.$watch 'session', (newValue) ->
      return if !newValue?
      scope.sessionFinished = newValue.isFinished
    , true

    scope.$watch 'question.config.singleChoice', (newValue) ->
      scope.inputType = if (!!newValue) then "radio" else "checkbox"


    scope.containerBridge =
      setModel: (model) ->
        scope.question = model
        scope.inputType = if (!!model.config.singleChoice) then "radio" else "checkbox"

      setAnswer: (answer) ->
        console.log("Setting answer to", answer)
        if (answer.length == 1)
          scope.answer.choice = "" + answer[0]
        else
          for key in answer
            scope.answer.choices[key] = true
        console.log(scope.answer.choices)
        console.log(scope.answer.choice)

      getAnswer: ->
        out = []
        if scope.answer.choice
          out.push(scope.answer.choice)
        else
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
            choice = _.find scope.question.choices, (c) ->
              c.value == fb.value
            choice.feedback = fb.feedback if choice?
            choice.correct = fb.correct if choice?
            console.log "choice: ", choice

    CorespringContainer.register(attrs['id'], scope.containerBridge)

main = [ 'CorespringContainer', '$sce', (CorespringContainer, $sce) ->
  def =
    scope: 'isolate'
    restrict: 'E'
    replace: true
    link: link(CorespringContainer, $sce)
    template: """
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
                            <span ng-switch="inputType">
                            <input ng-switch-when="checkbox" type="checkbox" ng-disabled="sessionFinished" name="group"
                                   ng-value="o.label" ng-model="answer.choices[o.value]"></input>
                            <input ng-switch-when="radio" type="radio" ng-disabled="sessionFinished" name="group" ng-value="o.value"
                                   ng-model="answer.choice"></input>
                            </span>

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