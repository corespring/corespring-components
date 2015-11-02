/* global exports */
var main = [
  'ChoiceTemplates',
  '$timeout',
  '$animate',
  function(ChoiceTemplates, $timeout, $animate) {
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
      '       <div class="passage-wrapper">',
      '         <div class="history-buttons">',
      '           <span cs-undo-button ng-class="{disabled: choicesHistory.length < 1}" ng-disabled="choicesHistory.length < 1"></span>',
      '           <span cs-start-over-button ng-class="{disabled: choicesHistory.length < 1}" ng-disabled="choicesHistory.length < 1"></span>',
      '         </div>',
      '         <div class="passage-preview" ng-bind-html-unsafe="model.config.xhtml"></div>',
      '       </div>',
      '       <div class="pull-left answer-summary" ng-show="model.config.availability === \'specific\'">',
      '         <button class="btn btn-default" ng-class="{\'active btn-primary\': selectionMode}"',
      '           ng-click="changeSelectionMode(false)">Selections Available</button> <span id="possible-count" class="badge">{{model.possibleChoices.length}}</span>',
      '       </div>',
      '       <div class="pull-right answer-summary">',
      '         <button class="btn btn-default" ng-class="{\'active btn-primary\': !selectionMode}" ng-show="model.config.availability === \'specific\'"' ,
      '           ng-click="changeSelectionMode(true)" ng-disabled="model.possibleChoices.length === 0">Correct Answers</button> <span ng-show="model.config.availability === \'all\'">Correct Answers</span> <span id="answers-count" class="badge">{{model.choices.length}}</span>',
      '       </div>',
      '     </div>',
      '     <div ng-show="mode === \'delete\'">',
      '       <div class="alert alert-danger" role="alert">',
      '         <h4>Are you sure?</h4>',
      '         <p>This will permanently delete the passage and any set of answers.</p>',
      '         <p>',
      '           <button class="btn btn-danger" ng-click="deleteAll()">Yes</button>',
      '           <button class="btn btn-default" ng-click="toggleMode($event, \'editor\')">No</button>',
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

      var blastOptions = {
        customClass: 'token'
      };

      var $theContent = null;
      var ignoreChanges = false;
      var initialChoices = [];

      $scope.mode = "editor";
      $scope.selectionMode = true;
      $scope.choicesHistory = [];

      var classifyTokens = function(collection, tokenClass) {
        if (collection.length > 0) {
          for (var i = collection.length - 1; i >= 0; i--) {
            var $matches = $theContent.find('.token:contains("' + collection[i].data + '"):not(.' + tokenClass + ')');
            if ($matches.length === 1) {
              $matches.addClass(tokenClass);
            } else if ($matches.length > 1) {
              if (collection[i].index) {
                for (var j = $matches.length - 1; j >= 0; j--) {
                  if ($theContent.find('.token').index($matches[j]) === collection[i].index) {
                    $($matches[j]).addClass(tokenClass);
                    break;
                  }
                }
              } else {
                $($matches[0]).addClass(tokenClass);
              }
            }
          }
        }
      };

      var getNestedProperty = function(obj, key) {
        return key.split(".").reduce(function(o, x) {
          return (typeof o == "undefined" || o === null) ? o : o[x];
        }, obj);
      };

      var blastThePassage = function() {
        blastOptions.delimiter = getNestedProperty($scope, 'model.config.selectionUnit') ? $scope.model.config.selectionUnit : 'word';
        // Removes any existing tokens
        $theContent.blast(false);
        // Tokenize the content
        $theContent.blast(blastOptions);
        // Render existing choices
        if ($scope.model.config.availability === "specific") {
          classifyTokens($scope.model.possibleChoices, "possible");
        }
        classifyTokens($scope.model.choices, "selected");
      };

      var toggleSelectionMode = function(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (newValue === "specific") {
            if ($scope.model.choices.length > 0) {
              $scope.model.possibleChoices = _.cloneDeep($scope.model.choices);
              $scope.model.choices = [];
            }
          } else {
            $scope.model.possibleChoices = [];
          }
          blastThePassage();
        }
      };

      var deleteItemFromCollection = function(collection, text, index) {
        _.remove(collection, function(item) {
          return item.data === text || item.index === index;
        });
      };

      var bindTokenEvents = function() {
        $theContent.off('click', '.token');
        $theContent.on('click', '.token', function() {
          var $token = $(this);
          var index = index = $theContent.find('.token').index($token);
          if ($scope.model.config.availability === "specific") {
            if ($theContent.hasClass('select-possible')) {
              if ($token.hasClass('possible') && !$token.hasClass('selected')) {
                $token.addClass('selected');
                $scope.model.choices.push({
                  data: $token.text(),
                  index: index
                });
              } else if ($token.hasClass('possible') && $token.hasClass('selected')) {
                $token.removeClass('selected');
                deleteItemFromCollection($scope.model.choices, $token.text(), index);
              }
            } else {
              $token.toggleClass('possible');
              if ($token.hasClass('possible')) {
                // Adds a new possible choice
                $scope.model.possibleChoices.push({
                  data: $token.text(),
                  index: index
                });
              } else {
                deleteItemFromCollection($scope.model.possibleChoices, $token.text(), index);
                if ($token.hasClass('selected')) {
                  deleteItemFromCollection($scope.model.choices, $token.text(), index);
                  $token.removeClass('selected')
                }
              }
            }
          } else {
            $token.toggleClass('selected');
            if ($token.hasClass('selected')) {
              // Adds a new choice
              $scope.model.choices.push({
                data: $token.text(),
                index: index
              });
            } else {
              deleteItemFromCollection($scope.model.choices, $token.text(), index);
            }
          }
        });
      };

      var handleChoicesChange = function(newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal) && !ignoreChanges) {
          $scope.choicesHistory.push({
            choices: _.cloneDeep(oldVal[0]),
            possibleChoices: _.cloneDeep(oldVal[1]),
            selectionUnit: oldVal[2],
            availability: oldVal[3]
          });
        } else if (ignoreChanges) {
          blastThePassage();
          ignoreChanges = false;
        }
      };

      $scope.containerBridge = {
        setModel: function (model) {
          $scope.fullModel = model;
          $scope.model = $scope.fullModel.model;
          $theContent = $element.find('.passage-preview');
          bindTokenEvents();
          $timeout(function() {
            blastThePassage();
          }, 100);
          initialChoices = {
            choices: _.cloneDeep($scope.model.choices),
            possibleChoices: _.cloneDeep($scope.model.possibleChoices),
            selectionUnit: $scope.model.config.selectionUnit,
            availability: $scope.model.config.availability
          };
        },
        getModel: function () {
          var model = _.cloneDeep($scope.fullModel);
          return model;
        }
      };

      var animateBadge = function(nv, ov, badgeSelector) {
        if (nv !== ov) {
          var c = nv > ov ? 'grow' : 'shrink';
          var badge = $element.find(badgeSelector);
          $animate.addClass(badge, c, function() {
            $timeout(function() { $animate.removeClass(badge, c); });
          });
        }
      };

      $scope.$watch('model.config.selectionUnit', blastThePassage);
      $scope.$watch('model.config.xhtml', blastThePassage);
      $scope.$watch('model.config.availability', toggleSelectionMode)
      $scope.$watch('model.choices.length', function(newValue, oldValue) {
        animateBadge(newValue, oldValue, "#answers-count");
      });
      $scope.$watch('model.possibleChoices.length', function(newValue, oldValue) {
        animateBadge(newValue, oldValue, "#possible-count");
      });
      $scope.$watch('[model.choices,model.possibleChoices,model.config.selectionUnit,model.config.availability]', handleChoicesChange, true);

      $scope.toggleMode = function($event, mode) {
        $scope.mode = mode;
        if (mode === "answers") {
          blastThePassage();
        }
      };

      $scope.toggleSelectionUnit = function($event) {
        var unit = $($event.currentTarget).data('unit');
        $scope.model.config.selectionUnit = unit;
        // Clean the answers
        $scope.model.choices = [];
        $scope.model.possibleChoices = [];
      };

      $scope.changeSelectionMode = function(areAnswers) {
        $scope.selectionMode = !areAnswers;
        $theContent.toggleClass('select-possible', !$scope.selectionMode);
      };

      $scope.deleteAll = function() {
        $scope.model.config.label = "";
        $scope.model.config.selectionUnit = "word";
        $scope.model.config.availability = "all";
        $scope.model.config.xhtml = "";
        $scope.model.choices = [];
        $scope.mode = "editor";
      };

      $scope.undo = function() {
        if ($scope.choicesHistory.length > 0) {
          var lastRecord = $scope.choicesHistory.pop();
          $scope.model.choices = lastRecord.choices;
          $scope.model.possibleChoices = lastRecord.possibleChoices;
          $scope.model.config.selectionUnit = lastRecord.selectionUnit;
          $scope.model.config.availability = lastRecord.availability;
          ignoreChanges = true;
        }
      };

      $scope.startOver = function() {
        if (!_.isEmpty(initialChoices)) {
          $scope.model.choices = initialChoices.choices;
          $scope.model.possibleChoices = initialChoices.possibleChoices;
          $scope.choicesHistory = [];
          $scope.model.config.selectionUnit = initialChoices.selectionUnit;
          $scope.model.config.availability = initialChoices.availability;
          ignoreChanges = true;
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
