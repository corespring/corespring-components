/* global com */
var main = [
  '$sce',
  '$log',
  '$http',
  'ChoiceTemplates',
  'ImageUtils',
  'ServerLogic',
  'ComponentImageService',
  function($sce, $log, $http, ChoiceTemplates, ImageUtils, ServerLogic, ComponentImageService) {

    var placeholderText = {
      selectedFeedback: function(attribute) {
        var message = {
          correct: 'correct',
          partial: 'partially correct',
          incorrect: 'incorrect'
        };
        return 'Enter feedback to display if ' + message[attribute] + '.';
      },
      noFeedback: 'No feedback will be presented to the student.'
    };

    function feedback(options) {
      var correctness = options.attribute;
      return [
        '<div class="well" ng-show="feedbackOn">',
        '  <div feedback-selector',
        '    fb-sel-label="' +  options.header + '"',
        '    fb-sel-class="' + correctness + '"',
        '    fb-sel-feedback-type="model.feedback.' + correctness + '.feedbackType"',
        '    fb-sel-custom-feedback="model.feedback.' + correctness + '.notChosenFeedback"',
        '    fb-sel-default-feedback="{{defaultNotChosenFeedback.' + correctness + '}}">',
        '  </div>',
        '</div>'
      ].join('\n');
    }

    function designTemplate() {
      return [
        '<p class="info">In Ordering, a student is asked to sequence events or inputs in a specific order.</p>',
        '<p class="info">',
        '  Drag and drop your choices to set the correct order. The student view will display the choices in ',
        '  randomized order.',
        '</p>',
        '<ul class="sortable-choices" ui-sortable="" ng-model="model.choices">',
        '  <li class="sortable-choice" ng-repeat="choice in model.choices" ng-click="itemClick($event)">',
        '    <div class="blocker" ng-hide="active[$index]">',
        '      <div class="bg"></div>',
        '      <div class="content">',
        '        <ul class="edit-controls">',
        '          <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
        '            <i ng-click="activate($index, $event)" class="fa fa-pencil"></i>',
        '          </li>',
        '          <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
        '            <i ng-click="deleteChoice($index)" class="fa fa-trash-o"></i>',
        '          </li>',
        '        </ul>',
        '      </div>',
        '    </div>',
        '    <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
        '    <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz="" features="extraFeatures"',
        '      parent-selector=".editor-container"',
        '      image-service="imageService()">',
        '      <edit-pane-toolbar alignment="bottom">',
        '        <div class="btn-group pull-right">',
        '          <button ng-click="closePane()" class="btn btn-sm btn-success" style="float:right;">Done</button>',
        '        </div>',
        '      </edit-pane-toolbar>',
        '    </div>',
        '  </li>',
        '</ul>',
        '<button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>',
        '<table>',
        '  <tr>',
        '    <td colspan="6" style="text-align: left">',
        '      <div ng-click="feedbackOn = !feedbackOn" class="feedback-label"><i class="fa fa-{{feedbackOn ? \'minus\' : \'plus\'}}-square-o"></i> Feedback</div>',
        feedback({
          header: "If ordered correctly, show:",
          attribute: 'correct'
        }),
        feedback({
          header: "If partially ordered correctly, show:",
          attribute: 'partial'
        }),
        feedback({
          header: "If ordered incorrectly, show:",
          attribute: 'incorrect'
        }),
        '      </div>',
        '    </td>',
        '  </tr>',
        '</table>',
        '<div summary-feedback-input ng-model="fullModel.comments"></div>'
      ].join('\n');
    }

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      controller: ['$scope',
        function($scope) {
          $scope.imageService = function() {
            return ComponentImageService;
          };
        }
      ],
      link: function($scope, $element, $attrs) {

        ChoiceTemplates.extendScope($scope, 'corespring-ordering');

        var log = $log.debug.bind($log, '[ordering-interaction-config] - ');

        $scope.defaultNotChosenFeedback = {
          correct: $scope.defaultCorrectFeedback,
          incorrect: $scope.defaultIncorrectFeedback,
          partial: $scope.defaultPartialFeedback
        };

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.fullModel.partialScoring = $scope.fullModel.partialScoring || [];
            $scope.model = $scope.fullModel.model;
            $scope.deactivate();
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          }
        };

        $scope.deleteChoice = function(index) {
          $scope.model.choices.splice(index, 1);
        };

        $scope.activate = function($index, $event) {
          $event.stopPropagation();
          $scope.active[$index] = true;
          $('.sortable-choices', $element).sortable("disable");
          angular.element($('.sortable-choices .mini-wiggi-wiz', $element)[$index]).scope().focusCaretAtEnd();
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
          $scope.active = _.map($scope.model.choices, function() {
            return false;
          });
          $('.sortable-choices', $element).sortable("enable");
          $scope.$emit('mathJaxUpdateRequest');
        };

        $scope.addChoice = function() {
          $scope.model.choices.push({
            content: "",
            label: ""
          });
        };

        $scope.$watch('model', function(oldValue, newValue) {
          if (oldValue.choices !== newValue.choices) {
            $scope.model.correctResponse = _.pluck(newValue.choices, 'id');
          }
        }, true);

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);

      },
      template: [
        '<div class="view-ordering-config" ng-click="deactivate()">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        designTemplate(),
        '    </div>',
        '    <div navigator-panel="Scoring">',
        '      <div>',
        ChoiceTemplates.scoring(),
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
