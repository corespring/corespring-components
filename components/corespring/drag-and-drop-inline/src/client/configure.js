/* globals console, exports */

exports.framework = 'angular';
exports.directives = [{
  directive: [
    "$compile",
    "$timeout",
    "ChoiceTemplates",
    "ComponentImageService",
    "WiggiLinkFeatureDef",
    "WiggiMathJaxFeatureDef",
    main
  ]
}, {
  name: 'configAnswerAreaInlineCsdndi',
  directive: [
    '$log',
    'WIGGI_EVENTS',
     configAnswerAreaInline
   ]
}];

function main(
  $compile,
  $timeout,
  ChoiceTemplates,
  ComponentImageService,
  WiggiLinkFeatureDef,
  WiggiMathJaxFeatureDef
) {

  "use strict";

  return {
    restrict: "E",
    scope: {},
    replace: true,
    template: template(),
    controller: ['$scope', controller],
    link: link
  };


  function controller(scope) {
    scope.imageService = function() {
      return ComponentImageService;
    };

    scope.extraFeaturesForChoices = {
      definitions: [
            new WiggiMathJaxFeatureDef()
          ]
    };

    scope.extraFeaturesForAnswerArea = {
      definitions: [
                  new WiggiMathJaxFeatureDef(),
                  new WiggiLinkFeatureDef(),
        {
          name: 'answer-area-inline-csdndi',
          title: 'Add Answer Blank',
          draggable: false,
          compile: true,
          addToEditor: function(editor, addContent) {
            var id = scope.addAnswerArea();
            addContent($('<answer-area-inline-csdndi id="' + id + '"/>'));
            focusAnswerArea(id);
          },
          deleteNode: function($node, services) {
            var id = $node.attr('answer-area-id');
            scope.removeAnswerArea(id);
          },
          initialise: function($node, replaceWith) {
            var id = $node.attr('id');
            return replaceWith($('<div config-answer-area-inline-csdndi answer-area-id="' + id + '"/>'));
          },
          onDblClick: function($node, scope, editor) {},
          editInstance: function($node, scope, editor) {},
          getMarkUp: function($node) {
            var id = $node.attr('answer-area-id');
            return '<answer-area-inline-csdndi id="' + id + '"/>';
          }
                  }]
    };

    scope.extraFeaturesForChoiceLabel = {
      definitions: [
        new WiggiMathJaxFeatureDef()
      ]
    };

    function focusAnswerArea(id) {
      $timeout(function() {
        var $editable = $('[answer-area-id="' + id + '"]').closest('.wiggi-wiz-editable');
        if ($editable.length > 0) {
          $editable.click();
          angular.element($editable).scope().focusCaretAtEnd();
        }
      });
    }

  }

  function link(scope, element, attrs) {

    ChoiceTemplates.extendScope(scope, 'corespring-drag-and-drop-inline');

    scope.active = [];
    scope.correctAnswers = {};
    scope.containerBridge = {
      setModel: setModel,
      getModel: getModel,
      getAnswer: getAnswer
    };

    scope.activate = activate;
    scope.addAnswerArea = addAnswerArea;
    scope.addChoice = addChoice;
    scope.canDragChoice = canDragChoice;
    scope.choiceDraggableJqueryOptions = choiceDraggableJqueryOptions;
    scope.choiceDraggableOptions = choiceDraggableOptions;
    scope.cleanLabel = makeCleanLabelFunction();
    scope.deactivate = deactivate;
    scope.itemClick = itemClick;
    scope.removeAnswerArea = removeAnswerArea;
    scope.removeChoice = removeChoice;

    scope.$on('get-config-scope', onGetConfigScope);
    scope.$on('remove-correct-answer', onRemoveCorrectAnswer);
    scope.$watch('correctAnswers', onChangeCorrectAnswers, true);

    scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

    //---------------------------------------------------

    function setModel(fullModel) {
      scope.fullModel = fullModel;
      scope.model = fullModel.model;
      scope.correctAnswers = initCorrectAnswers(fullModel.model.answerAreas, fullModel.correctResponse);
      scope.updateNumberOfCorrectResponses(sumCorrectAnswers());
      scope.componentState = "initialized";
    }

    function getModel() {
      removeSuperfluousAnswerAreaModels();
      var fullModel = _.cloneDeep(scope.fullModel);
      return fullModel;
    }

    function getAnswer() {
      return {};
    }

    function removeSuperfluousAnswerAreaModels(model){
      var modelsToDelete = _.filter(scope.model.answerAreas, function(answerAreaModel){
        return !existsAnswerAreaNode(answerAreaModel.id);
      });

      _.forEach(modelsToDelete, function(answerAreaModel){
        console.warn("Removing answerAreaModel because it is not defined in xhtml", answerAreaModel);
        removeAnswerArea(answerAreaModel.id);
      });

      function existsAnswerAreaNode(id){
        return $('<div>' + scope.model.answerAreaXhtml + '</div>').find('#' + id).length > 0;
      }
    }

    function sumCorrectAnswers() {
      return _.reduce(scope.correctAnswers, function(memo, ca) {
        return ca.length + memo;
      }, 0);
    }

    function choiceById(choices, cid) {
      return _.find(choices, {
        id: cid
      });
    }

    function idsToChoices(ids) {
      return _.map(ids, function(choiceId) {
        return choiceById(scope.model.choices, choiceId);
      });
    }

    function isPlaced(choice) {
      return _.some(scope.correctAnswers, function(val, key) {
        return !_.isUndefined(_.find(val, {
          id: choice.id
        }));
      });
    }

    function initCorrectAnswers(answerAreas, correctResponse) {
      var correctAnswers = {};
      _.each(answerAreas, function(area) {
        correctAnswers[area.id] = [];
      });
      _.each(correctResponse, function(correctChoices, areaId) {
        correctAnswers[areaId] = idsToChoices(correctChoices);
      });
      return correctAnswers;
    }

    function correctAnswersToCorrectResponse(correctAnswers) {
      var correctResponse = {};
      _.each(correctAnswers, function(val, key) {
        correctResponse[key] = _.pluck(val, 'id');
      });
      return correctResponse;
    }

    function onChangeCorrectAnswers(newCorrectAnswers) {
      if (newCorrectAnswers) {
        scope.fullModel.correctResponse = correctAnswersToCorrectResponse(newCorrectAnswers);
        scope.updateNumberOfCorrectResponses(sumCorrectAnswers());
      }
    }

    function removeChoice(id) {
      doRemoveChoice(scope.model.choices, id);
      _.each(scope.correctAnswers, function(choices, key) {
        doRemoveChoice(choices, id);
      });

      function doRemoveChoice(choices, id) {
        _.remove(choices, {
          id: id
        });
      }
    }

    function findFreeSlot(ids, prefix) {
      var slot = 1;
      while (_.contains(ids, prefix + slot)) {
        slot++;
      }
      return prefix + slot;
    }

    function findFreeChoiceSlot() {
      return findFreeSlot(_.pluck(scope.model.choices, 'id'), 'c_');
    }

    function addChoice() {
      scope.model.choices.push({
        id: findFreeChoiceSlot(),
        labelType: "text",
        label: "",
        moveOnDrag: false
      });
    }

    function findFreeAnswerAreaSlot() {
      return findFreeSlot(_.pluck(scope.model.answerAreas, 'id'), "aa_");
    }

    function addAnswerArea() {
      var answerAreaId = findFreeAnswerAreaSlot();
      scope.model.answerAreas.push({
        id: answerAreaId
      });
      scope.correctAnswers[answerAreaId] = [];
      return answerAreaId;
    }

    function removeAnswerArea(answerAreaId) {
      _.remove(scope.model.answerAreas, {
        id: answerAreaId
      });
      delete scope.correctAnswers[answerAreaId];
    }

    function onGetConfigScope(event, callback) {
      callback(scope);
    }

    function onRemoveCorrectAnswer(event, answerAreaId, index) {
      scope.correctAnswers[answerAreaId].splice(index, 1);
    }

    function choiceDraggableOptions(index) {
      return {
        index: index,
        placeholder: 'keep'
      };
    }

    function dragHelperTemplate(choice) {
      var $choice = $('li.draggable-choice[data-choice-id="' + choice.id + '"]');
      var $content = $choice.find(".content-holder");
      return [
          '<div class="drag-helper-csdndi">',
          $content[0].innerHTML,
          '</div>'
        ].join('');
    }

    function choiceDraggableJqueryOptions(choice) {
      return {
        revert: 'invalid',
        helper: function() {
          return $(dragHelperTemplate(choice));
        },
        appendTo: ".modal",
        cursorAt: {
          bottom: 10,
          right: 10
        },
        distance: 15

      };
    }

    function activate($event, $index) {
      $event.stopPropagation();
      scope.active = [];
      scope.active[$index] = true;
    }

    function itemClick($event) {
      if (isChoiceEditor($event)) {
        $event.stopPropagation();
        $event.preventDefault();
      } else {
        scope.deactivate();
      }

      function isChoiceEditor($event) {
        return $($event.target).parents('.mini-wiggi-wiz').length !== 0;
      }
    }

    function deactivate() {
      scope.active = [];
      scope.$emit('mathJaxUpdateRequest');
    }

    function canDragChoice(choice, index) {
      return !(scope.active[index] || choice.moveOnDrag === true && isPlaced(choice));
    }

    function makeCleanLabelFunction() {
      var wiggiCleanerRe = new RegExp(String.fromCharCode(8203), 'g');
      return function(choice) {
        return (choice.label || '').replace(wiggiCleanerRe, '');
      };
    }

  }

  function template() {
    return [
      '<div class="config-csdndi" choice-template-controller="">',
      '  <div navigator-panel="Design">',
      designOptions(),
      '  </div>',
      '  <div navigator-panel="Scoring">',
      scoringOptions(),
      '  </div>',
      '</div>'
    ].join('\n');

    function designOptions() {
      return [
        '<div class="container-fluid" ng-click="deactivate()">',
        introduction(),
        '  <div class="row choices-and-answers">',
        '    <div class="col-xs-6">',
        choices(),
        '    </div>',
        '    <div class="col-xs-6">',
        answerAreas(),
        '    </div>',
        '  </div>',
        feedback(),
        '</div>'
      ].join('\n');
    }

    function scoringOptions() {
      return [
        '<div class="container-fluid">',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        ChoiceTemplates.scoring(),
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }

    function introduction() {
      return [
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <p>',
          '      In Short Answer &mdash; Drag and Drop, students are asked to complete a ',
          '      sentence, word, phrase or equation using context clues presented in the ',
          '      text that surrounds it.',
          '    </p>',
          '    <p><i>',
          '      The "Remove tile after placing" option removes the answer from the choice area after ',
          '      a student places it in an answer area. <br>If you select this option on a choice, you ',
          '      may not add it to more than one answer blank.',
          '    </i></p>',
          '  </div>',
          '</div>'
        ].join('\n');
    }

    function answerAreas() {
      return [
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <label class="control-label" style="margin-bottom: 10px;">Problem Area</label>',
          '    <p class="answer-area-help-text">Begin typing and click "Add Answer Blank" to ',
          '        insert an answer blank. Drag the correct answer(s) to the blank(s).</p>',
          '  </div>',
          '</div>',
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <div id="answerAreaWiggi"',
          '      active="true"',
          '      class="answer-area-wiggi"',
          '      disable-auto-activation="true"',
          '      features="extraFeaturesForAnswerArea"',
          '      mini-wiggi-wiz=""',
          '      ng-model="model.answerAreaXhtml"',
          '      parent-selector=".modal-body">',
          '    </div>',
          '  </div>',
          '</div>'
        ].join("\n");
    }

    function choices() {
      return [
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <label class="control-label" style="margin-bottom: 10px;">Choices</label>',
          '    <p><b>Add a label to choice area (optional).</b></p>',
          '  </div>',
          '</div>',
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <div id="choiceLabelWiggi" ',
          '         mini-wiggi-wiz=""',
          '         ng-model="model.config.choiceAreaLabel"',
          '         placeholder="Choice Label"',
          '         features="extraFeaturesForChoiceLabel"',
          '         parent-selector=".modal-body">',
          '    </div>',
          '    <p><i class="legend">To set correct answer, drag choice to an answer blank in the problem area.</i></p>',
          '  </div>',
          '</div>',
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <remove-after-placing choices="fullModel.model.choices"></remove-after-placing>',
          '    <ul class="draggable-choices" ng-model="model.choices">',
          '      <li class="draggable-choice" ',
          '          data-choice-id="{{choice.id}}" ',
          '          ng-repeat="choice in model.choices"',
          '          ng-model="choice" ',
          '          ng-click="itemClick($event)" ',
          '          data-drag="{{canDragChoice(choice, $index)}}"',
          '          jqyoui-draggable="choiceDraggableOptions($index)"',
          '          data-jqyoui-options="choiceDraggableJqueryOptions(choice)">',
          '        <div class="blocker" ng-click="activate($event, $index)" ng-hide="active[$index]">',
          '          <div class="bg"></div>',
          '          <div class="content">',
          '            <ul class="edit-controls">',
          '              <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true"',
          '                  tooltip-placement="bottom" ng-click="activate($event, $index)">',
          '                <i class="fa fa-pencil"></i>',
          '              </li>',
          '              <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true"',
          '                  tooltip-placement="bottom" ng-click="removeChoice(choice.id)">',
          '                <i class="fa fa-trash-o"></i>',
          '              </li>',
          '            </ul>',
          '          </div>',
          '        </div>',
          '        <div class="remove-after-placing">',
          '          <checkbox id="moveOnDrag{{$index}}" ng-model="choice.moveOnDrag">',
          '            Remove tile after placing',
          '          </checkbox>',
          '        </div>',
          '        <span class="content-holder" ',
          '           ng-hide="active[$index]" ',
          '           ng-bind-html-unsafe="cleanLabel(choice)"></span>',
          '        <div ng-show="active[$index]"',
          '            active="active[$index]"',
          '            mini-wiggi-wiz=""',
          '            ng-model="choice.label"',
          '            features="extraFeaturesForChoices"',
          '            parent-selector=".modal-body">',
          '        </div>',
          '      </li>',
          '    </ul>',
          '  </div>',
          '</div>',
          '<div class="row add-choice-row">',
          '  <div class="col-xs-12">',
          '    <button type="button" class="btn btn-default add-choice"',
          '        ng-click="addChoice()">Add a Choice</button>',
          '  </div>',
          '</div>',
          '<div class="row shuffle-choices-row">',
          '  <div class="col-xs-12">',
          '    <checkbox class="shuffle-choices" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
          '  </div>',
          '</div>',
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <span>Display choices</span>',
          '    <select class="form-control choice-area-position" ng-model="model.config.choiceAreaPosition"',
          '       ng-options="c for c in [\'above\', \'below\']">',
          '    </select>',
          '  </div>',
          '</div>'
        ].join("\n");
    }

    function feedback() {
      return [
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <corespring-feedback-config ',
        '       full-model="fullModel"',
        '       component-type="corespring-drag-and-drop-inline"',
        '    ></corespring-feedback-config>',
        '  </div>',
        '</div>'
      ].join("\n");
    }

  }
}



function configAnswerAreaInline(
  $log,
  WIGGI_EVENTS
) {
  "use strict";
  return {
    scope: {},
    restrict: 'A',
    replace: true,
    link: link,
    template: template()
  };

  function link(scope, el, attr) {
    scope.$emit("get-config-scope", setConfigScope);

    function setConfigScope(configScope) {
      scope.answerAreaId = attr.answerAreaId;
      scope.correctAnswers = configScope.correctAnswers;
      scope.droppableOptions = {
        accept: function() {
          return !configScope.targetDragging;
        },
        distance: 5,
        activeClass: 'answer-area-inline-active',
        hoverClass: 'answer-area-inline-hover',
        tolerance: "pointer"
      };

      scope.cleanLabel = configScope.cleanLabel;
      scope.removeAnswerArea = removeAnswerArea;
      scope.removeCorrectAnswer = removeCorrectAnswer;
      scope.targetSortableOptions = targetSortableOptions;
      scope.trackId = trackId;


      //---------------------------------------

      function targetSortableOptions() {
        return {
          disabled: configScope.correctAnswers[scope.answerAreaId].length === 0,
          distance: 5,
          start: function() {
            configScope.targetDragging = true;
          },
          stop: function() {
            configScope.targetDragging = false;
          }
        };
      }

      function trackId(choice) {
        return _.uniqueId();
      }

      function removeCorrectAnswer(index) {
        scope.$emit("remove-correct-answer", scope.answerAreaId, index);
      }

      function removeTooltip() {
        scope.$broadcast("$destroy");
      }

      function removeAnswerArea() {
        removeTooltip();
        scope.$emit(WIGGI_EVENTS.DELETE_NODE, el);
        scope.$destroy();
      }

    }
  }

  function template() {
    return [
        '<div class="answer-area-inline">',
        '  <ul class="sortable-choices" ',
        '      ui-sortable="targetSortableOptions()" ',
        '      ng-model="correctAnswers[answerAreaId]"',
        '      data-drop="true" ',
        '      jqyoui-droppable="" ',
        '      data-jqyoui-options="droppableOptions">',
        '    <li class="sortable-choice" ',
        '        data-choice-id="{{choice.id}}" ',
        '        ng-repeat="choice in correctAnswers[answerAreaId] track by trackId(choice)">',
        '      <div class="delete-icon"',
        '        tooltip="remove choice" ',
        '        tooltip-append-to-body="true" ',
        '        tooltip-placement="bottom"',
        '        ng-click="removeCorrectAnswer($index)">',
        '        <i class="fa fa-close"></i>',
        '      </div>',
        '      <span ng-bind-html-unsafe="cleanLabel(choice)"></span>',
        '    </li>',
        '    <p class="prompt" ng-hide="correctAnswers[answerAreaId].length">',
        '      Drag correct answers here.',
        '    </p>',
        '  </ul>',
        '  <div class="delete-answer-area-button"',
        '      ng-click="removeAnswerArea()">',
        '    <i class="fa fa-times-circle"',
        '      tooltip="delete answer blank" ',
        '      tooltip-append-to-body="true" ',
        '      tooltip-placement="bottom">',
        '    </i>',
        '  </div>',
        '</div>'
      ].join("\n");
  }
}