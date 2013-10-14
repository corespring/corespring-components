var ckeditor, componentDefinition, main;

main = [
  'CorespringContainer', function (CorespringContainer) {
    var def;
    def = {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function (scope, element, attrs) {
        scope.containerBridge = {
          setModel: function (model) {
            scope.fullModel = model;
            scope.model = scope.fullModel.model;
            scope.feedback = {};
            scope.correctMap = {};
            scope.model.scoringType = scope.model.scoringType || "standard";
            _.each(model.feedback, function (feedback) {
              var choice = _.find(model.model.choices, function (choice) {
                return choice.value === feedback.value;
              });
              if (choice) {
                scope.feedback[choice.value] = {
                  feedback: feedback.feedback,
                  feedbackType: feedback.isDefault ? "standard" : "custom"
                };
              }
            });
            _.each(scope.fullModel.correctResponse.value, function (cr) {
              scope.correctMap[cr] = true;
            });
            _.each(scope.model.choices, function (c) {
              c.labelType = c.labelType || "text";
            });
            return console.log(model);
          },

          getModel: function () {
            var correctAnswers, model;
            model = _.cloneDeep(scope.fullModel);
            correctAnswers = [];
            _.each(scope.correctMap, function (v, k) {
              if (v) {
                correctAnswers.push(k);
              }
            });
            model.correctResponse.value = correctAnswers;
            model.model.config.singleChoice = correctAnswers.length === 1;
            _.each(model.model.choices, function (choice) {
              var feedback, _ref, _ref1;
              feedback = _.find(model.feedback, function (fb) {
                return fb.value === choice.value;
              });
              if (feedback) {
                feedback.feedback = (_ref = scope.feedback[choice.value]) != null ? _ref.feedback : void 0;
                feedback.isDefault = ((_ref1 = scope.feedback[choice.value]) != null ? _ref1.feedbackType : void 0) === "standard";
              }
            });

            return model;
          }
        };

        scope.$watch('correctMap', function (value) {
          var res;
          res = [];
          _.each(value, function (v, k) {
            if (v) {
              return res.push(k);
            }
          });
          scope.fullModel.correctResponse.value = res;
          console.log(scope.fullModel.correctResponse.value);
          scope.model.config.singleChoice = res.length === 1;
          return console.log(scope.model);
        }, true);

        CorespringContainer.registerConfigPanel(attrs["id"], scope.containerBridge);

        scope.removeQuestion = function (q) {
          scope.model.choices = _.filter(scope.model.choices, function (cq) {
            return cq !== q;
          });
          return null;
        };
        scope.addQuestion = function () {
          return scope.model.choices.push({
            label: "new Question"
          });
        };
        scope.initIsCorrect = function () {
        };
        scope.toChar = function(num) {
          return String.fromCharCode(65 + num);
        }
        return scope.initIsCorrect();
      },
      template: [
        '<div class="view-multiple-choice">',
        '<label>Prompt: </label>',
        '<textarea ng-ckeditor ng-model="model.prompt"></textarea><br/>',
        '<div class="choice" ng-repeat="q in model.choices">',
        '  <div class="remove-button" ng-click="removeQuestion(q)">X</div>',
        '  <table>',
        '    <tr>',
        '      <td>',
        '        <div class="correct-block">',
        '          <span class="correct-label">Correct</span><br/>',
        '          <input type="checkbox" ng-model="correctMap[q.value]"></input>',
        '        </div>',
        '      </td>',
        '     <td>{{toChar($index)}}</td>',
        '      <td>',
        '        <select ng-model="q.labelType">',
        '          <option value="text">Text</option>',
        '          <option value="image">Image</option>',
        '        </select>',
        '      </td>',
        '      <td>',
        '        <div ng-switch="q.labelType">',
        '          <textarea ng-switch-when="text" ng-model="q.label"></textarea>',
        '          <span ng-switch-when="image">',
        '           <label>Image: </label>',
        '           <input type="text" ng-model="q.imageName"></input>',
        '          </span>',
        '        </div>',
        '      </td>',
        '    </tr>',
        '  </table>',
        '  <label>Student Feedback: </label>',
        '  <input type="radio" ng-model="feedback[q.value].feedbackType" value="standard">Standard</input>',
        '  <input type="radio" ng-model="feedback[q.value].feedbackType" value="custom">Custom</input>',
        '  <div ng-show="feedback[q.value].feedbackType == \'custom\'">',
        '    <label>Feedback: </label><input type="text" ng-model="feedback[q.value].feedback"></input>',
        '  </div>',
        '</div>',
        '<a ng-click="addQuestion()">Add</a>',
        '<div class="well">',
        ' <input type="checkbox" ng-model="model.config.shuffle"></input> <label>Shuffle Distractors</label>',
        ' <table> ',
        ' <tr> ',
        ' <td> Layout: ',
        ' <td> <input type="radio" value="vertical" ng-model="model.config.layout"></input><td>A<br/>B<br/>C<br/>D',
        ' <td> <input type="radio" value="horizontal" ng-model="model.config.layout"></input><td>A B C D',
        ' <td> <input type="radio" value="tile" ng-model="model.config.layout"></input><td>A B<br/>C D',
        ' </table>',
        '</div>',
        '<div>',
        ' <p>Scoring:</p>',
        ' <p>',
        '   <input type="radio" ng-model="model.scoringType" value="standard"></input> <label>Standard</label>',
        '   <input type="radio" ng-model="model.scoringType" value="custom"></input> <label>Custom</label>',
        ' </p>',
        ' <table ng-show="model.scoringType==\'custom\'">',
        '   <tr>',
        '   <th>Distractor Choice</th>',
        '   <th>Points If Selected</th>',
        '   <tr ng-repeat="ch in model.choices">',
        '     <td>{{toChar($index)}}</td>',
        '     <td><select><option>-1</option><option>0</option><option>1</option></select></td>',
        '   </tr>',
        ' </table>',
        '</div',
        '</div>'
      ].join("")
    };
    return def;
  }
];

ckeditor = [
  function () {
    var def;
    return def = {
      require: '?ngModel',
      link: function (scope, elm, attr, ngModel) {
        var ck;
        ck = CKEDITOR.replace(elm[0], {
          toolbar: [
            ['Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo'],
            ['Bold', 'Italic', 'Underline'],
            ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
            ['Image']
          ],
          height: '100px'
        });
        if (!ngModel) return;
        ck.on('pasteState', function () {
          return scope.$apply(function () {
            ngModel.$setViewValue(ck.getData());
          });
        });
        return ngModel.$render = function (value) {
          ck.setData(ngModel.$viewValue);
        };
      }
    };
  }
];

componentDefinition = {
  framework: 'angular',
  directives: [
    {directive: main},
    {name: 'ngCkeditor', directive: ckeditor }
  ]
};
