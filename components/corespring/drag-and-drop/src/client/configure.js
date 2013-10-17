var componentDefinition;

componentDefinition = {
  framework: "angular",
  directive: [
    "$compile", "CorespringContainer", function($compile, CorespringContainer) {
      var input, inputs, template;
      console.log("corespring/drag-and-drop");
      input = function(attrs) {
        return "<div class=\"col-lg-4\">" + "  <input type=\"text\" class=\"form-control\" " + attrs + ">" + "</div>";
      };
      inputs = input("ng-model=\"c.content\" ng-model-onblur") + input("ng-model=\"c.id\" ng-model-onblur");
      template = "<p>\n   Shuffle:\n   <input type=\"checkbox\" ng-model=\"model.config.shuffle\"></input>\n  <br/>\n  <br/>\n  <textarea rows=\"2\" cols=\"60\" ng-model=\"model.prompt\" ng-model-onblur></textarea>\n  <br/>\n  <table>\n    <tr ng-repeat=\"c in model.choices\">\n      <td>\n        " + inputs + "\n        <button class=\"btn btn-xs\" ng-click=\"remove(c)\">X</button>\n      </td>\n     </tr>\n  </table>\n  <br/>\n  <button class=\"btn\" ng-click=\"add()\">Add</button>\n</p>";
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

          CorespringContainer.registerConfigPanel(attrs.id, $scope.containerBridge);

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
  ]
};
