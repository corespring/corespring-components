componentDefinition =
  framework: "angular"
  directive: ["$compile", "CorespringContainer", ($compile, CorespringContainer) ->
    console.log "corespring/drag-and-drop"
    input = (attrs) ->
      "<div class=\"col-lg-4\">" + "  <input type=\"text\" class=\"form-control\" " + attrs + ">" + "</div>"

    inputs = input("ng-model=\"c.content\" ng-model-onblur") + input("ng-model=\"c.id\" ng-model-onblur")
    template = """
       <p>
          Shuffle:
          <input type="checkbox" ng-model="model.config.shuffle"></input>
         <br/>
         <br/>
         <textarea rows="2" cols="60" ng-model="model.prompt" ng-model-onblur></textarea>
         <br/>
         <table>
           <tr ng-repeat="c in model.choices">
             <td>
               #{inputs}
               <button class="btn btn-xs" ng-click="remove(c)">X</button>
             </td>
            </tr>
         </table>
         <br/>
         <button class="btn" ng-click="add()">Add</button>
       </p>
      """
    
    restrict: "E"
    scope: "isolate"
    template: template
    link: ($scope, element, attrs) ->
      $scope.containerBridge =
        setModel: (model) ->
          $scope.model = model

        getAnswer: ->
          console.log "returning answer for: Drag and drop"
          {}

      CorespringContainer.register attrs["id"], $scope.containerBridge
      $scope.remove = (c) ->
        $scope.model.choices = _.filter($scope.model.choices, (existing) ->
          existing isnt c
        )

      $scope.add = ->
        $scope.model.choices.push
          id: "" + $scope.model.choices.length
          content: "new choice"

  ]