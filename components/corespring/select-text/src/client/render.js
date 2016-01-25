exports.framework = 'angular';
exports.directive = [
  '$sce',
  '$timeout',
  'CsUndoModel',
  function(
    $sce,
    $timeout,
    CsUndoModel
  ) {

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

      var log = console.log.bind(console, '[select-text]');
      var $theContent = null;

      scope.undoModel = new CsUndoModel();
      scope.undoModel.setGetState(getState);
      scope.undoModel.setRevertState(revertState);

      scope.answersVisible = false;
      scope.toggleAnswersVisibility = toggleAnswersVisibility;

      scope.containerBridge = {
        answerChangedHandler: answerChangedHandler,
        editable: editable,
        getSession: getSession,
        isAnswerEmpty: isAnswerEmpty,
        reset: reset,
        setDataAndSession: setDataAndSession,
        setInstructorData: setInstructorData,
        setMode: setMode,
        setResponse: setResponse
      };

      scope.$watch('userChoices', watchUserChoices, true);
      scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      //------------------------------------------------------------------------


      function getState() {
        return scope.userChoices;
      }

      function revertState(state) {
        scope.userChoices = state;
      }

      function getNestedProperty(obj, key) {
        return key.split(".").reduce(function(o, x) {
          return (typeof o === 'undefined' || o === null) ? o : o[x];
        }, obj);
      }

      function classifyTokens(collection, tokenClass) {
        $theContent.find('.cs-token').each(function(index,choice){
          if(_.contains(collection, index)){
            $(choice).addClass(tokenClass);
          } else {
            $(choice).removeClass(tokenClass);
          }
        });
      }

      function bindTokenEvents() {
        $theContent.off('click', '.cs-token');
        $theContent.on('click', '.cs-token', onClickToken);
      }

      function onClickToken() {
        if (!scope.editable) {
          return;
        }
        var $token = $(this);
        var index = $theContent.find('.cs-token').index($token);
        var alreadyAnAnswer = scope.userChoices.indexOf(index) >= 0;
        var canSelectMore = scope.model.config.maxSelections === 0 ||
          scope.model.config.maxSelections > 0 &&
          scope.userChoices.length < scope.model.config.maxSelections;

        if (alreadyAnAnswer) {
          scope.userChoices.splice(scope.userChoices.indexOf(index), 1);
        } else if (canSelectMore) {
          scope.userChoices.push(index);
        }

        scope.undoModel.remember();
      }

      function setDataAndSession(dataAndSession) {
        // log("Setting data for Select Text: ", dataAndSession);
        scope.model = dataAndSession.data.model;
        scope.userChoices = [];
        $theContent = element.find('.select-text-content');
        bindTokenEvents();

        if (dataAndSession.session && dataAndSession.session.answers) {
          scope.userChoices = _.map(dataAndSession.session.answers, function(answer){
            return parseInt(answer, 10);
          });
        }

        $timeout(initUi, 100);
      }

      function initUi() {
        if (getNestedProperty(scope, 'model.choices')) {
          classifyTokens(scope.model.choices, 'choice');
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

        if (response.warningClass) {
          scope.warningClass = response.warningClass;
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
        scope.warningClass = undefined;
        scope.userChoices = [];
        $theContent.find('.cs-token').attr('class', 'cs-token');
        scope.answersVisible = false;
        initUi();
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

      function toggleAnswersVisibility() {
        scope.answersVisible = !scope.answersVisible;

        if (scope.answersVisible) {
          $theContent.find('.choice').removeClass('choice');
          classifyTokens(scope.unselectedAnswers, 'correct-not-selected');
        } else {
          $theContent.find('.correct-not-selected').removeClass('correct-not-selected');
          classifyTokens(scope.model.choices, 'choice');
        }
      }

      function watchUserChoices(newValue, oldValue) {
        if (newValue !== oldValue && (!_.isEmpty(newValue) || !_.isEmpty(oldValue))) {
          classifyTokens(scope.userChoices, 'selected');
        }
      }
    }

    function template() {
      return [
        '<div class="corespring-select-text">',
        '  <div class="action-buttons" ng-hide="correctClass === \'correct\'">',
        '    <span cs-undo-button-with-model ng-show="editable"></span>',
        '    <span cs-start-over-button-with-model ng-show="editable"></span>',
        '    <button ',
        '       class="btn btn-success answers-toggle" ',
        '       ng-show="correctClass === \'partial\' || correctClass === \'incorrect\'" ',
        '       ng-click="toggleAnswersVisibility()">',
        '      <i class="fa" ng-class="{\'fa-eye\': !answersVisible, \'fa-eye-slash\': answersVisible}"></i> ',
        '      <span ng-show="!answersVisible">Show</span>',
        '      <span ng-show="answersVisible">Hide</span> Correct Answer(s)',
        '    </button>',
        '  </div>',
        '  <div class="select-text-content" ',
        '     ng-class="{blocked: !editable, \'show-answers\': answersVisible, \'no-more-selections\': model.config.maxSelections > 0 && (userChoices.length >= model.config.maxSelections)}" ',
        '     ng-bind-html-unsafe="model.config.passage"',
        '  ></div>',
        '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}} {{warningClass}}"></div>',
        '</div>'
      ].join("\n");
    }
  }
];