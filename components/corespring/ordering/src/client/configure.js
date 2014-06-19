/* global com */
var main = [
  '$sce',
  '$log',
  '$http',
  'ChoiceTemplates',
  'ImageUtils',
  'ServerLogic',
  function($sce, $log, $http, ChoiceTemplates, ImageUtils, ServerLogic) {

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
        '  <li class="sortable-choice" ng-repeat="choice in model.choices" ng-click="itemClick($event)"',
        '    ng-dblclick="activate($index)">',
        '    <div class="blocker" ng-hide="active[$index]">',
        '      <div class="bg"></div>',
        '      <div class="content">',
        '        <img class="drag-icon" src="../../images/hand-grab-icon.png"/>',
        '        <div class="title">Double Click to Edit</div>',
        '      </div>',
        '    </div>',
        '    <div class="delete-icon">',
        '      <i ng-click="deleteChoice($index)" class="fa fa-times-circle"></i>',
        '    </div>',
        '    <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
        '    <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz="" features="extraFeatures"',
        '      parent-selector=".editor-container"',
        '      image-service="imageService" />',
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
      link: function($scope, $element, $attrs) {
        var log = $log.debug.bind($log, '[ordering-interaction-config] - ');
        var server = ServerLogic.load('corespring-ordering');

        $scope.defaultNotChosenFeedback = {
          correct: server.DEFAULT_CORRECT_FEEDBACK,
          partial: server.DEFAULT_PARTIAL_FEEDBACK,
          incorrect: server.DEFAULT_INCORRECT_FEEDBACK
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

        $scope.activate = function($index) {
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

        ChoiceTemplates.extendScope($scope);

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);

      },
      template: [
        '<div class="view-ordering-config" choice-template-controller="" ng-click="deactivate()">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        designTemplate(),
        '    </div>',
        '    <div navigator-panel="Scoring">',
        '      <div>',
        ChoiceTemplates.wrap(undefined, ChoiceTemplates.scoring()),
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
