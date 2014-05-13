var main = [
  '$sce',
  '$log',
  'ImageUtils',
  'WiggiMathJaxFeatureDef',
  function($sce, $log, ImageUtils, WiggiMathJaxFeatureDef) {
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

          $element.find('.wiggi-wiz-editable').each(function(i, el) {
            $scope.active[i] = $index === i;
            if ($index === i) {
              $(el).focus();
            }
          });
        };

        $scope.deactivate = function() {
          $scope.active = _.map($scope.model.choices, function() { return false; });
        };

        $scope.addChoice = function() {
          $scope.model.choices.push({content: "", label: ""});
        }

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);

        $scope.choiceMarkup = function(choice) {
          return $sce.trustAsHtml(choice.label);
        };
      },
      template: [
        '<div class="view-ordering-config" ng-click="deactivate()">',
        '  <p class="info">In Ordering, a student is asked to sequence events or inputs in a specific order.</p>',
        '  <p class="info">',
        '    Drag and drop your choices to set the correct order. The student view will display the choices in ',
        '    randomized order.',
        '  </p>',
        '  <input class="prompt" type="text" ng-model="model.prompt" placeholder="Enter a label or leave blank"/>',
        '  <ul ui-sortable="" ng-model="model.choices">',
        '    <li ng-repeat="choice in model.choices" ng-click="$event.stopPropagation()"',
        '      ng-dblclick="activate($index)">',
        '      <div class="delete-icon" ng-show="active[$index]">',
        '        <i ng-click="deleteChoice($index)" class="fa fa-times-circle"></i>',
        '      </div>',
        '      <div class="blocker" ng-hide="active[$index]">',
        '        <div class="bg"></div>',
        '        <div class="content">',
        '          <img class="drag-icon" src="../../images/hand-grab-icon.png"/>',
        '          <div class="title">Double Click to Edit</div>',
        '        </div>',
        '      </div>',
        '      <div class="delete-icon">',
        '        <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
        '      </div>',
        '      <span ng-hide="active[$index]" ng-bind-html="choiceMarkup(choice)"></span>',
        '      <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz features="extraFeatures"',
        '        placeholder="Enter choice and/or add an image or math code."',
        '        image-service="imageService" />',
        '    </li>',
        '  </ul>',
        '  <button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>',
        '</div>'
      ].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
    directive: main
}];
