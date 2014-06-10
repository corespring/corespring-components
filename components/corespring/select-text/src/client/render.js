var link = function() {
  return function(scope, element, attrs) {

    scope.editable = true;

    scope.resetSelection = function() {
      $(element).find('.token').each(function() {
        $(this).removeClass('correct').removeClass('incorrect');
      });
    };

    scope.highlightSelection = function(selection) {
      $(element).find('.token').each(function() {
        if (_.contains(selection, $(this).attr('id'))) {
          $(this).addClass('selected');
        } else {
          $(this).removeClass('selected');
        }
      });

      scope.selectedTokens = selection;
    };

    scope.$watch('selectedTokens', function(value) {
      scope.highlightSelection(scope.selectedTokens || []);
    });

    scope.$watch('text', function() {
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
    });

    scope.containerBridge = {

      setDataAndSession: function(dataAndSession) {
        console.log("Setting data for Select Text: ", dataAndSession);
        scope.model = dataAndSession.data.model;
        scope.text = dataAndSession.data.wrappedText;
        if (dataAndSession.session) {
          scope.selectedTokens = _.cloneDeep(dataAndSession.session.answers);
        }
      },

      getSession: function() {
        return {
          answers: scope.selectedTokens
        };
      },

      setResponse: function(response) {
        console.log("Setting response", response);
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
      },

      setMode: function(newMode) {},

      reset: function() {
        scope.selectedTokens = undefined;
        scope.feedback = undefined;
        scope.correctClass = undefined;
        scope.comments = undefined;
        scope.resetSelection();
      },

      isAnswerEmpty: function() {},

      answerChangedHandler: function(callback) {},

      editable: function(e) {
        scope.editable = e;
      }

    };
    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

  };
};

var main = [

  function() {
    var def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="view-select-text" ng-class="{true: \'enabled\', false: \'\'}[editable]">',
        '  <div class="select-text-content"></div>',
        '  <div class="clearfix"></div>',
        '  <div ng-show="feedback" class="feedback feedback-{{correctClass}}" ng-bind-html-unsafe="feedback"></div>',
        '  <div ng-show="comments" class="well" ng-bind-html-unsafe="comments"></div>',
        '</div>'
      ].join("")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
