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
          scope.feedback = {}
          scope.correctMap = {}
          _.each model.feedback, (feedback) ->
            choice = _.find model.model.choices, (choice) -> choice.value == feedback.value
            if (choice)
              scope.feedback[choice.value] =
                feedback: feedback.feedback
                feedbackType:  if (feedback.isDefault) then "standard" else "custom"
            true

          _.each model.correctResponse.value, (cr) ->
            scope.correctMap[cr] = true
            true

          console.log(model)

        getModel:  ->
          model = _.cloneDeep(scope.fullModel)
          correctAnswers = []
          _.each scope.correctMap, (v,k) ->
            correctAnswers.push(k) if (v)
            true

          model.correctResponse.value = correctAnswers
          model.model.config.singleChoice = correctAnswers.length == 1

          _.each model.model.choices, (choice) ->
            feedback = _.find model.feedback, (fb) ->
              fb.value == choice.value

            feedback.feedback = scope.feedback[choice.value]?.feedback
            feedback.isDefault = scope.feedback[choice.value]?.feedbackType == "standard"
            true

          model

      scope.$watch 'correctMap', (value) ->
        res = []
        _.each value, (v,k) ->
          res.push(k) if (v)
        scope.fullModel.correctResponse.value = res
        console.log scope.fullModel.correctResponse.value
        scope.model.config.singleChoice = res.length == 1
        console.log scope.model
      , true

      CorespringContainer.registerConfigPanel attrs["id"], scope.containerBridge

      scope.removeQuestion = (q) ->
        scope.model.choices = _.filter(scope.model.choices, (cq) -> cq != q)
        null

      scope.addQuestion = -> scope.model.choices.push( {label: "new Question"})

      scope.initIsCorrect =  ->

      # init the ui
      scope.initIsCorrect()

    template: """
      <div class="view-multiple-choice">
      <label>Prompt: </label>
      <textarea ng-ckeditor ng-model="model.prompt"></textarea><br/>
      <div class="choice" ng-repeat="q in model.choices">
        <div class='remove-button' ng-click="removeQuestion(q)">X</div>
        <table>
          <tr>
            <td>
              <div class='correct-block'>
                <span class='correct-label'>Correct</span><br/>
                <input type='checkbox' ng-model="correctMap[q.value]"></input>
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
          </tr>
        </table>
        <label>Student Feedback: </label>
        <input type='radio' ng-model='feedback[q.value].feedbackType' value='standard'>Standard</input>
        <input type='radio' ng-model='feedback[q.value].feedbackType' value='custom'>Custom</input>
        <div ng-show='feedback[q.value].feedbackType == "custom"'>
          <label>Feedback: </label><input type="text" ng-model="feedback[q.value].feedback"></input>
        </div>
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
