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
      '           ng-click="toggleMode($event, \'answers\')" ng-disabled="model.cleanPassage === \'\'">Set Answers</button>',
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
      '     <div class="editor-wrapper" ng-show="mode === \'editor\'">',
      '       <div class="confirm-action" ng-hide="allowPassageEditing">',
      '         <div class="action-description">',
      '           <h4>Important</h4>',
      '           <p>If you decide to edit the passage, all the existing tokens as well as selected answers and/or possible selections will be lost.</p>',
      '           <p>Do you want to proceed?</p>',
      '           <p>',
      '             <button class="btn btn-danger" ng-click="allowPassageEditing = true">Yes</button>',
      '             <button class="btn btn-default" ng-click="toggleMode($event, \'answers\')">No</button>',
      '           </p>',
      '         </div>',
      '       </div>',
      '       <wiggi-wiz ng-model="model.cleanPassage">',
      '         <toolbar basic="bold italic underline superscript subscript" positioning="justifyLeft justifyCenter justifyRight" formatting="" media=""></toolbar>',
      '       </wiggi-wiz>',
      '     </div>',
      '     <div class="answers-config-wrapper" ng-show="mode === \'answers\'">',
      '       <div class="confirm-action" ng-show="showSelectionUnitWarning">',
      '         <div class="action-description">',
      '           <h4>Important</h4>',
      '           <p>If you change the selection unit, all the selected answers and/or possible selections will be lost.</p>',
      '           <p>Do you want to proceed?</p>',
      '           <p>',
      '             <button class="btn btn-danger" ng-click="allowSelectionUnitChange()">Yes</button>',
      '             <button class="btn btn-default" ng-click="revertSelectionUnitChange()">No</button>',
      '           </p>',
      '         </div>',
      '       </div>',
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
      '           <span cs-undo-button ng-class="{disabled: modelHistory.length < 1}" ng-disabled="modelHistory.length < 1"></span>',
      '           <span cs-start-over-button ng-class="{disabled: modelHistory.length < 1}" ng-disabled="modelHistory.length < 1"></span>',
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
      '       <div class="max-selections form-inline" ng-show="model.config.availability === \'all\'">',
      '         <div class="form-group">',
      '           <p class="form-control-static">Maximum number of selections student is allowed to choose (optional):</p>',
      '         </div>',
      '         <div class="form-group">',
      '           <input type="number" name="userMaxSelections" class="form-control" ng-model="model.config.maxSelections" min="{{fullModel.correctResponse.value.length}}" />',
      '         </div>',
      '       </div>',
      '     </div>',
      '     <div ng-show="mode === \'delete\'">',
      '       <div class="alert alert-danger" role="alert">',
      '         <h4>Are you sure?</h4>',
      '         <p>This will permanently delete the passage and any set of answers.</p>',
      '         <p>',
      '           <button class="btn btn-danger" ng-click="deleteAll()">Yes</button>',
      '           <button class="btn btn-default" ng-click="toggleMode($event, \'answers\')">No</button>',
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
      var initialData = [];

      $scope.mode = "editor";
      $scope.selectionMode = true;
      $scope.modelHistory = [];
      $scope.allowPassageEditing = true;
      $scope.showSelectionUnitWarning = false;

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
          $scope.model.cleanPassage = $cleanPassage.prop('innerHTML');
        }
      };

      var classifyTokens = function(collection, tokenClass) {
        var $existingChoices = $theContent.find('.' + tokenClass);
        var existingChoices = [];
        var removedChoices = [];
        if ($existingChoices.length > 0) {
          $existingChoices.each(function() {
            var index = $theContent.find('.' + blastOptions.customClass).index(this);
            existingChoices.push(index);
          });
          removedChoices = _.difference(existingChoices, collection);
          collection = _.difference(collection, existingChoices);
        }
        if (removedChoices.length > 0) {
          for (var i = removedChoices.length - 1; i >= 0; i--) {
            $theContent.find('.' + blastOptions.customClass + ':eq("' + removedChoices[i] + '")').removeClass(tokenClass);
          }
        }
        for (var j = collection.length - 1; j >= 0; j--) {
          var $match = $theContent.find('.' + blastOptions.customClass + ':eq("' + collection[j] + '")');
          if ($match.length === 1) {
            $match.addClass(tokenClass);
          }
        }
      };

      var blastThePassage = function() {
        blastOptions.delimiter = getNestedProperty($scope, 'model.config.selectionUnit') ? $scope.model.config.selectionUnit : 'word';
        // Removes any existing tokens
        $theContent.blast(false);
        $theContent.prop('innerHTML', $scope.model.cleanPassage);
        // Tokenize the content
        $theContent.blast(blastOptions);
        // Clean passage classes
        $theContent.find('.' + blastOptions.customClass).attr('class', blastOptions.customClass);
        $scope.model.config.passage = $theContent.prop('innerHTML');
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
            $scope.model.config.maxSelections = 0;
          }
          blastThePassage();
        }
      };

      var bindTokenEvents = function() {
        $theContent.off('click', '.' + blastOptions.customClass);
        $theContent.on('click', '.' + blastOptions.customClass, function() {
          var $token = $(this);
          var index = $theContent.find('.' + blastOptions.customClass).index($token);
          var alreadySelected = $scope.fullModel.correctResponse.value.indexOf(index) >= 0;
          var alreadyAChoice = $scope.model.choices.indexOf(index) >= 0;
          if ($scope.model.config.availability === "specific") {
            if ($theContent.hasClass('select-choices')) {
              if (alreadyAChoice && !alreadySelected) {
                $scope.fullModel.correctResponse.value.push(index);
              } else if (alreadyAChoice && alreadySelected) {
                $scope.fullModel.correctResponse.value.splice($scope.fullModel.correctResponse.value.indexOf(index), 1);
              }
            } else {
              if (!alreadyAChoice) {
                // Adds a new possible choice
                $scope.model.choices.push(index);
              } else {
                $scope.model.choices.splice($scope.model.choices.indexOf(index), 1);
                if (alreadySelected) {
                  $scope.fullModel.correctResponse.value.splice($scope.fullModel.correctResponse.value.indexOf(index), 1);
                }
              }
            }
          } else {
            if (!alreadySelected) {
              // Adds a new choice
              $scope.fullModel.correctResponse.value.push(index);
            } else {
              $scope.fullModel.correctResponse.value.splice($scope.fullModel.correctResponse.value.indexOf(index), 1);
            }
          }
          $scope.updateNumberOfCorrectResponses(getNumberOfCorrectChoices());
        });
      };

      var handleModelChange = function(newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal) && !ignoreChanges) {
          $scope.modelHistory.push({
            answers: _.cloneDeep(oldVal[0]),
            choices: _.cloneDeep(oldVal[1]),
            selectionUnit: oldVal[2],
            availability: oldVal[3],
            passage: oldVal[4]
          });
          $scope.allowPassageEditing = false; // This prevents the user from editing passage and delete the answers/selections
          if (newVal[2] !== oldVal[2]) {
            $scope.showSelectionUnitWarning = true;
          }
          if (newVal[4] !== oldVal[4]) {
            classifyTokens($scope.model.choices, 'choice');
            classifyTokens($scope.fullModel.correctResponse.value, 'selected');
            return;
          }
        } else if (ignoreChanges) {
          ignoreChanges = false;
        }
        if (newVal[1] !== oldVal[1] && (!_.isEmpty(newVal[1]) || !_.isEmpty(oldVal[1]))) {
          classifyTokens($scope.model.choices, 'choice');
        }
        if (newVal[0] !== oldVal[0] && (!_.isEmpty(newVal[0]) || !_.isEmpty(oldVal[0]))) {
          classifyTokens($scope.fullModel.correctResponse.value, 'selected');
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

      $scope.containerBridge = {
        setModel: function (model) {
          $scope.fullModel = model;
          $scope.model = $scope.fullModel.model;
          $theContent = $element.find('.passage-preview .ng-binding');
          bindTokenEvents();
          $timeout(function() {
            if ($scope.model.config.availability === "specific") {
              classifyTokens($scope.model.choices, "choice");
            }
            classifyTokens($scope.fullModel.correctResponse.value, "selected");
            if ($theContent.find('.' + blastOptions.customClass).length > 0) {
              $scope.allowPassageEditing = false;
              cleanExistingPassage();
              $scope.mode = 'answers';
            }
          }, 100);
          initialData = {
            answers: _.cloneDeep($scope.fullModel.correctResponse.value),
            choices: _.cloneDeep($scope.model.choices),
            selectionUnit: $scope.model.config.selectionUnit,
            availability: $scope.model.config.availability,
            passage: $scope.model.config.passage
          };
          $scope.updateNumberOfCorrectResponses(getNumberOfCorrectChoices());
        },
        getModel: function () {
          var model = _.cloneDeep($scope.fullModel);
          delete model.cleanPassage;
          return model;
        }
      };

      $scope.$watch('model.cleanPassage', _.debounce(function(newValue, oldValue) {
        $scope.$apply(function(){
          if (newValue !== oldValue && oldValue !== undefined) {
            $scope.model.choices = [];
            $scope.fullModel.correctResponse.value = [];
            blastThePassage();
          }
        });
      }, 1500));

      $scope.$watch('model.config.availability', toggleSelectionMode);

      $scope.$watch('fullModel.correctResponse.value.length', function(newValue, oldValue) {
        animateBadge(newValue, oldValue, ".answers-count");
        if ($scope.model.config.maxSelections > 0 && $scope.model.config.maxSelections < newValue) {
          $scope.model.config.maxSelections = newValue;
        }
      });

      $scope.$watch('model.choices.length', function(newValue, oldValue) {
        animateBadge(newValue, oldValue, ".choices-count");
      });

      $scope.$watch('[fullModel.correctResponse.value,model.choices,model.config.selectionUnit,model.config.availability,model.config.passage]', handleModelChange, true);

      $scope.$watch('model.config.maxSelections', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (newValue !== 0 && newValue < $scope.fullModel.correctResponse.value.length) {
            $scope.model.config.maxSelections = oldValue;
          }
        }
      });

      $scope.toggleMode = function($event, mode) {
        $scope.mode = mode;
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
        $scope.model.config.maxSelections = 0;
        $scope.fullModel.correctResponse.value = [];
        $scope.mode = "editor";
        $scope.allowPassageEditing = true;
      };

      $scope.allowSelectionUnitChange = function() {
        $scope.showSelectionUnitWarning = false;
        ignoreChanges = false;
        blastThePassage();
      };

      $scope.revertSelectionUnitChange = function() {
        ignoreChanges = true;
        $scope.undo();
        $scope.showSelectionUnitWarning = false;
        blastThePassage();
      };

      $scope.undo = function() {
        if ($scope.modelHistory.length > 0) {
          var lastRecord = $scope.modelHistory.pop();
          $scope.fullModel.correctResponse.value = lastRecord.answers;
          $scope.model.choices = lastRecord.choices;
          $scope.model.config.availability = lastRecord.availability;
          $scope.model.config.selectionUnit = lastRecord.selectionUnit;
          $scope.model.config.passage = lastRecord.passage;
          ignoreChanges = true;
        }
      };

      $scope.startOver = function() {
        if (!_.isEmpty(initialData)) {
          $scope.fullModel.correctResponse.value = initialData.answers;
          $scope.model.choices = initialData.choices;
          $scope.modelHistory = [];
          $scope.model.config.selectionUnit = initialData.selectionUnit;
          $scope.model.config.availability = initialData.availability;
          $scope.model.config.passage = initialData.passage;
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
