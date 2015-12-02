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
      '           ng-click="toggleMode($event, \'answers\')" ng-disabled="model.config.passage === \'\'">Set Answers</button>',
      '        </div>',
      '        <div class="btn-group btn-group-sm" role="group">',
      '          <button type="button" class="btn btn-danger" ng-class="{active: mode === \'delete\'}"',
      '           ng-click="toggleMode($event, \'delete\')" ng-disabled="model.config.passage === \'\'">Delete</button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '     <wiggi-wiz ng-show="mode === \'editor\'" ng-model="cleanPassage">',
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
      '         <div class="passage-preview" ng-bind-html-unsafe="model.config.passage"></div>',
      '       </div>',
      '       <div class="pull-left answer-summary" ng-show="model.config.availability === \'specific\'">',
      '         <button class="btn btn-default" ng-class="{\'active btn-primary\': selectionMode}"',
      '           ng-click="changeSelectionMode(false)">Selections Available</button> <span class="badge choices-count">{{model.choices.length}}</span>',
      '       </div>',
      '       <div class="pull-right answer-summary">',
      '         <button class="btn btn-default" ng-class="{\'active btn-primary\': !selectionMode}" ng-show="model.config.availability === \'specific\'"' ,
      '           ng-click="changeSelectionMode(true)" ng-disabled="model.choices.length === 0">Correct Answers</button> <span ng-show="model.config.availability === \'all\'">Correct Answers</span> <span class="badge answers-count">{{fullModel.correctResponse.value.length}}</span>',
      '       </div>',
      '       <div class="max-selections form-inline">',
      '         <div class="form-group">',
      '           <p class="form-control-static">Maximum number of selections student is allowed to choose (optional):</p>',
      '         </div>',
      '         <div class="form-group">',
      '           <input type="number" class="form-control" ng-model="model.config.maxSelections" />',
      '         </div>',
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
        aria: false,
        customClass: 'cs-token'
      };

      var $theContent = null;
      var ignoreChanges = false;
      var passageChanged = false;
      var initialChoices = [];

      $scope.mode = "editor";
      $scope.selectionMode = true;
      $scope.choicesHistory = [];

      var getNestedProperty = function(obj, key) {
        return key.split(".").reduce(function(o, x) {
          return (typeof o === "undefined" || o === null) ? o : o[x];
        }, obj);
      };

      var getNumberOfCorrectChoices = function() {
        return getNestedProperty($scope, 'fullModel.correctResponse.value') ? $scope.fullModel.correctResponse.value.length : 0;
      };

      var cleanExistingPassage = function() {
        if (getNestedProperty($scope, 'model.config.passage')) {
          var $cleanPassage = $theContent.clone();
          $cleanPassage.find('span.' + blastOptions.customClass).each(function() {
            var innerHTML = $(this).html();
            $(this).replaceWith(innerHTML);
          });
          $scope.cleanPassage = $cleanPassage.prop('innerHTML');
          passageChanged = false;
        }
      };

      var classifyTokens = function(collection, tokenClass) {
        if (collection.length > 0) {
          for (var i = collection.length - 1; i >= 0; i--) {
            var $match = $theContent.find('.' + blastOptions.customClass + ':eq("' + collection[i] + '"):not(.' + tokenClass + ')');
            if ($match.length === 1) {
              $match.addClass(tokenClass);
            }
          }
        }
      };

      var blastThePassage = function(blastAgain) {
        if (blastAgain) {
          blastOptions.delimiter = getNestedProperty($scope, 'model.config.selectionUnit') ? $scope.model.config.selectionUnit : 'word';
          // Removes any existing tokens
          $theContent.blast(false);
          $theContent.prop('innerHTML', $scope.cleanPassage);
          // Tokenize the content
          // $theContent.blast(blastOptions);
        }
        // Clean passage classes
        $theContent.find('.' + blastOptions.customClass).attr('class', blastOptions.customClass);
        // Render existing choices
        if ($scope.model.config.availability === "specific" && getNestedProperty($scope, 'model.choices')) {
          classifyTokens($scope.model.choices, "choice");
        }
        // Render existing answers
        if (getNestedProperty($scope, 'fullModel.correctResponse.value')) {
          classifyTokens($scope.fullModel.correctResponse.value, "selected");
        }
      };

      var toggleSelectionMode = function(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (newValue === "specific") {
            if (getNestedProperty($scope, 'fullModel.correctResponse.value') && $scope.fullModel.correctResponse.value.length > 0) {
              $scope.model.choices = _.clone($scope.fullModel.correctResponse.value);
              $scope.fullModel.correctResponse.value = [];
            }
          } else {
            $scope.model.choices = [];
          }
          blastThePassage(true);
        }
      };

      var bindTokenEvents = function() {
        $theContent.off('click', '.' + blastOptions.customClass);
        $theContent.on('click', '.' + blastOptions.customClass, function() {
          var $token = $(this);
          var index = $theContent.find('.' + blastOptions.customClass).index($token);
          if ($scope.model.config.availability === "specific") {
            if ($theContent.hasClass('select-choices')) {
              if ($token.hasClass('choice') && !$token.hasClass('selected')) {
                $token.addClass('selected');
                $scope.fullModel.correctResponse.value.push(index);
              } else if ($token.hasClass('choice') && $token.hasClass('selected')) {
                $token.removeClass('selected');
                $scope.fullModel.correctResponse.value.splice($scope.fullModel.correctResponse.value.indexOf(index), 1);
              }
            } else {
              $token.toggleClass('choice');
              if ($token.hasClass('choice')) {
                // Adds a new possible choice
                $scope.model.choices.push(index);
              } else {
                $scope.model.choices.splice($scope.model.choices.indexOf(index), 1);
                if ($token.hasClass('selected')) {
                  $scope.fullModel.correctResponse.value.splice($scope.fullModel.correctResponse.value.indexOf(index), 1);
                  $token.removeClass('selected');
                }
              }
            }
          } else {
            $token.toggleClass('selected');
            if ($token.hasClass('selected')) {
              // Adds a new choice
              $scope.fullModel.correctResponse.value.push(index);
            } else {
              $scope.fullModel.correctResponse.value.splice($scope.fullModel.correctResponse.value.indexOf(index), 1);
            }
          }
          $scope.updateNumberOfCorrectResponses(getNumberOfCorrectChoices());
        });
      };

      var handleChoicesChange = function(newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal) && !ignoreChanges) {
          $scope.choicesHistory.push({
            answers: _.cloneDeep(oldVal[0]),
            choices: _.cloneDeep(oldVal[1]),
            selectionUnit: oldVal[2],
            availability: oldVal[3]
          });
        } else if (ignoreChanges) {
          blastThePassage(!_.isEqual(newVal[2], oldVal[2]) || !_.isEqual(newVal[3], oldVal[3]));
          ignoreChanges = false;
        }
      };

      $scope.containerBridge = {
        setModel: function (model) {
          $scope.fullModel = model;
          $scope.model = $scope.fullModel.model;
          $theContent = $element.find('.passage-preview .ng-binding');
          bindTokenEvents();
          $timeout(function() {
            cleanExistingPassage();
            // blastThePassage(false);
          }, 100);
          initialChoices = {
            answers: _.cloneDeep($scope.fullModel.correctResponse.value),
            choices: _.cloneDeep($scope.model.choices),
            selectionUnit: $scope.model.config.selectionUnit,
            availability: $scope.model.config.availability
          };
          $scope.updateNumberOfCorrectResponses(getNumberOfCorrectChoices());
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

      $scope.$watch('model.config.selectionUnit', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          blastThePassage(true);
        }
      });
      $scope.$watch('cleanPassage', function(newValue, oldValue) {
        if (newValue !== oldValue && oldValue !== undefined) {
          passageChanged = true;
        }
      });
      $scope.$watch('model.config.availability', toggleSelectionMode);
      $scope.$watch('fullModel.correctResponse.value.length', function(newValue, oldValue) {
        animateBadge(newValue, oldValue, ".answers-count");
      });
      $scope.$watch('model.choices.length', function(newValue, oldValue) {
        animateBadge(newValue, oldValue, ".choices-count");
      });
      $scope.$watch('[fullModel.correctResponse.value,model.choices,model.config.selectionUnit,model.config.availability]', handleChoicesChange, true);

      $scope.toggleMode = function($event, mode) {
        $scope.mode = mode;
        if (mode === "answers") {
          blastThePassage(passageChanged);
          passageChanged = false;
        }
      };

      $scope.toggleSelectionUnit = function($event) {
        var unit = $($event.currentTarget).data('unit');
        $scope.model.config.selectionUnit = unit;
        // Clean the answers
        $scope.fullModel.correctResponse.value = [];
        $scope.model.choices = [];
      };

      $scope.changeSelectionMode = function(areAnswers) {
        $scope.selectionMode = !areAnswers;
        $theContent.toggleClass('select-choices', !$scope.selectionMode);
      };

      $scope.deleteAll = function() {
        $scope.model.config.label = "";
        $scope.model.config.selectionUnit = "word";
        $scope.model.config.availability = "all";
        $scope.model.config.passage = "";
        $scope.fullModel.correctResponse.value = [];
        $scope.mode = "editor";
      };

      $scope.undo = function() {
        if ($scope.choicesHistory.length > 0) {
          var lastRecord = $scope.choicesHistory.pop();
          $scope.fullModel.correctResponse.value = lastRecord.answers;
          $scope.model.choices = lastRecord.choices;
          $scope.model.config.selectionUnit = lastRecord.selectionUnit;
          $scope.model.config.availability = lastRecord.availability;
          ignoreChanges = true;
        }
      };

      $scope.startOver = function() {
        if (!_.isEmpty(initialChoices)) {
          $scope.fullModel.correctResponse.value = initialChoices.answers;
          $scope.model.choices = initialChoices.choices;
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
