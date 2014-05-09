exports.framework = 'angular';

var main = ['$compile', '$log',
  function($compile, $log) {

    var link = function(scope, element, attrs) {

      var layoutChoices = function(choices, order) {
        var ordered = _(order).map(function(v) {
          return _.find(choices, function(c) {
            return c.value === v;
          });
        }).filter(function(v) {
          return v;
        }).value();
        var missing = _.difference(choices, ordered);
        return _.union(ordered, missing);
      };

      var shuffleChoices = function(choices) {
        return _.shuffle(choices);
      };

      var stashOrder = function(choices) {
        return _.map(choices, function(c) {
          return c.value;
        });
      };

      var updateUi = function() {
        var model = scope.model;
        var stash = scope.session.stash = scope.session.stash || {};
        if (stash.shuffledOrder && model.config.shuffle) {
          scope.choices = layoutChoices(model.choices, stash.shuffledOrder);
        } else if (model.config.shuffle) {
          scope.choices = shuffleChoices(model.choices);
          stash.shuffledOrder = stashOrder(scope.choices);
          scope.$emit('saveStash', attrs.id, stash);
        } else {
          scope.choices = _.cloneDeep(scope.model.choices);
        }
      };

      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          $log.debug("Ordering setting session: ", dataAndSession);

          scope.model = dataAndSession.data.model;
          scope.session = dataAndSession.session || {};

          updateUi();
          scope.originalChoices = _.cloneDeep(scope.choices);
        },

        getSession: function() {
          var answer = _.map(scope.choices, function(c) {
            return c.value;
          });
          var stash = (scope.session && scope.session.stash) ? scope.session.stash : {};

          return {
            answers: answer,
            stash: stash
          };

        },

        setResponse: function(response) {
          console.log("Setting response: ", response);
          scope.feedback = response.feedback;
        },

        setMode: function(newMode) {},

        reset: function() {
          scope.resetChoices();
          scope.feedback = undefined;
        },

        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function(callback) {
          scope.$watch("choices", function(newValue, oldValue) {
            if (newValue) {
              callback();
            }
          }, true);
        },

        editable: function(e) {
          scope.editable = e;
          if (scope.editable) {
            $('.choices', element).attr('ui-sortable', '');
          }
          $compile(element.contents())(scope);
        }
      };

      scope.containerBridge.editable(true);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      scope.resetChoices = function() {
        scope.choices = _.cloneDeep(scope.originalChoices);
      };

    };

    return {
      link: link,
      restrict: 'AE',
      scope: {},
      template: [
        '<div class="view-ordering">',
        '  <div class="prompt" ng-bind-html-unsafe="model.prompt"></div> ',
        '  <ul class="choices" ng-model="choices">',
        '    <li ng-repeat="choice in choices">',
        '      <div class="choice" ng-class="{true:\'correct\', false:\'incorrect\'}[feedback[choice.value].correct]" ',
        '        ng-bind-html-unsafe="choice.label"> </div>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('\n')
    };
}];

exports.directives = [
  {
    directive: main
  }
];
