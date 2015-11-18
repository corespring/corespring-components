var main = [
  '$sce',
  'CsUndoModel',
  function($sce, CsUndoModel) {

    var link = function(scope, element, attrs) {

      var log = console.log.bind(console, '[select-text]');

      scope.undoModel = new CsUndoModel();
      scope.undoModel.setGetState(getState);
      scope.undoModel.setRevertState(revertState);

      var $theContent = null;

      function getState(){
        return {};
      }

      function revertState(state) {
        
      }

      var getNestedProperty = function(obj, key) {
        return key.split(".").reduce(function(o, x) {
          return (typeof o == "undefined" || o === null) ? o : o[x];
        }, obj);
      };

      var classifyTokens = function(choices, tokenClass) {
        if (choices.length > 0) {
          for (var i = choices.length - 1; i >= 0; i--) {
            var $match = $theContent.find('.cs-token:eq("' + choices[i] + '"):not(.' + tokenClass + ')');
            if ($match.length === 1) {
              $match.addClass(tokenClass);
            }
          }
        }
      };

      var bindTokenEvents = function() {
        $theContent.off('click', '.cs-token');
        $theContent.on('click', '.cs-token', function() {
          var $token = $(this);
          var index = $theContent.find('.cs-token').index($token);
          if (scope.editable) {
            if (scope.model.config.availability === "specific") {
              if ($token.hasClass('choice') && !$token.hasClass('selected')) {
                $token.addClass('selected');
                scope.userChoices.push(index);
              } else if ($token.hasClass('choice') && $token.hasClass('selected')) {
                $token.removeClass('selected');
                _.remove(scope.userChoices, function(val) {return val !== index;});
              }
            } else {
              $token.toggleClass('selected');
              if ($token.hasClass('selected')) {
                scope.userChoices.push(index);
              } else {
                _.remove(scope.userChoices, function(val) {return val !== index;});
              }
            }
          }
        });
      };

      function setDataAndSession(dataAndSession) {
        // log("Setting data for Select Text: ", dataAndSession);
        scope.model = dataAndSession.data.model;
        scope.userChoices = [];
        $theContent = element.find('.select-text-content');
        bindTokenEvents();
        if (scope.model.config.availability === "specific" && getNestedProperty(scope, 'model.choices')) {
          classifyTokens(scope.model.choices, "choice");
        }
      }

      function getSession() {
        return {
          answers: scope.userChoices
        };
      }

      function setResponse(response) {
        log("Setting response", response);
        scope.feedback = response.feedback.message;
        scope.correctClass = response.correctClass;
      }

      function setMode(newMode) {}

      function reset() {
        scope.feedback = undefined;
        scope.correctClass = undefined;
        scope.userChoices = [];
        $theContent.find('.selected').removeClass('selected');
      }

      function isAnswerEmpty() {
        return _.isEmpty(getSession().answers);
      }

      function answerChangedHandler() {}

      function editable(e) {
        scope.editable = e;
      }

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setResponse: setResponse,
        setMode: setMode,
        reset: reset,
        isAnswerEmpty: isAnswerEmpty,
        answerChangedHandler: answerChangedHandler,
        editable: editable
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: [
        '<div class="cs-select-text">',
        '  <div class="select-text-label" ng-show="model.config.label" ng-bind-html-unsafe="model.config.label"></div>',
        '  <div class="action-buttons">',
        '    <span cs-undo-button-with-model></span>',
        '    <span cs-start-over-button-with-model></span>',
        '  </div>',
        '  <div class="select-text-content" ng-class="{specific: model.config.availability === \'specific\', blocked: !editable}" ng-bind-html-unsafe="model.config.passage"></div>',
        '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
