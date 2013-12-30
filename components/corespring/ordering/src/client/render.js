exports.framework = 'angular';

var main = [ '$compile', '$log', function ($compile, $log) {

  var link = function (scope, element, attrs) {

    var layoutChoices = function (choices, order) {
      var ordered = _(order).map(function (v) {
        return _.find(choices, function (c) {
          return c.value == v;
        });
      }).filter(function (v) {
          return v;
      }).value();
      var missing = _.difference(choices, ordered);
      return _.union(ordered, missing);
    };

    var shuffleChoices = function(choices) {
      return _.shuffle(choices);
    };

    var stashOrder = function (choices) {
      return _.map(choices, function (c) {
        return c.value;
      });
    };

    var updateUi = function () {
      var model = scope.model;
      var stash = scope.session.stash = scope.session.stash || {};
      if (stash.shuffledOrder && model.config.shuffle) {
        scope.choices = layoutChoices(model.choices, stash.shuffledOrder)
      } else if (model.config.shuffle) {
        scope.choices = shuffleChoices(model.choices)
        stash.shuffledOrder = stashOrder(scope.choices);
        scope.$emit('saveStash', attrs.id, stash);
      } else {
        scope.choices = _.cloneDeep(scope.question.choices);
      }
    };

    scope.editable = true;

    scope.containerBridge = {
      setDataAndSession: function (dataAndSession) {
        $log.debug("Ordering setting session: ", dataAndSession);

        scope.model = dataAndSession.data.model;
        scope.session = dataAndSession.session || {};

        updateUi();
      },

      getSession: function () {
        var answer = _.map(scope.model.choices, function (c) {
          return c.value;
        });
        var stash = (scope.session && scope.session.stash) ? scope.session.stash : {};

        return {
          answers: answer,
          stash: stash
        };

      },

      setResponse: function (response) {
        console.log("Setting response: ", response);
        scope.feedback = response.feedback;
      },

      setMode: function (newMode) {
      },

      reset: function () {
        scope.resetChoices(scope.rawModel);
      },

      isAnswerEmpty: function () {
        return _.isEmpty(this.getSession().answers);
      },

      answerChangedHandler: function (callback) {
        scope.$watch("choices", function (newValue, oldValue) {
          if (newValue) {
            callback();
          }
        }, true);
      },

      editable: function (e) {
        scope.editable = e;
      }
    };

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

  };

  return {
    link: link,
    restrict: 'AE',
    template: [
      "<div class='view-ordering'>",
      '<ul ui-sortable="{disabled: !editable}" ng-model="choices">',
      '<li ng-repeat="choice in choices">',
      '<div class="choice" ng-class="{true:\'correct\', false:\'incorrect\'}[feedback[choice.value].correct]">{{choice.label}} </div>',
      '</li>',
      '</ul>',
      "</div>"
    ].join("")
  };
}];
exports.directives = [
  { directive: main }
];
