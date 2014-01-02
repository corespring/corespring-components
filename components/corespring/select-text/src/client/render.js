var wordRegexp = /([^<\w]|^)([\w';|&]+)()(?!>)/g;
var sentenceRegexp = /()(\|*[A-Z](?:.|\n)+?)([.?!])/g;

var link = function () {
  return function (scope, element, attrs) {

    scope.editable = true;


    var tokenize = function (inputText, regexp) {
      var idx = 0;
      var wrappedToken = inputText.replace(regexp, function (match, prefix, token, delimiter) {
        var cs = "";
        var prefixTags = "";
        var correctTokenMatch = token.match(/[|](.*)/);
        if (correctTokenMatch) {
          token = correctTokenMatch[1];
          cs = 'correct="true"';
        }
        return prefix + "<span class='token' " + cs + "id='" + (idx++) + "'>" + prefixTags + token + "</span>" + delimiter;
      });
      return wrappedToken;
    };

    scope.highlightSelection = function (selection) {
      $(element).find('.token').each(function () {
        if (_.contains(selection, $(this).attr('id')))
          $(this).addClass('selected');
        else
          $(this).removeClass('selected');
      });

      scope.selectedTokens = selection;
    };

    scope.$watch('selectedTokens', function (value) {
      console.log('selecting ', value);
      scope.highlightSelection(scope.selectedTokens || []);
    });

    scope.$watch('text', function () {
      var contentElement = $(element).find('.select-text-content');
      contentElement.html(scope.text);
      contentElement.find('.token').each(function (idx, elem) {
        $(elem).click(function () {
          if (scope.editable) {
            scope.selectedTokens = _.xor(scope.selectedTokens, [$(this).attr('id')]);
            scope.$apply();
          }
        });
      });

      scope.highlightSelection(scope.selectedTokens);
    });

    scope.containerBridge = {

      setDataAndSession: function (dataAndSession) {
        console.log("Setting data for Select Text: ", dataAndSession);
        scope.model = dataAndSession.data.model;
        scope.text = tokenize(scope.model.text, scope.model.config.selectionUnit == "sentence" ? sentenceRegexp : wordRegexp);
        if (dataAndSession.session) {
          scope.selectedTokens = _.cloneDeep(dataAndSession.session.answers);
        }
      },

      getSession: function () {
        return {
          answers: scope.selectedTokens
        };
      },

      setResponse: function (response) {
        console.log("Setting response", response);
        $(element).find('.token').each(function (idx, elem) {
          var id = $(elem).attr('id');
          var feedback = (response && response.feedback[id]) || {};
          if (feedback.correct == false) $(elem).addClass('incorrect');
          if (feedback.correct == true) $(elem).addClass('correct');
          if (feedback.wouldBeCorrect == true) $(elem).addClass('incorrectlyNotSelected');
        });

      },

      setMode: function (newMode) {
      },

      reset: function () {
      },

      isAnswerEmpty: function () {
      },

      answerChangedHandler: function (callback) {
      },

      editable: function (e) {
        scope.editable = e;
      }

    };
    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

  };
};

main = [
  function () {
    var def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: ['<div class="view-select-text" ng-class="{true: \'enabled\', false: \'\'}[editable]">',
        '<h1>{{model.prompt}}</h1>',
        '<div>{{selectedTokens}}</div>',
        '<div class="select-text-content"></div>',
        '</div>'].join("")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
