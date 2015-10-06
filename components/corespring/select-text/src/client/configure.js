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
      '      <div class="btn-group btn-group-sm btn-group-justified toggles" role="group">',
      '        <div class="btn-group btn-group-sm" role="group">',
      '          <button type="button" class="btn btn-default" ng-class="{active: mode === \'editor\'}"',
      '           ng-click="toggleMode($event, \'editor\')">Edit Passage</button>',
      '        </div>',
      '        <div class="btn-group btn-group-sm" role="group">',
      '          <button type="button" class="btn btn-default" ng-class="{active: mode === \'answers\'}"',
      '           ng-click="toggleMode($event, \'answers\')" ng-disabled="model.config.xhtml === \'\'">Set Answers</button>',
      '        </div>',
      '        <div class="btn-group btn-group-sm" role="group">',
      '          <button type="button" class="btn btn-danger" ng-class="{active: mode === \'delete\'}"',
      '           ng-click="toggleMode($event, \'delete\')" ng-disabled="model.config.xhtml === \'\'">Delete</button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '     <wiggi-wiz ng-show="mode === \'editor\'" ng-model="model.config.xhtml">',
      '       <toolbar basic="bold italic underline superscript subscript" positioning="justifyLeft justifyCenter justifyRight" formatting="" media=""></toolbar>',
      '     </wiggi-wiz>',
      '     <div ng-show="mode === \'answers\'">',
      '       <p>Students will select from:</p>',
      '       <div class="btn-group btn-group-sm" role="group">',
      '         <button type="button" class="btn btn-default" data-unit="word" ng-click="toggleSelectionUnit($event)"',
      '           ng-class="{\'active btn-primary\': model.config.selectionUnit === \'word\'}">Words</button>',
      '         <button type="button" class="btn btn-default" data-unit="sentence" ng-click="toggleSelectionUnit($event)"',
      '           ng-class="{\'active btn-primary\': model.config.selectionUnit === \'sentence\'}">Sentences</button>',
      '         <button type="button" class="btn btn-default" data-unit="paragraph" ng-click="toggleSelectionUnit($event)"',
      '           ng-class="{\'active btn-primary\': model.config.selectionUnit === \'paragraph\'}" disabled>Paragraphs</button>',
      '         <button type="button" class="btn btn-default" data-unit="custom" ng-click="toggleSelectionUnit($event)"',
      '           ng-class="{\'active btn-primary\': model.config.selectionUnit === \'custom\'}" disabled>Custom</button>',
      '       </div>',
      '       <div class="radio">',
      '         <label>',
      '           <input type="radio" ng-model="model.config.availability" value="all">',
      '           Make all selections available',
      '         </label>',
      '       </div>',
      '       <div class="radio">',
      '         <label>',
      '           <input type="radio" ng-model="model.config.availability" value="specific">',
      '           Make specific selections available',
      '         </label>',
      '       </div>',
      '       <div class="instructions" ng-show="model.config.availability === \'specific\'">',
      '         <p ng-show="selectionMode"><strong><em>Click selections to make available to students</em></strong></p>',
      '         <p ng-show="!selectionMode"><strong><em>Click correct answers</em></strong></p>',
      '       </div>',
      '       <div class="passage-preview" ng-bind-html-unsafe="model.config.xhtml"></div>',
      '       <div class="pull-left answer-summary" ng-show="model.config.availability === \'specific\'">',
      '         <button class="btn btn-default" ng-class="{\'active btn-primary\': selectionMode}"',
      '           ng-click="toggleSelectionMode()">Selections Available</button> <span class="badge">3</span>',
      '       </div>',
      '       <div class="pull-right answer-summary">',
      '         Correct Answers <span class="badge">{{model.choices.length}}</span>',
      '       </div>',
      '     </div>',
      '     <div ng-show="mode === \'delete\'">',
      '       <div class="alert alert-danger" role="alert">',
      '         <h4>Are you sure?</h4>',
      '         <p>This will permanently delete the passage and any set of answers.</p>',
      '         <p>',
      '           <button class="btn btn-danger">Yes</button>',
      '           <button class="btn btn-default">No</button>',
      '         </p>',
      '       </div>',
      '     </div>',
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
      $scope.selectionMode = true;

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

      $scope.toggleMode = function($event, mode) {
        $scope.mode = mode;
      }

      $scope.toggleSelectionUnit = function($event) {
        var unit = $($event.currentTarget).data('unit');
        $scope.model.config.selectionUnit = unit;
      }

      $scope.toggleSelectionMode = function() {
        $scope.selectionMode = !$scope.selectionMode;
      }

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
