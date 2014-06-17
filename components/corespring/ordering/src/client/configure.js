/* global com */
var main = [
  '$sce',
  '$log',
  '$http',
  'ChoiceTemplates',
  'ImageUtils',
  'WiggiMathJaxFeatureDef',
  function($sce, $log, $http, ChoiceTemplates, ImageUtils, WiggiMathJaxFeatureDef) {

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
      function inline(type, value, body, attrs) {
        return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
          '</label>'].join('\n');
      }

      return [
        '<div class="well" ng-show="feedbackOn">',
        '  <div><label>' + options.header + '</label></div>',
        '  <div>',
            inline("radio", "default", "Default Feedback", "ng-model='model.feedback." + options.attribute + ".feedbackType'"),
            inline("radio", "none", "No Feedback", "ng-model='model.feedback." + options.attribute + ".feedbackType'"),
            inline("radio", "custom", "Customized Feedback", "ng-model='model.feedback." + options.attribute + ".feedbackType'"),
        '  </div>',
        '  <div class="clearfix"></div>',
        '  <span ng-switch="model.feedback.' + options.attribute + '.feedbackType" class="choice-template-choice">',
        '    <input ng-switch-when="custom" class="form-control feedback-preview custom ' + options.attribute + '" type="text" ng-model="model.feedback.' + options.attribute + '.notChosenFeedback" placeholder="' + placeholderText.selectedFeedback(options.attribute) + '"/>',
        '    <input ng-switch-when="default" class="form-control feedback-preview ' + options.attribute + '" disabled="true" type="text" value="{{defaultNotChosenFeedback.' + options.attribute + '}}"/>',
        '    <input ng-switch-when="none" class="form-control feedback-preview nofeedback" disabled="true" type="text" placeholder="' + placeholderText.noFeedback + '"/>',
        '  </span>',
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
        '    <div class="delete-icon" ng-show="active[$index]">',
        '      <i ng-click="deleteChoice($index)" class="fa fa-times-circle"></i>',
        '    </div>',
        '    <div class="blocker" ng-hide="active[$index]">',
        '      <div class="bg"></div>',
        '      <div class="content">',
        '        <img class="drag-icon" src="../../images/hand-grab-icon.png"/>',
        '        <div class="title">Double Click to Edit</div>',
        '      </div>',
        '    </div>',
        '    <div class="delete-icon">',
        '      <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
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
                 feedback({header: "If ordered correctly, show:", attribute: 'correct'}),
                 feedback({header: "If partially ordered correctly, show:", attribute: 'partial'}),
                 feedback({header: "If ordered incorrectly, show:", attribute: 'incorrect'}),
        '      </div>',
        '    </td>',
        '  </tr>',
        '</table>',
        '<div ng-click="commentOn = !commentOn" style="margin-top: 10px"><i class="fa fa-{{commentOn ? \'minus\' : \'plus\'}}-square-o"></i><span style="margin-left: 3px">Summary Feedback (optional)</span></div>',
        '<div ng-show="commentOn">',
        '  <textarea ng-model="fullModel.comments" class="form-control" placeholder="Use this space to provide summary level feedback for this interaction."></textarea>',
        '</div>'
      ].join('\n');
    }

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function($scope, $element, $attrs) {

        var log = $log.debug.bind($log, '[ordering-interaction-config] - ');

        $scope.extraFeatures = {
          definitions: [{
            type: 'group',
            buttons: [new WiggiMathJaxFeatureDef()]
          }]
        };

        $scope.defaultNotChosenFeedback = {
          correct: 'Correct!',
          partial: 'Almost!',
          incorrect: 'Good try, but that is not the correct answer.'
        };

        $scope.imageService = {

          deleteFile: function(url) {
            $http['delete'](url);
          },
          addFile: function(file, onComplete, onProgress) {
            var url = '' + file.name;

            if (ImageUtils.bytesToKb(file.size) > 500) {
              onComplete(ImageUtils.fileTooBigError(file.size, 500));
              return;
            }

            var opts = {
              onUploadComplete: function(body, status) {
                log('done: ', body, status);
                onComplete(null, url);
              },
              onUploadProgress: function() {
                log('progress', arguments);
                onProgress(null, 'started');
              },
              onUploadFailed: function() {
                log('failed', arguments);
                onComplete({
                  code: 'UPLOAD_FAILED',
                  message: 'upload failed!'
                });
              }
            };

            var reader = new FileReader();

            reader.onloadend = function() {
              var uploader = new com.ee.RawFileUploader(file, reader.result, url, name, opts);
              uploader.beginUpload();
            };

            reader.readAsBinaryString(file);
          }
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
          $scope.$emit('mathJaxUpdateRequest');
        };

        $scope.addChoice = function() {
          $scope.model.choices.push({content: "", label: ""});
        };

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
