var main = [
  '$timeout',
  function($timeout) {

    function designTemplate() {
      return [
        '<p class="intro">',
        '  In Placement Ordering, a student is asked to sequence events or inputs in a specific order by dragging',
        '  the answers to a placement area.',
        '</p>',
        '<table class="choice-columns"><tr>',
        '  <td>',
        '    <input class="prompt" type="text" ng-model="model.config.choiceAreaLabel"',
        '      placeholder="Enter a label or leave blank"/>',
        '    <ul class="sortable-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="choicesProxy">',
        '      <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in choicesProxy" ng-click="itemClick($event)"',
        '        ng-dblclick="activate($index)">',
        '        <div class="blocker" ng-hide="active[$index]">',
        '          <div class="bg"></div>',
        '          <div class="content">',
        '            <img class="drag-icon" src="../../images/hand-grab-icon.png"/>',
        '            <div class="title">Double Click to Edit</div>',
        '          </div>',
        '        </div>',
        '        <div class="delete-icon">',
        '          <i ng-click="deleteChoice($index)" class="fa fa-times-circle"></i>',
        '        </div>',
        '        <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
        '        <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz features="extraFeatures"',
        '          parent-selector=".editor-container"',
        '          placeholder="Enter choice and/or add an image or math code."',
        '          image-service="imageService" />',
        '      </li>',
        '    </ul>',
        '    <button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>',
        '  </td>',
        '  <td>',
        '    <input class="prompt" type="text" ng-model="model.config.answerAreaLabel"',
        '      placeholder="Enter a label or leave blank" />',
        '    <div class="draggable-choices-container">',
        '      <ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="targets">',
        '        <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in targets">',
        '          <div class="delete-icon">',
        '            <i ng-click="deleteTarget($index)" class="fa fa-times-circle"></i>',
        '          </div>',
        '          <span ng-bind-html-unsafe="choice.label"></span>',
        '        </li>',
        '      </ul>',
        '     <div class="zero-state" ng-show="targets.length == 0">',
        '       Drag and order correct answers here.',
        '     </div>',
        '   </div>',
        '  </td>',
        '</tr></table>',
        '<label>',
        '  <input type="checkbox" ng-model="model.config.shuffle" />',
        '  Shuffle tiles',
        '</label>'
      ].join('\n');
    }

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function ($scope, $element, $attrs) {

        function initTargets() {
          $scope.targets = _.map($scope.fullModel.correctResponse, function(id) {
            return _.find($scope.choicesProxy, function(choice) {
              return choice.id === id;
            });
          });
        }

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;
            $scope.choicesProxy = _.cloneDeep($scope.model.choices);
            initTargets();
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          }
        };

        $scope.sortableOptions = {
          placeholder: "app",
          connectWith: ".draggable-choices"
        };


        $scope.targetSortableOptions = (function() {
          var copying = false;

          function isCopy(ui) {
            return ui.sender !== null;
          }
          function containsChoice(ui) {
            return isCopy(ui) && _.contains($scope.fullModel.correctResponse, ui.item.data('choiceId'));
          }

          return {
            placeholder: "app",
            connectWith: ".draggable-choices",
            receive: function(event, ui) {
              if (containsChoice(ui)) {
                ui.item.sortable.cancel();
              }
            },
            update: function(event, ui) {
              if (isCopy(ui)) {
                copying = true;
                ui.item.sortable.cancel();
              }
            },
            stop: function() {
              if (!copying) {
                $scope.pushChoiceUpdates();
              }
              copying = false;
            }
          };
        })();

        $scope.activate = function($index) {
          $scope.active[$index] = true;
          $('.sortable-choices', $element).sortable("disable");
        };

        $scope.itemClick = function($event) {
          function isField($event) {
            return $($event.target).parents('.mini-wiggi-wiz').length !== 0;
          }
          $event.stopPropagation();
          $event.preventDefault();
          if (!isField($event)) {
            $scope.deactivate();
          }
        };

        $scope.deactivate = function() {
          $scope.active = _.map($scope.model.choices, function() { return false; });
          $('.sortable-choices', $element).sortable("enable");
          $scope.choicesProxy = _.map($scope.choicesProxy, function(choice) {
            choice.id = _.isEmpty(choice.id) ? choice.label.toLowerCase().replace(/ /g, '-') : choice.id;
            return choice;
          });
          $scope.$emit('mathJaxUpdateRequest');
        };

        $scope.addChoice = function() {
          $scope.choicesProxy.push({content: "", label: ""});
          $scope.pushChoiceUpdates();
        };

        $scope.deleteChoice = function(index) {
          var choice = $scope.choicesProxy.splice(index, 1);
          var deletedChoiceId = choice[0].id;
          $scope.fullModel.correctResponse = _.filter($scope.fullModel.correctResponse, function(responseId) {
            return responseId !== deletedChoiceId;
          });
          $scope.pushChoiceUpdates();
        };

        $scope.deleteTarget = function(index) {
          $scope.targets.splice(index, 1);
        };

        $scope.adjustListHeights = function() {
          $timeout(function() {
            $('.sorted-choices', $element).css('height', $('.sortable-choices', $element).css('height'));
          }, 200);
        };

        $scope.pushChoiceUpdates = function() {
          $scope.model.choices = _.cloneDeep($scope.choicesProxy);
          initTargets();
        };

        $scope.$watchCollection('model.choices', function() {
          $scope.adjustListHeights();
        });

        $scope.$watchCollection('targets', function() {
          var newOrder = _.pluck($scope.targets, 'id');
          $scope.fullModel.correctResponse = newOrder;
        });

        $scope.$watch('choicesProxy', function(oldValue, newValue) {
          function isLabelChange() {
            return _.chain(oldValue).find(function(oldChoice) {
              var newChoice = _.find(newValue, function(newChoice) {
                return newChoice.id === oldChoice.id;
              });
              return newChoice && (newChoice.label !== oldChoice.label);
            }).value() !== undefined;
          }
          if (isLabelChange()) {
            $scope.pushChoiceUpdates();
          } else {
            console.log('not label change');
          }
        }, true);

        $scope.init = function() {
          $scope.active = [];
          $scope.adjustListHeights();
          $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
        };

        $scope.init();
      },
      template: [
        '<div class="placement-ordering-config" ng-click="deactivate()">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
               designTemplate(),
        '    </div>',
        '    <div navigator-panel="Scoring">',
        '      TODO',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];

