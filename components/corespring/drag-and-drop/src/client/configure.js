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
        '<div class="answer-placeholder" answer-popover ng-model="c" active-popover="activePopover">Click to configure</div>',
        '</li>',
        '</ol>',
        '<div class="clearfix"></div>',
        '  <button class=\"btn\" ng-click=\"addAnswer()\">Add</button>'
      ].join("");
    };

    template =
      ['<div class="drag-and-drop-config-panel">{{active}}',
        inputHolder('Prompt', '<textarea ck-editor rows=\"2\" cols=\"60\" ng-model=\"model.prompt\"></textarea>'),
        inputHolder('Choices', choiceArea()),
        inputHolder('Answer Area', answerArea()),
        '   Shuffle:',
        '   <input type=\"checkbox\" ng-model=\"model.config.shuffle\"></input>',
        '  <br/>',
        '</p>',
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
            _.each($scope.model.answers, function (answer) {

              var correctResponse = model.correctResponse[answer.id];
              var idx = _.indexOf(_.pluck($scope.model.choices, 'id'), correctResponse);
              answer.correctResponse = String.fromCharCode(65 + idx);
            });
            console.log(model);
          },
          getModel: function () {
            var model = _.cloneDeep($scope.fullModel);
            _.each(model.model.answers, function (answer) {
              delete answer.correctResponse;
            });
            console.log(model.correctResponse);
            return model;
          },

          getAnswer: function () {
            console.log("returning answer for: Drag and drop");
            return {};
          }
        };

        $scope.$watch('model.answers', function(val) {
          if (!val) return;
          var model = $scope.fullModel;
          _.each(model.model.answers, function (answer) {
            if (!answer.correctResponse) return;
            var idx = answer.correctResponse.charCodeAt(0) - 65;
            var correctResponse = model.model.choices[idx].id;
            model.correctResponse[answer.id] = correctResponse;
          });
        }, true);

        $scope.registerConfigPanel(attrs.id, $scope.containerBridge);

        $scope.activePopover = {value: ""};

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
          $scope.model.answers = $scope.model.answers || [];
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
        model: "=ngModel",
        activePopover: "="
      },
      link: function (scope, elm, attr) {
        var formGroup = function (label, body) {
          return [
            "<div class='popover-row'>",
            " <label class='popover-label'>" + label + "</label>",
            " <div class='popover-input'>",
            "   " + body,
            " </div>",
            "</div>",
          ].join("");
        };
        var html = [
          "<form class='form-horizontal'>",
          formGroup("Text Before:", "<input type='text' class='form-control' ng-change='change()' ng-model='model.textBefore'></input>"),
          formGroup("Text After:", "<input type='text' class='form-control' ng-model='model.textAfter'></input>"),
          formGroup("Correct Response:", "<input type='text' class='form-control' ng-model='model.correctResponse'></input>"),
          formGroup("Inline:", "<input type='checkbox' ng-model='model.inline'></input>"),
          "</form>"
        ].join("");

        // We need to manually show/hide the popup as the automatic one breaks angular bindings because of some internal
        // caching mechanism
        elm.click(function () {
          var same = scope.activePopover.value == elm;
          if (scope.activePopover.value) {
            $(scope.activePopover.value).popover('destroy');
            scope.$apply(function () {
              scope.activePopover.value = undefined;
            });
          }
          if (same) return;
          var compiled = $compile(html)(scope);
          $(elm).popover(
            {
              title: 'Answer Blank',
              content: compiled,
              html: true,
              placement: 'top',
              trigger: 'manual'
            }
          );

          scope.$apply(function () {
            $(elm).popover('show');
            scope.activePopover.value = elm;
          });
        });
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