var link, main;

link = function($sce, $timeout) {
  return function(scope, element, attrs) {

    scope.editable = true;
    scope.popupVisible = false;

    function layoutChoices(choices, order) {
      if (!order) {
        return shuffle(choices);
      }
      var ordered = _.map(order, function(v) {
        return _.find(choices, function(c) {
          return c.value === v;
        });
      });
      var missing = _.difference(choices, ordered);
      return _.union(ordered, missing);
    }

    function clearFeedback(choices) {
      _(choices).each(function(c) {
        delete c.feedback;
        delete c.correct;
      });
    }

    function shuffle(choices) {
      function newIndex(item, array) {
          var t = _.find(array, function(el) {
              return el.value === item.value;
          });
          return t ? array.indexOf(t) : -1;
      }

      var shuffled = _.shuffle(_.cloneDeep(choices));
      _.each(choices, function(choice, index) {
          var temp;
          var remain = !_.isUndefined(choice.shuffle) && choice.shuffle === false;
          if (remain) {
              temp = shuffled[newIndex(choice, shuffled)];
              shuffled[newIndex(choice, shuffled)] = shuffled[index];
              shuffled[index] = temp;
          }
      });

      return shuffled;
    }

    var stashOrder = function(choices) {
      return _.map(choices, function(c) {
          return c.value;
      });
    };

    function setFeedback(choices, response) {
      _(choices).each(function(c) {
        if (response.feedback) {
          var fb = response.feedback[c.value];
          if (fb) {
            c.feedback = fb.feedback;
            c.correct = fb.correct;
          }
        }
      });
    }

    function renderMath(delay) {
      scope.$emit('rerender-math', {
        delay: delay
      });
    }

    var updateUi = function() {

      if (!scope.question || !scope.session) {
          return;
      }

      var model = scope.question;
      var shuffle = model.config.shuffle === true || model.config.shuffle === "true";

      var stash = scope.session.stash = scope.session.stash || {};

      if (stash.shuffledOrder && shuffle) {
        scope.choices = layoutChoices(_.cloneDeep(model.choices), stash.shuffledOrder);
      } else if (shuffle) {
        scope.choices = layoutChoices(_.cloneDeep(model.choices));
        stash.shuffledOrder = stashOrder(scope.choices);
        scope.$emit('saveStash', attrs.id, stash);
      } else {
        scope.choices = _.cloneDeep(scope.question.choices);
      }
    };


    scope.containerBridge = {

      setPlayerSkin: function(skin) {
        scope.iconset = skin.iconSet;
      },

      setDataAndSession: function(dataAndSession) {
        scope.question = dataAndSession.data.model;
        scope.session = dataAndSession.session || {};

        updateUi ();
        if (dataAndSession.session && dataAndSession.session.answers) {
          var selectedChoice = _.find(scope.choices, function(c) {
              return c.value === dataAndSession.session.answers;
          });

          scope.select(selectedChoice);
        }

        renderMath(100);
      },

      getSession: function() {
        var answer = scope.selected ? scope.selected.value : null;

        return {
          answers: answer
        };
      },

      setInstructorData: function(data) {
        var selectedChoice = _.find(scope.choices, function(c) {
          return _([data.correctResponse]).flatten().contains(c.value);
        });
        scope.select(selectedChoice);
        scope.response = {correctness: 'correct'};
        if (!_.isEmpty(data.rationales)) {
          var rationaleHtml = _.map(scope.choices, function(c) {
            var rationale = _.find(data.rationales, function(r) {
                return r.choice === c.value;
              }) || {};
            return "<div class='rationale-row'><span class='rationale-bold'>" + c.label + "</span> - " + rationale.rationale + "</div>";
          }).join("\n");
          scope.instructorResponse = {correctness: 'instructor', feedback: rationaleHtml};
        }
        scope.instructorClass = 'instructor';
      },

      // sets the server's response
      setResponse: function(response) {
        clearFeedback(scope.choices);
        setFeedback(scope.choices, response);
        var r = _.cloneDeep(response);
        if (response && response.feedback) {
          r.feedback = response.feedback.feedback;
        }
        if (!scope.selected) {
          r.correctness = 'warning';
        }
        scope.response = r;
        console.log('scope.response', scope.response);
        scope.iconKey = r.correctness === 'warning' ? 'nothing-submitted' : r.correctness;
      },

      setMode: function(newMode) {},

      reset: function() {
        scope.selected = undefined;
        scope.response = undefined;
        scope.instructorResponse = undefined;

        var model = scope.question;
        var shuffle = model.config.shuffle === true || model.config.shuffle === "true";
        if (shuffle) {
          scope.choices = layoutChoices(model.choices);
        }
        clearFeedback(scope.choices);
      },

      resetStash: function() {
        scope.session.stash = {};
      },

      isAnswerEmpty: function() {
        return _.isEmpty(this.getSession().answers);
      },

      answerChangedHandler: function(callback) {
        scope.$watch("selected", function(newValue, oldValue) {
          if (newValue !== oldValue) {
            callback();
          }
        }, true);
      },

      editable: function(e) {
        scope.editable = e;
      }
    };

    scope.select = function(choice) {
      scope.selected = choice;
      renderMath(1);
    };


    element.on('show.bs.popover', function(e) {
      scope.triggerIcon(e, true);
    });

    element.on('hide.bs.popover', function(e) {
      scope.triggerIcon(e, false);
    });

    scope.triggerIcon = function(e, popoverToggled) {
      scope.popupVisible = popoverToggled;
    };

    scope.playerId = (function() {
      return element.closest('.player-body').attr('id');
    })();

    scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
  };
};

main = [
  '$sce',
  '$timeout',
  function($sce, $timeout) {
    var def;
    def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link($sce, $timeout),
      template: [
        '<div class="view-inline-choice {{instructorClass}}" ng-class="response.correctness">',
        '  <span viewport="#{{playerId}}">',
        '    <span class="dropdown" dropdown>',
        '      <span class="btn dropdown-toggle" ng-class="{initial: !selected}" dropdown-toggle ng-disabled="!editable">',
        '        <div style="height: 0px; overflow: hidden">',
        '          <li ng-repeat="choice in choices">',
        '            <a ng-bind-html-unsafe="choice.label"></a>',
        '          </li>',
        '        </div>',
        '        <span class="selected-label" ng-bind-html-unsafe="selected.label" ng-show="selected !== undefined" style="display: inline-block"></span>',
        '        <div class="caret-holder">',
        '          <svg-icon category="inline-choice" key="caret"></svg-icon>',
        '        </div>',
        '      </span>',
        '      <span ng-if="!instructorResponse && response" class="feedback-icon" feedback-popover="response">',
        '        <svg-icon open="{{popupVisible}}" category="{{response.feedback ? \'feedback\' : \'\'}}" key="{{iconKey}}" shape="square" icon-set="{{iconset}}" />',
        '      </span>',
        '      <ul class="dropdown-menu">',
        '        <li ng-switch="choice.labelType" ng-repeat="choice in choices">',
        '          <a ng-click="select(choice)" ng-bind-html-unsafe="choice.label"></a>',
        '        </li>',
        '      </ul>',
        '    </span>',
        '  </span>',
        '  <span ng-if="instructorResponse" class="rationale" feedback-popover="instructorResponse">',
        '    <svg-icon open="{{popupVisible}}" class="toggle-icon" category="showHide" key="show-rationale"></svg-icon>',
        '  </span>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;