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
        '  <button class=\"btn\" ng-click=\"addChoice()\">Add</button>'

      ].join("");
    };

    var answerArea = function () {
      return [
        '<ol class="drag-and-drop-answers" >',
        '<li ng-repeat="c in model.answers" class="col-lg-4" >',
        input('answer-popover ng-model="c"'),
        '</li>',
        '</ol>',
        '<div class="clearfix"></div>',
        '  <button class=\"btn\" ng-click=\"addAnswer()\">Add</button>'
      ].join("");
    };

    template =
      ['<div class="drag-and-drop-config-panel">',
        inputHolder('Prompt', '<textarea ck-editor rows=\"2\" cols=\"60\" ng-model=\"model.prompt\"></textarea>'),
        inputHolder('Choices', choiceArea()),
        inputHolder('Answer Area', answerArea()),
        '   Shuffle:',
        '   <input type=\"checkbox\" ng-model=\"model.config.shuffle\"></input>',
        '  <br/>',
        '</p>',
        '<a href="#" id="blob" class="btn large primary" rel="popover">hover for popover</a>',
        '</div>'].join('\n');

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

        $scope.addChoice = function () {
          $scope.model.choices.push({
            id: "" + $scope.model.choices.length,
            content: "new choice"
          });
        };

        $scope.addAnswer = function () {
          $scope.model.answers.push({
            id: "" + $scope.model.answers.length,
            textBefore: "",
            textAfter: "",
            inline: false
          });
        };

        $scope.clickAnswer = function () {
        };

      }
    };
  }
];

var answerPopoverDirective = ['$compile',
  function ($compile) {
    return {
      scope: {
        model: "=ngModel"
      },
      link: function (scope, elm, attr) {
        var formGroup = function(label, body) {
          return [
            "<div class='form-group'>",
            " <label class='col-sm-2 control-label'>"+label+"</label>",
            " <div class='col-sm-10'>",
            "   "+body,
            " </div>",
            "</div>",
          ].join("");
        };
        var html = [
          "<form class='form-horizontal'>",
          formGroup("Text Before:", "<input type='text' class='form-control' ng-model='model.textBefore'></input>"),
          formGroup("Text After:", "<input type='text' class='form-control' ng-model='model.textAfter'></input>"),
          formGroup("Inline:", "<input type='checkbox' class='form-control' ng-model='model.inline'></input>"),
          "</form>"
        ].join("");
        var compiled = $compile(html)(scope);
        $(elm).popover(
          {
            title: 'Answer Blank',
            content: compiled,
            html: true,
            placement: 'auto'
          }
        );
      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: 'answerPopover',
    directive: answerPopoverDirective
  }
];