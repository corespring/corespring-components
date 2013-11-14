var ckeditor, main;

main = [

   function () {
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
            scope.model.config.orientation = scope.model.config.orientation || "vertical";
            scope.feedback = {};
            scope.correctValue = scope.fullModel.correctResponse;
            scope.scoreMapping = {};
            scope.model.scoringType = scope.model.scoringType || "standard";
            _.each(model.scoreMapping, function (v,k) {
              scope.scoreMapping[k] = String(v);
            });
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

            _.each(scope.model.choices, function (c) {
              c.labelType = c.labelType || "text";
            });
            return console.log(model);
          },

          getModel: function () {
            var model = _.cloneDeep(scope.fullModel);
            model.scoreMapping = {};
            _.each(scope.scoreMapping, function(v,k) {
              model.scoreMapping[k] = Number(v);
            });
            model.correctResponse = scope.correctValue;
            _.each(model.model.choices, function (choice) {
              var feedback = scope.feedback[choice.value];
              if (feedback) {
                model.feedback.push( {
                  isDefault: feedback.feedbackType == 'standard',
                  feedback: feedback.feedback,
                  value: choice.value
                });
              }
            });
            console.log("getting model: ", model);

            return model;
          }
        };

        scope.$watch('correctValue', function (value) {
          scope.fullModel.correctResponse = value;
          return console.log(scope.model);
        }, true);

        scope.registerConfigPanel(attrs.id, scope.containerBridge);

        scope.removeQuestion = function (q) {
          scope.model.choices = _.filter(scope.model.choices, function (cq) {
            return cq !== q;
          });
          return null;
        };

        scope.addQuestion = function () {
          var id = ""+scope.model.choices.length;
          scope.model.choices.push({
            value: id,
            label: "new Question",
            labelType: "text"
          });
          scope.feedback[id] = {feedbackType: 'standard'};
        };

        scope.toChar = function (num) {
          return String.fromCharCode(65 + num);
        };

      },
      template: [
        '<div class="view-inline-choice">',
        '<label>Prompt:</label>',
        '<textarea ng-ic-ckeditor ng-model="model.prompt"></textarea><br/>',
        '<div class="choice" ng-repeat="q in model.choices">',
        '  <div class="remove-button" ng-click="removeQuestion(q)">X</div>',
        '  <table>',
        '    <tr>',
        '      <td>',
        '        <div class="correct-block">',
        '          <span class="correct-label">Correct</span><br/>',
        '          <input type="radio" value="{{q.value}}" ng-model="$parent.correctValue" ></input>',
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
        '     <td><select ng-model="scoreMapping[ch.value]"><option value="-1">-1</option><option value="0">0</option><option value="1">1</option></select></td>',
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
    return {
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
        ngModel.$render = function (value) {
          ck.setData(ngModel.$viewValue);
        };
      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [{directive: main}, {name: 'ngIcCkeditor', directive: ckeditor } ];

