var main = [
  function() {

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

      var log = console.log.bind(console,'[select-text]');

      scope.editable = true;
      scope.resetSelection = resetSelection;
      scope.highlightSelection = highlightSelection;

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setResponse: setResponse,
        setInstructorData: setInstructorData,
        setMode: setMode,
        reset: reset,
        isAnswerEmpty: isAnswerEmpty,
        answerChangedHandler: answerChangedHandler,
        editable: editable
      };

      scope.$watch('selectedTokens', onChangeSelectedTokens);
      scope.$watch('text', onChangeText);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      //--------------------------------------------------------

      function resetSelection() {
        $(element).find('.token').each(function() {
          $(this).removeClass('correct').removeClass('incorrect');
        });
      }

      function highlightSelection(selection) {
        $(element).find('.token').each(function() {
          if (_.contains(selection, $(this).attr('id'))) {
            $(this).addClass('selected');
          } else {
            $(this).removeClass('selected');
          }
        });

        scope.selectedTokens = selection;
      }

      function onChangeSelectedTokens(newValue, oldValue) {
        if(newValue !== oldValue) {
          scope.highlightSelection(newValue || []);
        }
      }

      function onChangeText() {
        var contentElement = $(element).find('.select-text-content');
        contentElement.html(scope.text);
        contentElement.find('.token').each(function(idx, elem) {
          $(elem).click(function() {
            if (scope.editable) {
              scope.selectedTokens = _.xor(scope.selectedTokens, [$(this).attr('id')]);
              scope.$apply();
            }
          });
        });

        scope.highlightSelection(scope.selectedTokens);
      }

      function setDataAndSession(dataAndSession) {
        log("Setting data for Select Text: ", dataAndSession);
        scope.model = dataAndSession.data.model;
        scope.text = dataAndSession.data.wrappedText;
        if (dataAndSession.session) {
          scope.selectedTokens = _.cloneDeep(dataAndSession.session.answers);
        }
        scope.showFeedback = _.isUndefined(scope.model.config.showFeedback) ? true : scope.model.config.showFeedback;
      }

      function getSession() {
        return {
          answers: scope.selectedTokens
        };
      }

      function setResponse(response) {
        log("Setting response", response);
        $(element).find('.token').each(function(idx, elem) {
          var id = $(elem).attr('id');
          var feedback = (response && response.feedback.choices[id]) || {};
          if (feedback.correct === false) {
            $(elem).addClass('incorrect');
          }
          if (feedback.correct === true) {
            $(elem).addClass('correct');
          }
          if (feedback.wouldBeCorrect === true) {
            $(elem).addClass('incorrectlyNotSelected');
          }
        });

        scope.feedback = response.feedback.message;
        scope.correctClass = response.correctClass;
        scope.comments = response.comments;
      }

      function setInstructorData(data) {
        $(element).find('.token').each(function(idx, elem) {
          var id = $(elem).attr('id');
          var choice = data.correctResponse[idx];
          if (choice && choice.correct) {
            $(elem).addClass('correct');
          }
        });

      }

      function setMode(newMode) {}

      function reset() {
        scope.selectedTokens = undefined;
        scope.feedback = undefined;
        scope.correctClass = undefined;
        scope.comments = undefined;
        scope.resetSelection();
        $('.incorrectlyNotSelected').removeClass('incorrectlyNotSelected');
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
    }

    function template() {
      return [
        '<div class="view-select-text" ng-class="{true: \'enabled\', false: \'\'}[editable]">',
        '  <div class="select-text-content"></div>',
        '  <div class="clearfix"></div>',
        '  <div ng-show="feedback && showFeedback" class="feedback feedback-{{correctClass}}" ng-bind-html-unsafe="feedback"></div>',
        '  <div ng-show="comments" class="well" ng-bind-html-unsafe="comments"></div>',
        '</div>'
      ].join("");
    }
  }];

exports.framework = 'angular';
exports.directive = main;