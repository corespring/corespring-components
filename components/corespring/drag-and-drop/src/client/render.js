var main = [ '$compile', '$log', function ($compile, $log) {

  var link = function (scope, element, attrs) {

    scope.landingPlaceChoices = {};
    scope.dragging = {};

    scope.onStart = function(event) {
      scope.dragging.id = $(event.currentTarget).attr('data-id');
      scope.dragging.fromTarget = undefined;
    };

    scope.draggableOptions = {
      onStart: 'onStart'
    };

    var resetChoices = function(model){
      // TODO: rewrite this using stash
      var isNew = !scope.model;

      scope.model = _.cloneDeep(model);
      scope.landingPlaceChoices = {};
      if (isNew && scope.model.config.shuffle) {
        // TODO: rewrite this using stash
        scope.model.choices = _.shuffle(scope.model.choices);
      }
    };

    scope.containerBridge = {
      setDataAndSession: function (dataAndSession) {
        $log.debug("DnD setting session: ", dataAndSession);

        scope.rawModel = dataAndSession.data.model;
        scope.editable = true;
        resetChoices(scope.rawModel);

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
        var answer = {};
        _.each(scope.landingPlaceChoices, function (v, k) {
          if (k && v && v.id) answer[k] = v.id;
        });
        return {
          answers: answer
        };
      },
      setMode : function(newMode) {
      },
      reset: function(){
        resetChoices(scope.rawModel);
      },
      isAnswerEmpty: function(){
        return _.isEmpty(this.getSession().answers);
      },
      answerChangedHandler: function(callback){
        scope.$watch("landingPlaceChoices", function(newValue, oldValue){
          if(newValue){
            callback();
          }
        }, true);  
      },
      editable: function(e){
        scope.$apply(function(){
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
      '            data-id="{{o.id}}"',
      '            ng-bind-html-unsafe="o.content"',
      '           ></div>',
      '          </div>'].join('');

  }

  var tmpl = [
    '        <div class="view-drag-and-drop">{{dragging}} {{landingPlaceChoices}}',
    '        <h5 class="prompt" ng-bind-html-unsafe="model.prompt"></h5>',
    '        <div ng-if="model.config.position == \'above\'">', choiceArea(), '</div>',
    answerArea(),
    '        <div ng-if="model.config.position != \'above\'">', choiceArea(), '</div>',
    '     </div>',
    '      </div>'
  ].join("");

  return {
    link: link,
    scope: {},
    restrict: 'E',
    template: tmpl
  };
}];

var landingPlace = [function () {
  var isMultiple = true;
  var def = {
    scope: true,  //TODO: should use isolate scope, but = doesn't seem to inherit from DanD's scope
    restrict: 'E',
    transclude: true,
    replace: false,
    link: function (scope, element, attrs) {
      scope.class = attrs['class'];
      scope.id = attrs['id'];
      scope.landingPlaceChoices[scope.id] = [];

      var nonEmptyElement = function(c) {
        return c && c.id;
      };

      scope.onDrop = function () {
        console.log("onDrop", scope.model.choices);
        scope.model.choices = _.filter(scope.model.choices, nonEmptyElement);
        _.each(scope.landingPlaceChoices, function(lpc, key) {
          scope.landingPlaceChoices[key] = _.filter(lpc, nonEmptyElement);
        });
      };

      scope.onStart = function(event) {
        console.log("Starting");
        scope.dragging.id = $(event.currentTarget).attr('data-id');
        console.log("Setting fromtarget to ", scope.id);
        scope.dragging.fromTarget = scope.id;
      };

//      scope.draggableOptions = {
//        onStart: 'onStart',
//        revert: function (isValid, element) {
//          if (isValid) return false;
//          scope.$apply(function () {
//            var choice = _.find(scope.landingPlaceChoices[scope.id], function(c) {
//              return c.id == scope.dragging.id;
//            });
//            scope.model.choices.push(choice);
//            console.log("Excluding", scope.dragging);
//            scope.landingPlaceChoices[scope.id] = _.filter(scope.landingPlaceChoices[scope.id], function(e) {
//              return e.id != scope.dragging.id;
//            });
//          });
//
//          return true;
//        }
//      };
      scope.droppableOptions = {
        accept: function(a,b) {
          return scope.dragging.fromTarget != scope.id;
        },
        onDrop: 'onDrop',
        multiple: isMultiple
      };
      scope.sortableOptions = {
        start: function(ev, b) {
          scope.$apply(function() {
            scope.dragging.id = $(event.currentTarget).attr('data-id');
            scope.dragging.fromTarget = scope.id;
          });
        },
        beforeStop: function() {
          console.log("BeforeStop");
        },
        over: function() {
          console.log("BeforeStop");
        }
      };

    },
    template: [
      '    <div data-drop="true" ng-model="landingPlaceChoices[id]" jqyoui-droppable="droppableOptions" data-jqyoui-options="droppableOptions" class="landing-place {{class}}" style="padding: 5px">',
      '    <ul',
      '      ui-sortable="sortableOptions" ',
      '      ng-model="landingPlaceChoices[id]"',
      '      >',
      '        <li ng-repeat="choice in landingPlaceChoices[id]"  ng-model="landingPlaceChoices[id][$index]"  data-id="{{choice.id}}" class="btn btn-primary" ng-bind-html-unsafe="choice.content"></li>',
      '    </ul>',
      '    </div>'].join("")

  };
  return def;
}];

exports.framework = 'angular';
exports.directives = [
/** The default definition - no name is needed. 1 main def is mandatory */
  { directive: main },
/** A 2nd directive */
  { name: 'landingplace', directive: landingPlace }
];

