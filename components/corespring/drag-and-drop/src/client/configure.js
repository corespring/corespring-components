var main = [
    "$compile", function($compile) {
      var input, inputs, template;
      console.log("corespring/drag-and-drop");
      input = function(attrs, label) {
        return "<div style=\"margin-bottom: 20px\"> <input type=\"text\" class=\"form-control\" style=\"width: 80%; display: inline-block \"" + attrs + " />" + "</div>";
      };

      inputs = input("ng-model=\"c.content\" ng-model-onblur") + input("ng-model=\"c.id\" ng-model-onblur");
      var inputHolder = function(header, body) {
          return [
            '<div class="input-holder">',
            ' <div class="header">'+header+'</div>',
            ' <div class="body">',
            body,
            ' </div>',
            '</div>'
          ].join("");
      };

      var choiceArea = function() {
        return [
        '<ol class="drag-and-drop-choices" >',
        '<li ng-repeat="c in model.choices" class="col-lg-4" >',
          input("ng-model=\"c.content\" ", "<label>{{letter($index)}}</label>"),
        '</li>',
        '</ol>',
        '<div class="clearfix"></div>',
        '  <button class=\"btn\" ng-click=\"add()\">Add</button>'

        ].join("");
      }

      template = 
            ['<p>',
            inputHolder('Prompt', '<textarea ck-editor rows=\"2\" cols=\"60\" ng-model=\"model.prompt\"></textarea>'),
            inputHolder('Choices', choiceArea()),
            '   Shuffle:',
            '   <input type=\"checkbox\" ng-model=\"model.config.shuffle\"></input>',
            '  <br/>',
            '</p>',
            ''].join('\n'); 

     return {
        restrict: "E",
        scope: "isolate",
        template: template,
        link: function($scope, element, attrs) {
          $scope.containerBridge = {
            setModel: function(model) {
              $scope.fullModel = model;
              $scope.model = $scope.fullModel.model;
              console.log(model);
            },
            getAnswer: function() {
              console.log("returning answer for: Drag and drop");
              return {};
            }
          };

          $scope.registerConfigPanel(attrs.id, $scope.containerBridge);


          $scope.letter = function(idx) {
            return String.fromCharCode(65 + idx);
          };

          $scope.remove = function(c) {
            $scope.model.choices = _.filter($scope.model.choices, function(existing) {
              return existing !== c;
            });
          };

          $scope.add = function() {
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
    {directive: main}
];  