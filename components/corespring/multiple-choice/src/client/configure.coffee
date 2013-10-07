main = [ 'CorespringContainer', (CorespringContainer) ->
  def =
    scope: 'isolate'
    restrict: 'E'
    replace: true
    link: (scope, element, attrs) ->
      scope.containerBridge =
        setModel: (model) ->
          scope.model = model.model
          scope.fullModel = model
          _.each model.feedback, (feedback) ->
            choice = _.find model.model.choices, (choice) ->
              choice.value == feedback.value
            choice.feedback = feedback.feedback
            choice.feedbackType = if (feedback.isDefault) then "standard" else "custom"

          _.each model.model.choices, (choice) ->
            choice.isCorrect = _.contains(model.correctResponse.value, choice.value)
            true

          console.log(model)

        getModel:  ->
          model = _.cloneDeep(scope.fullModel)
          correctAnswers = []
          _.each model.model.choices, (choice) ->
            correctAnswers.push choice.value if (choice.isCorrect)
            feedback = _.find model.feedback, (fb) ->
              fb.value == choice.value

            feedback.feedback = choice.feedback
            feedback.isDefault = choice.feedbackType == "standard"
            true

          model.correctResponse.value = correctAnswers

          model

      CorespringContainer.registerConfigPanel attrs["id"], scope.containerBridge

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
      <div class="view-multiple-choice">
      <label>Prompt: </label>
      <textarea ng-ckeditor ng-model="model.prompt"></textarea><br/>
      <div ng-repeat="q in model.choices">
        <table>
          <tr>
            <td>
              <div class='correct-block'>
                <span class='correct-label'>Correct</span><br/>
                <input type='checkbox' ng-model="q.isCorrect"></input>
              </div>
            </td>
            <td>
              <select>
                <option>Text</option>
                <option>Image</option>
              </select>
            </td>
            <td>
              <textarea ng-model="q.label"></textarea>
            </td>
            <td>
              <a ng-click="removeQuestion(q)">remove</a>
            </td>
          </tr>
        </table>
        <label>Student Feedback: </label>
        <input type='radio' ng-model='q.feedbackType' value='standard'>Standard</input>
        <input type='radio' ng-model='q.feedbackType' value='custom'>Custom</input>
        <label>Feedback: </label><input type="text" ng-model="q.feedback"></input>
      </div>
      <a ng-click="addQuestion()">Add</a>
      </div>
      """
  def
]


ckeditor = [ ->
  def =
    require: '?ngModel'
    link: (scope, elm, attr, ngModel) ->
      ck = CKEDITOR.replace(elm[0], {
        toolbar: [
          [ 'Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo' ],
          [ 'Bold', 'Italic', 'Underline' ],
          [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]
        ],
        height: '100px'
      });

      return if (!ngModel)

      ck.on 'pasteState', ->
        scope.$apply ->
          ngModel.$setViewValue(ck.getData());

      ngModel.$render = (value) ->
        ck.setData ngModel.$viewValue
]


componentDefinition =
  framework: 'angular'
  directives : [
    { directive : main },
    { name: 'ngCkeditor', directive: ckeditor }
  ]
