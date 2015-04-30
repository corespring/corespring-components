var main = [
  '$log',

  function ($log) {

    return {
      scope: {},
      restrict: 'EA',
      replace: false,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {
      scope.undoStack = [];
      scope.editable = false;
      scope.isSeeAnswerOpen = false;

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setResponse: setResponse,
        setMode: function (newMode) {
        },
        reset: reset,
        resetStash: function () {
        },
        isAnswerEmpty: isAnswerEmpty,
        answerChangedHandler: function(callback){

        },
        editable: setEditable
      };



      scope.undo = undo;
      scope.startOver = startOver;
      scope.$watch("renderModel", onChangeRenderModel, true);
      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

      //-----------------------------------------------------------------

      function log() {
        console.log.apply(console, ['[corespring-blueprint]', arguments]);
      }

      function setDataAndSession(dataAndSession) {
        log(":setDataAndSession", dataAndSession);
        scope.editable = true;
        scope.session = dataAndSession.session;
        scope.data = dataAndSession.data;
        scope.renderModel = prepareRenderModel(dataAndSession.data.model, scope.session);
        scope.saveRenderModel = _.cloneDeep(scope.renderModel);
        renderMath();
      }

      function getSession() {
        var answers = {};
        //TODO fill in answers here
        return {
          answers: answers
        };
      }

      function setResponse(response) {
        console.log(":setResponse", response);
        scope.response = response;
      }

      function reset() {
        scope.editable = true;
        scope.undoStack = [];
        scope.session = {};
        scope.isSeeAnswerOpen = false;
        delete scope.response;
        scope.renderModel = _.cloneDeep(scope.saveRenderModel);
      }

      function prepareRenderModel(rawModel, session) {
        return {
          //TODO fill in code to create render model
        };
      }

      function onChangeRenderModel(newValue, oldValue) {
        //console.log(":onChangeRenderModel", newValue);
        if (newValue && !_.isEqual(newValue, _.last(scope.undoStack))) {
          scope.undoStack.push(_.cloneDeep(newValue));
        }
      }

      function startOver() {
        scope.undoStack = [_.first(scope.undoStack)];
        revertToState(_.first(scope.undoStack));
      }

      function undo() {
        if (scope.undoStack.length < 2) {
          return;
        }
        scope.undoStack.pop();
        revertToState(_.last(scope.undoStack));
      }

      function revertToState(state) {
        //TODO Reset renderModel from state (which is a copy of renderModel)
      }

      function renderMath() {
        scope.$emit('rerender-math', {
          delay: 100,
          element: element[0]
        });
      }

      function isAnswerEmpty() {
        return getNumberOfAnswers() === 0;
      }

      function getNumberOfAnswers() {
        //TODO Calculate the number of answers given
      }

      function setEditable(e) {
        log(":setEditable", e, scope.editable);
        scope.editable = e;
      }

    }

    function template() {
      return [
        '<div class="render-corespring-blueprint">',
        undoStartOver(),
        mainInteraction(),
        itemFeedbackPanel(),
        seeSolutionPanel(),
        '</div>'
      ].join('\n');

      function undoStartOver() {
        return [
          '<div ng-show="editable" class="undo-start-over pull-right">',
          '  <button type="button" class="btn btn-default" ng-click="undo()" ng-disabled="undoStack.length < 2"><i class="fa fa-undo"></i> Undo</button>',
          '  <button type="button" class="btn btn-default" ng-click="startOver()" ng-disabled="undoStack.length < 2">Start over</button>',
          '</div>',
          '<div class="clearfix"></div>'
        ].join('');
      }

      function mainInteraction() {
        return [
          '<div class="dnd-blueprint-interaction">',
          //TODO Fill in template code to render the interaction
          '</div>'
        ].join('');
      }

      function itemFeedbackPanel() {
        return [
          '<div feedback="response.feedback" correct-class="{{response.correctClass}}"></div>'
        ].join('');
      }

      function seeSolutionPanel() {
        return [
          '<div see-answer-panel="true"',
          '    see-answer-panel-expanded="isSeeAnswerPanelExpanded"',
          '    ng-if="response.correctResponse">',
          correctResult(),
          '</div>'
        ].join('');

        function correctResult() {

        }
      }
    }
  }
];



exports.framework = 'angular';

exports.directives = [{
  directive: main
}];