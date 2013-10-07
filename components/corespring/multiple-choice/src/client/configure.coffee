main = [ 'CorespringContainer', (CorespringContainer) ->
  def =
    scope: 'isolate'
    restrict: 'E'
    replace: true
    link: (scope, element, attrs) ->
      scope.containerBridge =
        setModel: (model) ->
          scope.model = model

        getAnswer: ->
          console.log "returning answer for: Drag and drop"
          {}

      CorespringContainer.register attrs["id"], scope.containerBridge

      scope.removeQuestion = (q) ->
        scope.model.choices = _.filter(scope.model.choices, (cq) -> cq != q)
        null

      scope.addQuestion = -> scope.model.choices.push( {label: "new Question"})

      scope.initIsCorrect =  ->
        if !scope.model
          return
        initialCorrectChoice = _.find(scope.model.choices, (c) -> c.isCorrect)
        scope.correctQuestion = initialCorrectChoice?.label

      scope.setIsCorrect = (correctLabel) ->
        if !scope.model
          return
        _.each scope.model.choices, (c) -> c.isCorrect = c.label == correctLabel

      scope.$watch 'correctQuestion', (newValue, oldValue) ->
        console.log "Correct Question: #{newValue}"
        scope.setIsCorrect(newValue)

      # init the ui
      scope.initIsCorrect()

    template: """
      <div>
      <label>Prompt: </label>
      <textarea ng-ckeditor ng-model="model.prompt"></textarea><br/>
      <div ng-repeat="q in model.choices">
        <label>Label: </label><input type="text" ng-model="q.label"></input>
        <label> is correct ? </label>
        <input type="radio" ng-value="q.label" ng-model="$parent.correctQuestion"></input> <a ng-click="removeQuestion(q)">remove</a>
        <label>Feedback: </label><input type="text" ng-model="q.feedback"></input>
      </div>
      <a ng-click="addQuestion()">Add</a>
      </div>
      """
  def
]

componentDefinition =
  framework: 'angular'
  directive: main
