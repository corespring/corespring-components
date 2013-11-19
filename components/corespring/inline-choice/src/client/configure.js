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
            scope.scoreMapping = {};
            scope.model.scoringType = scope.model.scoringType || "standard";
            _.each(model.scoreMapping, function (v,k) {
              scope.scoreMapping[k] = String(v);
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
            console.log("getting model: ", model);

            return model;
          }
        };

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
          scope.fullModel.feedback[id] = {feedbackType: 'standard'};
        };

        scope.toChar = function (num) {
          return String.fromCharCode(65 + num);
        };

      },
      template: [
        '<div class="view-inline-choice">',
        '<label>Prompt:</label>',
        '<textarea ck-editor ng-model="model.prompt"></textarea><br/>',
        '<div class="choice" ng-repeat="q in model.choices">',
        '  <div class="remove-button" ng-click="removeQuestion(q)"><button type="button" class="close">&times;</button></div>',
        '  <table>',
        '    <tr>',
        '      <td>',
        '        <div class="correct-block">',
        '          <span class="correct-label">Correct</span><br/>',
        '          <input type="radio" value="{{q.value}}" ng-model="$parent.fullModel.correctResponse" ></input>',
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
        '  <input type="radio" ng-model="fullModel.feedback[q.value].feedbackType" value="standard">Standard</input>',
        '  <input type="radio" ng-model="fullModel.feedback[q.value].feedbackType" value="custom">Custom</input>',
        '  <div ng-show="fullModel.feedback[q.value].feedbackType == \'custom\'">',
        '    <label>Feedback: </label><input type="text" ng-model="fullModel.feedback[q.value].feedback" placeholder="Enter feedback to display if this choice is selected."></input>',
        '  </div>',
        '</div>',
        '<button class=\"btn\" ng-click=\"addQuestion()\">Add</button>',
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

exports.framework = 'angular';
exports.directives = [{directive: main}];

