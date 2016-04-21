exports.framework = 'angular';

exports.directives = [{
  directive: ['$log', renderWebdriverTestComponent]
}];

function renderWebdriverTestComponent($log) {

  return {
    scope: {},
    restrict: 'EA',
    replace: false,
    link: link,
    template: template()
  };

  function link(scope, element, attrs) {

    scope.addableAdded = false;
    scope.hideableHidden = false;
    scope.removableRemoved = false;
    scope.showableShown = false;

    scope.draggableModel = {
      title: "draggable model"
    };

    scope.droppableModel = {
      title: "droppable model"
    };

    scope.addAddable = addAddable;
    scope.hideHideable = hideHideable;
    scope.removeRemovable = removeRemovable;
    scope.showShowable = showShowable;

    scope.containerBridge = {
      answerChangedHandler: setAnswerChangedCallback,
      editable: setEditable,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty,
      reset: reset,
      setDataAndSession: setDataAndSession,
      setMode: setMode,
      setResponse: setResponse
    };

    scope.$on('callMethod', function(evt, data){
      if(_.isFunction(scope[data.method])){
        scope[data.method].apply(scope, data.args);
      }
    });

    scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    //-----------------------------------------------------------------

    /**
     * dataAndSession.data is equivalent to configure's fullModel.model
     * It contains all the data necessary to render the interaction
     * so that the user can answer the question.
     * dataAndSession.session is equivalent to what getSession() returns
     * @param dataAndSession
     */
    function setDataAndSession(dataAndSession) {
      $log.log(":setDataAndSession", dataAndSession);
      scope.dataAndSession = dataAndSession;
    }

    function getSession() {
      return {
        answers: {}
      };
    }

    function setResponse(response) {
      console.log(":setResponse", response);
      scope.response = response;
    }

    function reset() {
      scope.addableAdded = false;
      scope.hideableHidden = false;
      scope.removeableRemoved = false;
      scope.showableShown = false;
      delete scope.response;
    }

    function isAnswerEmpty(){
      return false;
    }

    function setEditable(value){
      scope.editable = value;
    }

    function setMode(newMode) {
      //player mode: view, gather, evaluate
    }

    function setAnswerChangedCallback(callback) {
      //you need call this callback every time
      //the user interacts with the component and changes the
      //content of the session. This is important for
      //the inputReceived event, which is dispatched by the player
      //and can be listened to by the user of the player
      scope.answerChangedCallback = callback;
    }

    function addAddable(){
      scope.addableAdded = true;
    }

    function hideHideable(){
      scope.hideableHidden = true;
    }

    function removeRemovable(){
      scope.removableRemoved = true;
    }

    function showShowable(){
      scope.showableShown = true;
    }

  }

  function template() {
    return [
        '<div class="render-corespring-webdriver-test-component">',
        '  <div class="visible-from-the-start">visible from the start</div>',
        '  <div class="no-content"></div>',
        '  <div class="hidden-from-the-start">hidden from the start</div>',
        '  <div class="hideable" ng-hide="hideableHidden">hideable</div>',
        '  <div class="showable" ng-show="showableShown">showable</div>',
        '  <div class="removable" ng-if="!removableRemoved">removable</div>',
        '  <div class="addable" ng-if="addableAdded">addable</div>',
        '',
        '  <div class="btn draggable" ',
        '      data-drag="true"',
        '      data-jqyoui-options="{revert: \'invalid\'}"',
        '      jqyoui-draggable="{animate:true, placeholder: true}"',
        '      ng-model="draggableModel"',
        '   >{{draggableModel.title}}</div>',
        '',
        '  <div class="droppable" ',
        '      data-drop="true"',
        '      data-jqyoui-options="{tolerance:\'touch\'}"',
        '      jqyoui-droppable ',
        '      ng-model="droppableModel"',
        '   >{{droppableModel.title}}</div>',
        '',
        '  <div id="mouse-follower" class="mouse-follower"></div>',
        '</div>'
      ].join('\n');
  }
}