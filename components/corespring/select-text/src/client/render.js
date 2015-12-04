var main = [
  '$sce',
  'CsUndoModel',
  function($sce, CsUndoModel) {

    var link = function(scope, element, attrs) {

      var log = console.log.bind(console, '[select-text]');

      scope.undoModel = new CsUndoModel();
      scope.undoModel.setGetState(getState);
      scope.undoModel.setRevertState(revertState);
      scope.answersVisible = false;

      var $theContent = null;

      function getState() {
        return scope.userChoices;
      }

      function revertState(state) {
        scope.userChoices = state;
      }

      var getNestedProperty = function(obj, key) {
        return key.split(".").reduce(function(o, x) {
          return (typeof o === 'undefined' || o === null) ? o : o[x];
        }, obj);
      };

      var classifyTokens = function(choices, tokenClass) {
        var $existingChoices = $theContent.find('.' + tokenClass);
        var existingChoices = [];
        var removedChoices = [];
        if ($existingChoices.length > 0) {
          $existingChoices.each(function() {
            var index = $theContent.find('.cs-token').index(this);
            existingChoices.push(index);
          });
          removedChoices = _.difference(existingChoices, choices);
          choices = _.difference(choices, existingChoices);
        }
        if (removedChoices.length > 0) {
          for (var i = removedChoices.length - 1; i >= 0; i--) {
            $theContent.find('.cs-token:eq("' + removedChoices[i] + '")').removeClass(tokenClass);
          }
        }
        for (var j = choices.length - 1; j >= 0; j--) {
          var $match = $theContent.find('.cs-token:eq("' + choices[j] + '"):not(.' + tokenClass + ')');
          if ($match.length === 1) {
            $match.addClass(tokenClass);
          }
        }
      };

      var bindTokenEvents = function() {
        $theContent.off('click', '.cs-token');
        $theContent.on('click', '.cs-token', function() {
          var $token = $(this);
          var index = $theContent.find('.cs-token').index($token);
          var canSelectMore = scope.model.config.maxSelections === 0;
          var alreadyAnAnswer = scope.userChoices.indexOf(index) >= 0;
          if (scope.model.config.maxSelections > 0) {
            canSelectMore = scope.userChoices.length < scope.model.config.maxSelections;
          }
          if (scope.editable) {
            if (scope.model.config.availability === 'specific') {
              if ($token.hasClass('choice') && !alreadyAnAnswer && canSelectMore) {
                scope.userChoices.push(index);
              } else if ($token.hasClass('choice') && alreadyAnAnswer) {
                scope.userChoices.splice(scope.userChoices.indexOf(index), 1);
              }
            } else {
              if (canSelectMore && !alreadyAnAnswer) {
                scope.userChoices.push(index);
              } else if (alreadyAnAnswer) {
                scope.userChoices.splice(scope.userChoices.indexOf(index), 1);
              }
            }
            scope.undoModel.remember();
          }
        });
      };

      function setDataAndSession(dataAndSession) {
        // log("Setting data for Select Text: ", dataAndSession);
        scope.model = dataAndSession.data.model;
        scope.userChoices = [];
        $theContent = element.find('.select-text-content');
        bindTokenEvents();
        if (scope.model.config.availability === 'specific' && getNestedProperty(scope, 'model.choices')) {
          classifyTokens(scope.model.choices, 'choice');
        }
        if (dataAndSession.session && dataAndSession.session.answers) {
          scope.userChoices = _.cloneDeep(dataAndSession.session.answers);
        }
        scope.undoModel.init();
      }

      function setInstructorData(data) {
        var answers = getNestedProperty(data, 'correctResponse.value');
        if (answers) {
          classifyTokens(answers, 'correct');
        }
      }

      function getSession() {
        return {
          answers: scope.userChoices
        };
      }

      function setResponse(response) {
        // log("Setting response", response);
        scope.feedback = getNestedProperty(response, 'feedback.message');
        if (response.correctClass) {
          scope.correctClass = response.correctClass;
        }
        if (getNestedProperty(response, 'feedback.choices') && response.correctResponse) {
          var correctResponses = _.filter(response.feedback.choices, function(choice) {
            return choice.correct === true;
          });
          var incorrectResponses = _.filter(response.feedback.choices, function(choice) {
            return choice.correct === false;
          });
          var correctIndexes = _.pluck(correctResponses, 'index');
          var incorrectIndexes = _.pluck(incorrectResponses, 'index');
          scope.unselectedAnswers = _.difference(response.correctResponse, correctIndexes);
          classifyTokens(correctIndexes, 'correct');
          classifyTokens(incorrectIndexes, 'incorrect');
        }
      }

      function setMode(newMode) {}

      function reset() {
        scope.feedback = undefined;
        scope.correctClass = undefined;
        scope.userChoices = [];
        $theContent.find('.cs-token').attr('class', 'cs-token');
        scope.answersVisible = false;
        scope.undoModel.init();
      }

      function isAnswerEmpty() {
        return _.isEmpty(getSession().answers);
      }

      function answerChangedHandler(callback) {
        scope.$watch('userChoices', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            callback();
          }
        }, true);
      }

      function editable(e) {
        scope.editable = e;
      }

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setInstructorData: setInstructorData,
        setResponse: setResponse,
        setMode: setMode,
        reset: reset,
        isAnswerEmpty: isAnswerEmpty,
        answerChangedHandler: answerChangedHandler,
        editable: editable
      };

      scope.toggleAnswersVisibility = function() {
        scope.answersVisible = !scope.answersVisible;
        if (scope.answersVisible) {
          classifyTokens(scope.unselectedAnswers, 'correct-not-selected');
        } else {
          $theContent.find('.correct-not-selected').removeClass('correct-not-selected');
        }
      };

      scope.$watch('userChoices', function(newValue, oldValue) {
        if (newValue !== oldValue && (!_.isEmpty(newValue) || !_.isEmpty(oldValue))) {
          classifyTokens(scope.userChoices, 'selected');
        }
      }, true);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: [
        '<div class="cs-select-text">',
        '  <div class="select-text-label" ng-bind-html-unsafe="model.config.label"></div>',
        '  <div class="action-buttons" ng-hide="correctClass === \'correct\'">',
        '    <span cs-undo-button-with-model ng-show="editable"></span>',
        '    <span cs-start-over-button-with-model ng-show="editable"></span>',
        '    <button class="btn btn-success answers-toggle" ng-show="correctClass === \'partial\' || correctClass === \'incorrect\'" ng-click="toggleAnswersVisibility()"><i class="fa" ng-class="{\'fa-eye\': !answersVisible, \'fa-eye-slash\': answersVisible}"></i> <span ng-show="!answersVisible">Show</span><span ng-show="answersVisible">Hide</span> Correct Answer(s)</button>',
        '  </div>',
        '  <div class="select-text-content" ng-class="{specific: model.config.availability === \'specific\', blocked: !editable, \'show-answers\': answersVisible, \'no-more-selections\': model.config.maxSelections > 0 && (userChoices.length >= model.config.maxSelections)}" ng-bind-html-unsafe="model.config.passage"></div>',
        '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
