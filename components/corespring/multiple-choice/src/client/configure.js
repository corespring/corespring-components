var main;

var wrap = function(title, body){
  return ['<div class="input-holder">',
        '  <div class="header">' + title + '</div>',
        '  <div class="body">' + body + '</div>',
        '</div>' ].join('\n');
};

var prompt =  '<textarea ck-editor ng-model="model.prompt"></textarea><br/>';

var choices = [
        '<div class="choice" ng-repeat="q in model.choices">',
        '  <div class="remove-button" ng-click="removeQuestion(q)"><button type="button" class="close">&times;</button></div>',
        '  <table>',
        '    <tr>',
        '     <td>Choice {{toChar($index)}}</td>',
        '      <td>',
        '        <div class="correct-block">',
        '          <input type="checkbox" ng-model="correctMap[q.value]"></input>',
        '          <label class="correct-label">Correct</label>',
        '        </div>',
        '      </td>',
        '      <td>',
        '        <select ng-model="q.labelType">',
        '          <option value="text">Text</option>',
//        '          <option value="image">Image</option>',
        '          <option value="mathml">MathML</option>',
        '        </select>',
        '      </td>',
        '      <td>',
        '        <div ng-switch="q.labelType">',
        '          <textarea ng-switch-when="text" ng-model="q.label"></textarea>',
        '          <span ng-switch-when="image">',
        '           <label>Image: </label>',
        '           <input type="text" ng-model="q.imageName"></input>',
        '          </span>',
        '          <textarea ng-switch-when="mathml" ng-model="q.mathml" ng-change="updateMathJax()"></textarea>',
        '        </div>',
        '      </td>',
        '    </tr>',
        '  </table>',
        '  <div style="text-align: center; width: 100%">',
        '  <label style="margin-right: 10px">Feedback to student</label>',
        '  <input type="radio" ng-model="feedback[q.value].feedbackType" value="standard">Standard</input>',
        '  <input type="radio" ng-model="feedback[q.value].feedbackType" value="custom">Custom</input>',
        '  <div ng-show="feedback[q.value].feedbackType == \'custom\'">',
        '    <input class="form-control" type="text" ng-model="feedback[q.value].feedback" placeholder="Enter feedback to display if this choice is selected."></input>',
        '    <div ng-show="correctMap[q.value]">',
        '      <input class="form-control" type="text" ng-model="feedback[q.value].notChosenFeedback" placeholder="Enter feedback to display if this choice is not selected."></input>',
        '    </div>',
        ' </div>',
        '</div>',
        '</div>',
        '<button class=\"btn\" ng-click=\"addQuestion()\">Add a Choice</button>'
].join('\n');

var shuffle = [
       '<div class="well">',
        ' <input type="checkbox" ng-model="model.config.shuffle"></input> <label>Shuffle Distractors</label>',
        ' <table> ',
        ' <tr> ',
        ' <td> Layout: ',
        ' <td> <input type="radio" value="vertical" ng-model="model.config.orientation"></input><td>A<br/>B<br/>C<br/>D',
        ' <td> <input type="radio" value="horizontal" ng-model="model.config.orientation"></input><td>A B C D',
        ' <td> <input type="radio" value="tile" ng-model="model.config.orientation"></input><td>A B<br/>C D',
        ' </table>',
        '</div>'].join('\n');

var scoring = [
        ' <p>',
        '   <input type="radio" ng-model="model.scoringType" value="standard"></input> <label>Standard</label>',
        '   <input type="radio" ng-model="model.scoringType" value="custom"></input> <label>Custom</label>',
        ' </p>',
        ' <table ng-show="model.scoringType==\'custom\'" class="score-table">',
        '   <tr>',
        '   <th>Choice</th>',
        '   <th>Points If Selected</th>',
        '   <tr ng-repeat="ch in model.choices">',
        '     <td>{{toChar($index)}}</td>',
        '     <td><select ng-model="scoreMapping[ch.value]"><option value="-1">-1</option><option value="0">0</option><option value="1">1</option></select></td>',
        '   </tr>',
        ' </table>'
        ].join('\n');


main = [
  '$log', 'ScoringUtils',
  function ($log, ScoringUtils) {
    var def;
    def = {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function (scope, element, attrs) {

        $log.debug("scoring utils: " + ScoringUtils.sayHello(">>>>>>>>>>>>>"));
        scope.containerBridge = {
          setModel: function (model) {
            scope.fullModel = model;
            scope.model = scope.fullModel.model;
            scope.model.config.orientation = scope.model.config.orientation || "vertical";
            scope.feedback = {};
            scope.correctMap = {};
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

            _.each(scope.fullModel.correctResponse.value, function (cr) {
              scope.correctMap[cr] = true;
            });

            _.each(scope.model.choices, function (c) {
              c.labelType = c.labelType || "text";
            });
          },

          getModel: function () {
            var model = _.cloneDeep(scope.fullModel);
            var correctAnswers = [];

            _.each(scope.correctMap, function (v, k) {
              if (v) {
                correctAnswers.push(k);
              }
            });
            model.scoreMapping = {};

            _.each(scope.scoreMapping, function(v,k) {
              model.scoreMapping[k] = Number(v);
            });
            model.correctResponse.value = correctAnswers;
            model.model.config.singleChoice = correctAnswers.length === 1;

            _.each(model.model.choices, function (choice) {
              var feedback, _ref, _ref1;
              feedback = _.find(model.feedback, function (fb) {
                return fb.value === choice.value;
              });
              if (feedback) {
                feedback.feedback = (_ref = scope.feedback[choice.value]) !== null ? _ref.feedback : void 0;
                feedback.isDefault = ((_ref1 = scope.feedback[choice.value]) !== null ? _ref1.feedbackType : void 0) === "standard";
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

        scope.$watch('feedback', function(newFeedback){
          $log.debug("update feedback in components");

          var out = _.makeArray(newFeedback, "value");
          scope.fullModel.feedback = out;
        }, true);

        scope.registerConfigPanel(attrs.id, scope.containerBridge);

        scope.removeQuestion = function (q) {
          scope.model.choices = _.filter(scope.model.choices, function (cq) {
            return cq !== q;
          });
          scope.fullModel.feedback = _.filter(scope.fullModel.feedback, function(fb){
            return fb.value !== q.value;
          });

          return null;
        };

        scope.addQuestion = function () {
          var uid = _.uniqueId("mc_");

          scope.model.choices.push({
            label: "",
            value: uid,
            labelType: "text"
          });

          scope.feedback[uid] = {
            feedbackType: "standard",
            value: uid
          };

          scope.fullModel.feedback.push(scope.feedback[uid]);
        };

        scope.toChar = function (num) {
          return String.fromCharCode(65 + num);
        };

        scope.updateMathJax = function() {
          scope.$emit('mathJaxUpdateRequest');
        }


      },
      //TODO - allow the use of templates...
      //templateUrl: 'configure.html',
      template: [
        '<div class="view-multiple-choice">',
          wrap('Prompt', prompt),
          wrap('Answer Area', choices),
          wrap('Display Options', shuffle),
          wrap('Scoring', scoring),
        '</div>'
      ].join("")
    };
    return def;
  }
];

exports.framework = 'angular';
exports.directives = [
    {directive: main}
];