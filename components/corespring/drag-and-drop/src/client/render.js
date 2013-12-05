var main = [ '$compile', '$log', function ($compile, $log) {

  var link = function (scope, element, attrs) {

    scope.landingPlaceChoices = {};
    scope.dragging = {};
    scope.maxWidth = 50;
    scope.maxHeight = 20;
    scope.expandHorizontal = true;
    scope.stack = [];

    scope.propagateDimension = function (w, h) {
      scope.$apply(function () {
        if (w > scope.maxWidth) scope.maxWidth = w;
        if (h > scope.maxHeight) scope.maxHeight = h;
      });
    };

    var lastW, lastH;

    setInterval(function () {

      if (!scope.$$phase) {
        var w = 0, h = 0;

        $(element).find('.sizerHolder').each(function (idx, e) {
          if ($(e).width() > w) w = $(e).width();
        });
        $(element).find('.sizerHolder').each(function (idx, e) {
          if ($(e).height() > h) h = $(e).height();
        });
        if (lastW != w || lastH != h) {
          scope.propagateDimension(w, h);
        }
        lastW = w;
        lastH = h;
      }
    }, 1000);


    scope.onStart = function (event) {
      scope.dragging.id = $(event.currentTarget).attr('data-id');
      scope.dragging.fromTarget = undefined;
    };

    scope.draggableOptions = {
      onStart: 'onStart',
      revert: 'invalid'
    };

    var resetChoices = function (model) {
      // TODO: rewrite this using stash
      var isNew = !scope.model;

      scope.stack = [];
      scope.model = _.cloneDeep(model);
      _.each(scope.landingPlaceChoices, function (lpc, key) {
        scope.landingPlaceChoices[key] = [];
      });

      if (isNew && scope.model.config.shuffle) {
        // TODO: rewrite this using stash
        scope.model.choices = _.shuffle(scope.model.choices);
      }
    };

    scope.undo = function () {
      if (scope.stack.length < 2) return;
      var o = scope.stack.pop();
      var state = _.last(scope.stack);
      scope.model.choices = _.cloneDeep(state.choices);
      scope.landingPlaceChoices = _.cloneDeep(state.landingPlaces);
    };

    scope.$watch('landingPlaceChoices', function (n) {
      var state = {choices: _.cloneDeep(scope.model.choices), landingPlaces: _.cloneDeep(scope.landingPlaceChoices)};
      if (!_.isEqual(state, _.last(scope.stack))) {
        scope.stack.push(state);
      }
    }, true);


    scope.containerBridge = {
      setDataAndSession: function (dataAndSession) {
        $log.debug("DnD setting session: ", dataAndSession);

        scope.rawModel = dataAndSession.data.model;
        scope.editable = true;
        resetChoices(scope.rawModel);

        scope.expandHorizontal = dataAndSession.data.model.config.expandHorizontal;

        if (dataAndSession.session && dataAndSession.session.answers) {

          // Build up the landing places with the selected choices
          _.each(dataAndSession.session.answers, function (v, k) {
            var choice = _.find(dataAndSession.data.model.choices, function (choice) {
              return choice.id == v;
            });

            scope.landingPlaceChoices[k] = {id: v, content: choice.content};
          });

          // Remove choices that are in landing place area
          scope.model.choices = _.filter(scope.model.choices, function (choice) {
            var landingPlaceWithChoice = _.find(scope.landingPlaceChoices, function (c) {
              return c.id == choice.id;
            });
            return _.isUndefined(landingPlaceWithChoice);
          });
        }

        var answerHtml = scope.model.answerArea;
        $answerArea = element.find("#answer-area").html("<div> " + answerHtml + "</div>");
        $compile($answerArea)(scope.$new());

      },
      getSession: function () {
//        console.log("Getting answer");
        var answer = {};
        _.each(scope.landingPlaceChoices, function (v, k) {
          if (k) answer[k] = _.pluck(v, 'id');
        });
//        console.log(answer);
        return {
          answers: answer
        };
      },
      setMode: function (newMode) {
      },
      reset: function () {
        resetChoices(scope.rawModel);
      },
      isAnswerEmpty: function () {
        return _.isEmpty(this.getSession().answers);
      },
      answerChangedHandler: function (callback) {
        scope.$watch("landingPlaceChoices", function (newValue, oldValue) {
          if (newValue) {
            callback();
          }
        }, true);
      },
      editable: function (e) {
        scope.$apply(function () {
          scope.editable = e;
        });
      }
    };
    scope.$emit('registerComponent', attrs.id, scope.containerBridge);
  };

  var answerArea = function () {
    return  ['        <h5 ng-bind-html-unsafe="model.config.answerAreaLabel"></h5>',
      '        <div id="answer-area">',
      '        </div>'].join('');

  };

  var choiceArea = function () {
    return  [
      '        <div class="choices" >',
      '          <h5 ng-bind-html-unsafe="model.config.choiceAreaLabel"></h5>',
      '          <div',
      '            ng-repeat="o in model.choices"',
      '            class="btn btn-primary choice"',
      '            data-drag="editable"',
      '            ng-disabled="!editable"',
      '            data-jqyoui-options="draggableOptions"',
      '            ng-model="model.choices[$index]"',
      '            jqyoui-draggable="draggableOptions"',
      '            data-id="{{o.id}}">',
      '               <div ng-bind-html-unsafe="o.content" />',
      '               <div class="sizerHolder" style="display: none; position: absolute" ng-bind-html-unsafe="o.content" />',
      '           </div>',
      '          </div>'].join('');

  }

  var tmpl = [
    '        <div class="view-drag-and-drop">',
    ' <p><button ng-click="undo()">Undo</button></p>',
    '        <h5 class="prompt" ng-bind-html-unsafe="model.prompt"></h5>',
    '        <div ng-if="model.config.position == \'above\'">', choiceArea(), '</div>',
    answerArea(),
    '        <div ng-if="model.config.position != \'above\'">', choiceArea(), '</div>',
    '      </div>'
  ].join("");

  return {
    link: link,
    scope: {},
    restrict: 'AE',
    replace: false,
    template: '' + tmpl
  };
}];

var landingPlace = [function () {
  var isMultiple = true;
  var def = {
    scope: true,  //TODO: should use isolate scope, but = doesn't seem to inherit from DanD's scope
    restrict: 'AE',
    transclude: true,
    replace: false,
    link: function (scope, element, attrs) {
      scope['class'] = attrs['class'];
      scope.id = attrs['id'];
      scope.landingPlaceChoices[scope.id] = [];


      var nonEmptyElement = function (c) {
        return c && c.id;
      };

      scope.onDrop = function () {
        scope.dragging.isOut = false;
        scope.model.choices = _.filter(scope.model.choices, nonEmptyElement);
        _.each(scope.landingPlaceChoices, function (lpc, key) {
          scope.landingPlaceChoices[key] = _.filter(lpc, nonEmptyElement);
        });

      };

      scope.onStart = function (event) {
        scope.dragging.id = $(event.currentTarget).attr('data-id');
        scope.dragging.fromTarget = scope.id;
      };

      scope.revertFunction = function (isValid) {
        if (isValid) return false;
        scope.$apply(function () {
          var choice = _.find(scope.landingPlaceChoices[scope.id], function (c) {
            return c.id == scope.dragging.id;
          });
          scope.model.choices.push(choice);
          console.log("Excluding", scope.dragging);
          scope.landingPlaceChoices[scope.id] = _.filter(scope.landingPlaceChoices[scope.id], function (e) {
            return e.id != scope.dragging.id;
          });
        });
        return true;
      };

      scope.overCallback = function () {
        scope.dragging.isOut = false;
      };

      scope.outCallback = function () {
        scope.dragging.isOut = true;
      };

      scope.droppableOptions = {
        accept: function (a, b) {
          return scope.dragging.fromTarget != scope.id;
        },
        onDrop: 'onDrop',
        onOver: 'overCallback',
        onOut: 'outCallback',
        multiple: isMultiple
      };

      scope.sortableOptions = {
        start: function (ev, b) {
          scope.$apply(function () {
            scope.dragging.id = $(b.item).attr('data-id');
            scope.dragging.fromTarget = scope.id;
            scope.revertNext = false;
          });
        },
        beforeStop: function() {
          scope.revertNext = scope.dragging.isOut;
        },
        stop: function () {
          if (scope.revertNext) {
            scope.revertFunction();
          }
          scope.dragging.fromTarget = undefined;
        },

        out: scope.outCallback,
        over: scope.overCallback,
        revert: false
      };

      scope.$watch("maxWidth + maxHeight", function (n) {
        if (scope.expandHorizontal) {
          scope.style = "min-height: " + (scope.maxHeight + 20) + "px; min-width: " + (scope.maxWidth + 30) + "px";
        } else {
          scope.style = "min-height: " + (scope.maxHeight + 20) + "px; width: " + (scope.maxWidth + 30) + "px";
        }
      });


    },
    template: [
      '    <div data-drop="true" ng-model="landingPlaceChoices[id]" jqyoui-droppable="droppableOptions"',
      '         data-jqyoui-options="droppableOptions" class="landing-place {{class}}" style="{{style}}" >',
      '    <div',
      '      ui-sortable="sortableOptions" ',
      '      ng-model="landingPlaceChoices[id]"',
      '      >',
      '        <div ng-repeat="choice in landingPlaceChoices[id]" jqyoui-draggable="{index: {{$index}}, placeholder: true}" data-jqyoui-options="" ng-model="landingPlaceChoices[id][$index]" data-id="{{choice.id}}" class="btn btn-primary" ng-bind-html-unsafe="choice.content"></div>',
      '    </div>',
      '    </div>'].join("")

  };
  return def;
}];

exports.framework = 'angular';
exports.directives = [
/** The default definition - no name is needed. 1 main def is mandatory */
  { directive: main },
/** A 2nd directive */
  { name: 'landingPlace', directive: landingPlace }
];

