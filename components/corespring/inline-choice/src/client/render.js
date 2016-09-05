exports.framework = 'angular';
exports.directive = [
  '$sce',
  '$timeout',
  RenderInlineChoiceDirective
];


function RenderInlineChoiceDirective($sce, $timeout) {

  return {
    link: link,
    replace: true,
    restrict: 'AE',
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    scope.editable = true;
    scope.popupVisible = false;

    scope.select = select;
    scope.playerId = getPlayerId;

    scope.containerBridge = {
      answerChangedHandler: answerChangedHandler,
      editable: setEditable,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty,
      reset: reset,
      resetStash: resetStash,
      setDataAndSession: setDataAndSession,
      setInstructorData: setInstructorData,
      setMode: setMode,
      setPlayerSkin: setPlayerSkin,
      setResponse: setResponse
    };

    element.on('show.bs.popover', setPopupVisible(true));
    element.on('hide.bs.popover', setPopupVisible(false));

    scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    //-----------------------------------------------------------
    // only functions below
    //-----------------------------------------------------------


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

    function stashOrder(choices) {
      return _.map(choices, function(c) {
        return c.value;
      });
    }

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

    function updateUi() {

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
    }

    function setPlayerSkin(skin) {
      scope.iconset = skin.iconSet;
    }

    function setDataAndSession(dataAndSession) {
      scope.question = dataAndSession.data.model;
      scope.session = dataAndSession.session || {};

      updateUi();
      if (dataAndSession.session && dataAndSession.session.answers) {
        var selectedChoice = _.find(scope.choices, function(c) {
          return c.value === dataAndSession.session.answers;
        });

        scope.select(selectedChoice);
      }

      renderMath(100);
    }

    function getSession() {
      var answer = scope.selected ? scope.selected.value : null;

      return {
        answers: answer
      };
    }

    function setInstructorData(data) {
      var selectedChoice = _.find(scope.choices, function(c) {
        return _([data.correctResponse]).flatten().contains(c.value);
      });
      scope.select(selectedChoice);

      scope.response = {
        correctness: 'correct'
      };

      if (!_.isEmpty(data.rationales)) {
        var rationaleHtml = _.map(scope.choices, function(c) {
          var rationale = _.find(data.rationales, function(r) {
            return r.choice === c.value;
          }) || {};
          return "<div class='rationale-row'><span class='rationale-bold'>" + c.label + "</span> - " + rationale.rationale + "</div>";
        }).join("\n");

        scope.instructorResponse = {
          correctness: 'instructor',
          feedback: rationaleHtml
        };
      }
      scope.instructorClass = 'instructor';
    }

    // sets the server's response
    function setResponse(response) {
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
      scope.iconKey = r.correctness === 'warning' ? 'nothing-submitted-feedback' : r.correctness;
    }

    function setMode(newMode) {}

    function reset() {
      scope.selected = undefined;
      scope.response = undefined;
      scope.instructorResponse = undefined;

      var model = scope.question;
      var shuffle = model.config.shuffle === true || model.config.shuffle === "true";
      if (shuffle) {
        scope.choices = layoutChoices(model.choices);
      }
      clearFeedback(scope.choices);
    }

    function resetStash() {
      scope.session.stash = {};
    }

    function isAnswerEmpty() {
      return _.isEmpty(this.getSession().answers);
    }

    function answerChangedHandler(callback) {
      scope.$watch("selected", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          callback();
        }
      }, true);
    }

    function setEditable(e) {
      scope.editable = e;
    }

    function select(choice) {
      scope.selected = choice;
      renderMath(1);
    }

    function setPopupVisible(value) {
      return function() {
        scope.popupVisible = value;
      };
    }

    function getPlayerId() {
      return element.closest('.player-body').attr('id');
    }
  }

  function template() {
    return [
      '<div class="view-inline-choice {{instructorClass}}" ng-class="response.correctness">',
      '  <span viewport="#{{playerId}}">',
      '    <span class="dropdown" dropdown>',
      '      <span class="btn dropdown-toggle" ng-class="{initial: !selected}" dropdown-toggle ng-disabled="!editable">',
      '        <div class="hidden-choice-padder">',
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
    ].join("\n");
  }
}