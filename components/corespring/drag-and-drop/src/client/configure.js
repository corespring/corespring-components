var main = [
  "$compile", function ($compile) {
    var input, inputs, template;
    console.log("corespring/drag-and-drop");
    input = function (attrs, label) {
      return "<div style=\"margin-bottom: 20px\"> <input type=\"text\" class=\"form-control\" style=\"width: 80%; display: inline-block \"" + attrs + " />" + "</div>";
    };

    var inputHolder = function (header, body) {
      return [
        '<div class="input-holder">',
        ' <div class="header">' + header + '</div>',
        ' <div class="body">',
        body,
        ' </div>',
        '</div>'
      ].join("");
    };

    var choiceArea = function () {
      return [
        '<ol class="drag-and-drop-choices" >',
        '<li ng-repeat="c in model.choices" class="col-lg-4" >',
        input("ng-model=\"c.content\" "),
        '</li>',
        '</ol>',
        '<div class="clearfix"></div>',
        '  <button class=\"btn\" ng-click=\"add()\">Add</button>'

      ].join("");
    };

    var answerArea = function () {
      return [
        '<textarea mu-editor ng-model="model.answerArea"></textarea>'
      ].join("");
    };

    template =
      ['<p>',
        inputHolder('Prompt', '<textarea ck-editor rows=\"2\" cols=\"60\" ng-model=\"model.prompt\"></textarea>'),
        inputHolder('Choices', choiceArea()),
        inputHolder('Answer Area', answerArea()),
        '   Shuffle:',
        '   <input type=\"checkbox\" ng-model=\"model.config.shuffle\"></input>',
        '  <br/>',
        '</p>',
        ''].join('\n');

    return {
      restrict: "E",
      scope: "isolate",
      template: template,
      link: function ($scope, element, attrs) {
        $scope.containerBridge = {
          setModel: function (model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;
            console.log(model);
          },
          getAnswer: function () {
            console.log("returning answer for: Drag and drop");
            return {};
          }
        };

        $scope.registerConfigPanel(attrs.id, $scope.containerBridge);

        $scope.answerArea = "Something <dummyLanding></dummyLanding> something";
        $scope.remove = function (c) {
          $scope.model.choices = _.filter($scope.model.choices, function (existing) {
            return existing !== c;
          });
        };

        $scope.add = function () {
          $scope.model.choices.push({
            id: "" + $scope.model.choices.length,
            content: "new choice"
          });
        };
      }
    };
  }
];

var dummyLanding = [
  "$compile", function ($compile) {

    return {
      restrict: "E",
      scope: "isolate",
      link: function ($scope, element, attrs) {
        $scope.containerBridge = {
          setModel: function (model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;
            console.log(model);
          },
          getAnswer: function () {
            console.log("returning answer for: Drag and drop");
            return {};
          }
        };

        $scope.registerConfigPanel(attrs.id, $scope.containerBridge);

        $scope.answerArea = "Something <div style='width: 5px; height: 5px; background-color: red'></div> something";
        $scope.remove = function (c) {
          $scope.model.choices = _.filter($scope.model.choices, function (existing) {
            return existing !== c;
          });
        };

        $scope.add = function () {
          $scope.model.choices.push({
            id: "" + $scope.model.choices.length,
            content: "new choice"
          });
        };
      }
    };
  }
];


exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];  