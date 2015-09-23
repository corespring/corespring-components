/* global exports */
var main = [
  'ChoiceTemplates',
  function(ChoiceTemplates) {
    "use strict";
    var designPanel = [
      '<div class="container-fluid">',
      '  <div class="row">',
      '    <div class="col-xs-8">',
      '     <div mini-wiggi-wiz="" ng-model="model.config.label" placeholder="Passage label (optional)" core-features="bold italic" features=""></div>',
      '    </div>',
      '    <div class="col-xs-4">',
      '      <div class="btn-group btn-group-sm btn-group-justified" role="group">',
      '        <div class="btn-group btn-group-sm" role="group">',
      '          <button type="button" class="btn btn-default active">Edit Passage</button>',
      '        </div>',
      '        <div class="btn-group btn-group-sm" role="group">',
      '          <button type="button" class="btn btn-default">Set Answers</button>',
      '        </div>',
      '        <div class="btn-group btn-group-sm" role="group">',
      '          <button type="button" class="btn btn-default">Delete</button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '     <wiggi-wiz ng-show="mode == \'editor\'" ng-model="model.config.xhtml">',
      '       <toolbar basic="bold italic underline superscript subscript" positioning="justifyLeft justifyCenter justifyRight" formatting="" media=""></toolbar>',
      '     </wiggi-wiz>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <div feedback-panel>',
      '        <div feedback-selector',
      '            fb-sel-label="If correct, show"',
      '            fb-sel-class="correct"',
      '            fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '            fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '            fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '        </div>',
      '        <div feedback-selector',
      '            fb-sel-label="If partially correct, show"',
      '            fb-sel-class="partial"',
      '            fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '            fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '            fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '        </div>',
      '        <div feedback-selector',
      '            fb-sel-label="If incorrect, show"',
      '            fb-sel-class="incorrect"',
      '            fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '            fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '            fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    var link = function ($scope, $element, $attrs) {

      ChoiceTemplates.extendScope($scope, 'corespring-select-text');

      $scope.mode = 'editor';

      $scope.containerBridge = {
        setModel: function (model) {
          $scope.fullModel = model;
          $scope.model = $scope.fullModel.model;
        },
        getModel: function () {
          var model = _.cloneDeep($scope.fullModel);
          return model;
        }
      };

      $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
    };

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      link: link,
      template: [
        '<div class="cs-select-text-config">',
        '  <div navigator-panel="Design">',
        designPanel,
        '  </div>',
        '  <div navigator-panel="Scoring">',
        ChoiceTemplates.scoring(),
        '  </div>',
        '</div>'
      ].join("")
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
