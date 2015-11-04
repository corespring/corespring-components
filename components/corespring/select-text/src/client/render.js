var main = [
  '$sce',
  '$timeout',
  'CsUndoModel',
  function($sce, $timeout, CsUndoModel) {

    var link = function(scope, element, attrs) {

      var log = console.log.bind(console, '[select-text]');

      scope.undoModel = new CsUndoModel();
      scope.undoModel.setGetState(getState);
      scope.undoModel.setRevertState(revertState);

      var blastOptions = {
        customClass: 'token'
      };

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

      var deleteItemFromCollection = function(collection, text, index) {
        _.remove(collection, function(item) {
          return item.data === text || item.index === index;
        });
      };

      var bindTokenEvents = function() {
        $theContent.off('click', '.token');
        $theContent.on('click', '.token', function() {
          var $token = $(this);
          var index = $theContent.find('.token').index($token);
          if (scope.model.config.availability === "specific") {
            if ($token.hasClass('choice') && !$token.hasClass('selected')) {
              $token.addClass('selected');
              scope.userChoices.push({
                data: $token.text(),
                index: index
              });
            } else if ($token.hasClass('choice') && $token.hasClass('selected')) {
              $token.removeClass('selected');
              deleteItemFromCollection(scope.userChoices, $token.text(), index);
            }
          } else {
            $token.toggleClass('selected');
            if ($token.hasClass('selected')) {
              // Adds a new choice
              scope.userChoices.push({
                data: $token.text(),
                index: index
              });
            } else {
              deleteItemFromCollection(scope.userChoices, $token.text(), index);
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
        $timeout(function() {
          blastOptions.delimiter = getNestedProperty(scope, 'model.config.selectionUnit') ? scope.model.config.selectionUnit : 'word';
          // Removes any existing tokens
          $theContent.blast(false);
          // Tokenize the content
          $theContent.blast(blastOptions);
          // Render existing choices
          if (scope.model.config.availability === "specific" && getNestedProperty(scope, 'model.choices')) {
            classifyTokens(scope.model.choices, "choice");
          }
        }, 100);
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
      }

      function isAnswerEmpty() {
        return _.isEmpty(getSession().answers);
      }

      function answerChangedHandler(callback) {
        scope.$watch("selectedTokens", function(newValue, oldValue) {
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
        '  <div class="select-text-content" ng-class="{specific: model.config.availability === \'specific\'}" ng-bind-html-unsafe="model.config.xhtml"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
