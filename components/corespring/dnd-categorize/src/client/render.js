function CompactLayout(initialConfig,interval){

   this.config = _.assign({
     gutter:0,
     border:0
   },initialConfig);

  this.nextRefreshHandle = null;

  this.runLater = function(block) {
    if (this.cancelled){
      return;
    }
    if (window.requestAnimationFrame) {
      this.nextRefreshHandle = window.requestAnimationFrame(block);
    } else {
      this.nextRefreshHandle = interval(block, 100, 1);
    }
  };

  function getElementHeight(el) {
    if (!el) {
      return 0;
    }
    return $(el).height();
  }

  this.choiceSizeCache = [];

  this.cancel = function(){
    this.cancelled = true;
    if (this.nextRefreshHandle){
      if (window.requestAnimationFrame) {
        window.cancelAnimationFrame(this.nextRefreshHandle);
      } else {
         interval.cancel(this.nextRefreshHandle);
      }
    }
  };

  this.start = function(){
    this.cancelled = false;
    this.refresh();
  };

  this.updateConfig = function(newConfig){
    this.newConfig = true;
    this.config = _.assign(this.config ,newConfig);
  };

  this.refresh = function(){

    this.runLater(_.bind(this.refresh,this));

    var choiceElements = this.config.container.find(this.config.itemSelector);

    var reverseSortedChoices = _(_.sortBy(choiceElements, getElementHeight)).reverse().value();

    var reverseSortedChoicesHeights = _(reverseSortedChoices).map(getElementHeight).value();

    var someElementsHaveZeroHeight = _.some(reverseSortedChoicesHeights, function (height) {
      return height === 0;
    });

    if (!this.newConfig && (someElementsHaveZeroHeight || _.isEqual(this.choiceSizeCache, reverseSortedChoicesHeights))) {
      return;
    }

    this.newConfig = false;

    this.choiceSizeCache = reverseSortedChoicesHeights;

    var numColumns = Math.floor(this.config.container.width()/this.config.cellWidth);

    var columns = _.map(_.range(numColumns), function () {
      return [];
    });

    if (!columns || columns.length === 0) {
      return;
    }

    function getColumnHeight(column) {
      return _.reduce(column, function (acc, el) {
        return acc + $(el).height();
      }, 0);
    }

    _.forEach(reverseSortedChoices, function (choice) {
        var sortedColumns = _.sortBy(columns, getColumnHeight);
        sortedColumns[0].push(choice);
    });

    this.getChoiceTop =function(choices, index) {
      return _.reduce(_.take(choices, index), function (acc, choice) {
          return $(choice).height() + acc;
        }, 0) + (this.config.gutter * index);
    };

    columns.forEach(function (colChoices, colIndex) {
      colChoices.forEach(function (choice, choiceIndex) {
        $(choice).css({
          position: 'absolute',
          top: this.getChoiceTop(colChoices, choiceIndex),
          left: (this.config.cellWidth + this.config.gutter) * colIndex
        });
      },this);
    },this);

    this.getContainerHeight = function() {
      var tallestColumn = _.sortBy(columns, getColumnHeight)[columns.length - 1];
      // Simplistic border width calculation
      return getColumnHeight(tallestColumn) +
        ((tallestColumn.length - 1) * (this.config.gutter + (this.config.border || 0)));
    };

    this.config.container.css({
      height: this.getContainerHeight()
    });
  };

  this.runLater(_.bind(this.refresh,this));
}

var main = ['$interval',
  function( $interval) {

    function byModelId(id){
      return function(object){
        return object.model.id === id;
      };
    }

    function byId(id){
      return function(object){
        return object.id === id;
      };
    }

    function all(){
      return true;
    }

    function link(scope, elem, attrs) {

      scope.isEditMode = attrs.mode === 'edit';

      scope.onCategoryDrop = function (categoryId, choiceId) {
        var category = _.find(scope.categories, byModelId(categoryId));
        var choiceInCategory = _.find(category.choices, byModelId(choiceId));
        if (!choiceInCategory) {
          var choice = _.find(scope.allChoices || scope.choices, byId(choiceId));
          scope.$apply(function () {
            category.choices.push(wrapChoiceModel(choice));
          });

          if (choice.moveOnDrag && !scope.isEditMode){
            _.remove(scope.choices,byId(choiceId));
          }
        }
      };

      scope.onCategoryDeleteClicked = function(categoryId){
        _.remove(scope.categories,byModelId(categoryId));
        _.remove(scope.categories,byModelId(categoryId));
      };

      function findInAllCategories(choiceId){
        return _.find(scope.categories,function(category){
          return _.find(category.choices, byModelId(choiceId)) !== undefined;
        });
      }

      scope.onChoiceRemovedFromCategory = function (categoryId, choiceId) {
        var category = _.find(scope.categories, byModelId(categoryId));
        if (category){
          _.remove(category.choices, byModelId(choiceId));
          var choice = _.find(scope.allChoices || scope.choices, byId(choiceId));
          if (!scope.isEditMode && choice && choice.moveOnDrag && !findInAllCategories(choiceId)){
            scope.choices.push(choice);
          }
        }
      };

      scope.onChoiceDeleteClicked = function (choiceId){
        _.remove(scope.choices,byId(choiceId));
        _.forEach(scope.categories, function(category){
          if (category){
            _.remove(category.choices,byId(choiceId));
          }
        });
      };

      scope.rows = [[]];
      scope.correctAnswerRows = [[]];

      function wrapChoiceModel(choiceModel){
        return {
          model:choiceModel,
          correctness: "none"
        };
      }

      function wrapCategoryModel(categoryModel){
        return {
          model:categoryModel,
          choices: []
        };
      }

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {

          this.reset();

          scope.session = dataAndSession.session || {};

          scope.choices = dataAndSession.data.model.config.shuffle ?
            _.shuffle(dataAndSession.data.model.choices) :
            _.take(dataAndSession.data.model.choices, all);

          scope.allChoices = _.take(scope.choices, all);

          scope.categories = _.map(dataAndSession.data.model.categories,wrapCategoryModel);

          _.forEach(scope.categories, function(category){
            category.choices = category.choices || [];
          });

          scope.maxCategoriesPerRow = dataAndSession.data.model.config.maxCategoriesPerRow || 3;

          scope.shouldFlip = dataAndSession.data.model.config.answerAreaPosition === 'above';

          updateView();

        },

        getSession: function() {

          var answers = _.reduce(scope.categories,function(result, category){
            var catId = category.model.id;
            result[catId] = _.map(category.choices, function(choice){
              return choice.model.id;
            });
            return result;
          },{});

          return {
            answers: answers
          };
        },

        setResponse: function(response) {

          scope.response = response;
          scope.feedback = response.feedback;
          scope.correctClass = response.correctClass;

          // Update categories with responses
          _.forEach(scope.categories,function(category){
            var correctChoices = response.correctResponse[category.model.id];
            _.forEach(category.choices,function(choice){
              if (_.contains(correctChoices,choice.model.id)){
                choice.correctness = 'correct';
              }else {
                choice.correctness = 'incorrect';
              }
            });
          });

          // Create model for see correct answer section
          function createNewCategoryModelWithChoices(category,correctChoices){
            var newCategory = _.cloneDeep(category);
            newCategory.choices = _.map(correctChoices,function(correctChoiceId){
              var choiceModel = _.find(scope.allChoices,byId(correctChoiceId));
              var choice = wrapChoiceModel(choiceModel);
              choice.correctness = 'correct';
              return choice;
            });
            return newCategory;
          }

          var maxCategoriesPerRow = parseInt(scope.maxCategoriesPerRow,10);
          scope.correctAnswerRows = [[]];

          _.forEach(scope.categories,function(category){
            var lastrow = scope.correctAnswerRows[scope.correctAnswerRows.length - 1];
            if (lastrow.length === maxCategoriesPerRow){
              scope.correctAnswerRows.push([]);
              lastrow = scope.correctAnswerRows[scope.correctAnswerRows.length - 1];
            }
            var correctChoices = response.correctResponse[category.model.id];
            lastrow.push(createNewCategoryModelWithChoices(category,correctChoices));
          });
        },

        reset: function() {
          scope.choices = _.take(scope.allChoices,all);
          scope.response = undefined;
          scope.feedback = undefined;
          _.forEach(scope.categories,function(category){
            category.choices = [];
          });
        }
      };

      if (attrs.mode === 'edit'){
        scope.$watch('attrCategories.length + "_" + attrChoices.length',function(){
          scope.choices = scope.attrChoices;
          scope.categories = scope.attrCategories;
          scope.shouldFlip = false;
        });
      }

      scope.$watch('response',function(){
        updateIsDragEnabled();
      });

      function updateIsDragEnabled(){
        scope.isDragEnabled = _.isUndefined(scope.response) ;
        scope.isDragEnabledFromCategory = scope.isDragEnabled && !scope.isEditMode;
      }

      function cellWidth(gutter) {
        if (!scope.categories){
          return 0;
        }
        var maxCategoriesPerRow = parseInt(scope.maxCategoriesPerRow,10);
        var numActualCategoriesPerRow = Math.min(maxCategoriesPerRow, scope.categories.length);
        return (elem.width() - (gutter * (numActualCategoriesPerRow - 1))) / numActualCategoriesPerRow;
      }

      var GUTTER = 10;
      var layout = new CompactLayout({
        container: elem.find(".container-choices"),
        itemSelector: ".choice",
        cellWidth: cellWidth(GUTTER),
        gutter: GUTTER,
        border:4
      },$interval);

      var updateView = function(){

        if (!scope.categories || ! scope.choices){
          return;
        }

        var maxCategoriesPerRow = parseInt(scope.maxCategoriesPerRow,10);

        if (!isNaN(maxCategoriesPerRow)) {
          var rows = [[]];

          _.forEach(scope.categories, function (category) {
            var lastrow = rows[rows.length - 1];
            if (lastrow.length === maxCategoriesPerRow) {
              rows.push([]);
              lastrow = rows[rows.length - 1];
            }
            lastrow.push(category);
          });

          scope.rows = rows;

          scope.categoryStyle = {
            "width": cellWidth(20)
          };

          scope.choiceStyle = {
            "width": cellWidth(GUTTER)
          };

          layout.updateConfig({
            container: elem.find(".container-choices"),
            cellWidth: cellWidth(GUTTER)
          });
        }
      };


      scope.$watch('choices.length + "_" + categories.length', updateView);
      scope.$watch('maxCategoriesPerRow', updateView);
      scope.$watch('shouldFlip', updateView);

      scope.isSeeCorrectAnswerOpen = false;

      scope.showSeeCorrectAnswer = function(response){
        if (!response){
          return false;
        }
        return response.correctness !== 'correct';
      };

      scope.getEditMode = function(choice){
        if (!scope.isEditMode){
          return '';
        }
        if (choice === scope.editedChoice){
          return 'editing';
        }
        return 'editable';
      };

      scope.onChoiceEditClicked = function(choiceId){

        scope.editedChoice = _.find(scope.choices,byId(choiceId));

        console.log('editedChoice',choiceId);

        layout.cancel();

        var choiceElSlector = '.container-choices [choiceid="' + choiceId + '"]';
        var choiceElement = elem.find(choiceElSlector);

        $('body').on('click', function(e) {
          var $target = $(e.target);
          if (choiceElement.has($target).length === 0 && scope.editedChoice && scope.editedChoice.id === choiceId) {

            layout.start();
            scope.editedChoice = null;
          }
        });

      };

      if (!scope.isEditMode){
        scope.$emit('registerComponent', attrs.id, scope.containerBridge, elem[0]);
      }

      updateIsDragEnabled();
    }

    var choicesTemplate = [
      ' <div class="container-choices" ng-if="{flipp}">',
      '   <div  choice="true" ng-repeat="choice in choices track by choice.id" ',
      '         drag-enabled="isDragEnabled" edit-mode="getEditMode(choice)" ',
      '         model="choice" ',
      '         choiceId="{{choice.id}}" ',
      '         on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
      '         on-edit-clicked="onChoiceEditClicked(choiceId)" ',
      '         delete-after-replacing="choice.moveOnDrag" ',
      '         ng-style="choiceStyle" image-service="imageService" ></div>',
      ' </div>'
    ].join('');

    var categoriesTemplate = [
      ' <div class="categories" ng-if="{flipp}">',
      '   <div class="row" ng-repeat="row in {rowsModel}">',
      '     <div  category="true" ng-repeat="category in row" label="category.model.label" ',
      '           drag-enabled="isDragEnabledFromCategory" edit-mode="isEditMode" ',
      '           on-drop="onCategoryDrop(categoryId,choiceId)" ',
      '           on-delete-clicked="onCategoryDeleteClicked(categoryId)" ',
      '           on-delete-choice-clicked="onChoiceRemovedFromCategory(categoryId,choiceId)" ',
      '           on-choice-dragged-away="onChoiceRemovedFromCategory(fromCategoryId,choiceId)" ',
      '           categoryId="{{category.model.id}}" ',
      '           choices="category.choices" ng-style="categoryStyle"></div>',
      '   </div>',
      ' </div>'
    ].join('');


    var seeSolutionTemplate = [
        ' <div class="panel feedback correct-answer" ng-if="showSeeCorrectAnswer(response)">',
        '   <div class="panel-heading" ng-click="isSeeCorrectAnswerOpen=!isSeeCorrectAnswerOpen">',
        '     <span class="toggle" ng-class="{true:\'fa-eye-slash\', false:\'fa-eye\'}[isSeeCorrectAnswerOpen]"></span>',
        '     <span class="label" ng-if="isSeeCorrectAnswerOpen">Hide correct answer</span>',
        '     <span class="label" ng-if="!isSeeCorrectAnswerOpen">Show correct answer</span>',
        '   </div>',
        '   <div class="panel-body"  ng-show="isSeeCorrectAnswerOpen">',
            categoriesTemplate.replace("{flipp}","true").replace("{rowsModel}","correctAnswerRows"),
        '   </div>',
        ' </div>'
      ].join("");

    return {
      restrict: 'AE',
      replace: true,
      link: link,
      scope: {
        mode: '@',
        attrCategories: '=?categories',
        attrChoices: '=?choices',
        maxCategoriesPerRow: "=?maxCategoriesPerRow",
        imageService: "=?imageService"
      },
      template: [
        '<div class="view-dnd-categorize">',
           choicesTemplate.replace("{flipp}","shouldFlip"),
           categoriesTemplate.replace("{flipp}","!shouldFlip").replace("{rowsModel}","rows"),
        '  <hr/>',
        '  <span ng-if="isEditMode" class="choice-area-label">Enter choices below and drag to correct categories above. Choice tiles may be reused unless “Remove Tile after Placing” option is selected.</span>',
           choicesTemplate.replace("{flipp}","!shouldFlip"),
           categoriesTemplate.replace("{flipp}","shouldFlip").replace("{rowsModel}","rows"),
        '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
           seeSolutionTemplate,
        '</div>'
      ].join('')
    };
}];

// ---------------------------------------------------------------------------------------------------------------------

var deleteTool =
  ' <li tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom" class="delete-icon-button" ng-click="onDeleteClicked()">' +
  '   <i ng-click="deleteNode($event)" class="fa fa-trash-o"></i>' +
  ' </li>';

var editControlsDelete = [
  '<ul class="edit-controls" ng-if="showTools">',
    deleteTool,
  '</ul>'].join('');

var category = [function(){

  function link(scope, elem, attrs){

    scope.onDeleteClicked = function(){
      scope.$$postDigest(function(){
        scope.notifyDeleteClicked({
          categoryId: attrs.categoryid
        });
      });
    };

    scope.onChoiceDeleteClicked = function(choiceId){
      scope.notifyDeleteChoiceClicked({
        categoryId: attrs.categoryid,
        choiceId:choiceId
      });
    };

    scope.onDropCallback = function (e,draggable) {

      var choiceId = draggable.draggable.attr('choiceId');
      scope.isDraggedOver = false;
      scope.$$postDigest(function(){
        scope.onDrop({
          categoryId: attrs.categoryid,
          choiceId: choiceId
        });
      });
    };

    scope.onOverCallback = function(e,draggable){

      var isChoiceId = draggable.draggable.attr('choiceId');

      if (isChoiceId !== "" && !isLocalChoiceDragged ){
        scope.$apply(function(){
          scope.isDraggedOver = true;
        });
      }
    };

    scope.onOutCallback = function(){
      scope.$apply(function(){
        scope.isDraggedOver = false;
      });
    };

    var isLocalChoiceDragged = false;

    scope.onLocalChoiceDragStart = function(choiceId){
      isLocalChoiceDragged = true;
    };

    scope.onLocalChoiceDragEnd = function(choiceId,dropEffect){

      isLocalChoiceDragged = false;

      scope.onChoiceDraggedAway({
        fromCategoryId: attrs.categoryid,
        choiceId: choiceId
      });
    };

    scope.choiceEditMode = scope.isEditMode ? 'delete' : '';
    scope.showTools = scope.isEditMode;
  }

  return {
    restrict: 'A',
    replace: true,
    scope: {
      label: '=',
      dragEnabled: '=',
      choices: '=choices',
      onDrop: '&onDrop',
      onChoiceDraggedAway: '&onChoiceDraggedAway',
      notifyDeleteClicked: '&onDeleteClicked',
      notifyDeleteChoiceClicked: '&onDeleteChoiceClicked',
      isEditMode: '=?editMode'
    },
    link: link,
    template: [
      '<div class="category" ng-class="{draggedOver:isDraggedOver}" ',
      '     data-drop="true" jqyoui-droppable="{multiple:true,onDrop:\'onDropCallback()\',onOver:\'onOverCallback()\',onOut: \'onOutCallback\'}"',
      '     >',
      ' <h4 ng-if="!isEditMode">{{label}}</h4>',
      ' <h4><input class="label-input" type="text" ng-if="isEditMode" ng-model="$parent.label" ></h4>',
        editControlsDelete ,
      ' <div class="categorized choices" >',
      '   <div class="choice-container" ng-class="{draggedOver:isDraggedOver}" >',
      '     <div choice="true" model="choice.model" edit-mode="choiceEditMode" ',
      '           correctness="{{choice.correctness}}" ',
      '           ng-repeat="choice in choices track by $index" drag-enabled="dragEnabled" ',
      '           choiceId="{{choice.model.id}}" ',
      '           on-drag-start-now="onLocalChoiceDragStart(choiceId)" ',
      '           on-delete-clicked="onChoiceDeleteClicked(choiceId)" ',
      '           on-drag-end="onLocalChoiceDragEnd(choiceId,dropEffect)" ></div>',
      '   </div>',
      ' </div>',
      '</div>'
    ].join('')
  };
}];

// ---------------------------------------------------------------------------------------------------------------------

var choice = ['$sce','MiniWiggiScopeExtension', function($sce,MiniWiggiScopeExtension){

  function link(scope, elem, attrs){

    new MiniWiggiScopeExtension().postLink(scope);

    scope.onStart = function(){
      scope.onDragStart({
        choiceId: attrs.choiceid
      });
    };

    scope.onStop = function(){
      scope.onDragEnd({
        choiceId: attrs.choiceid
      });
    };

    scope.onDeleteClicked = function(){
      scope.notifyDeleteClicked({
        choiceId: attrs.choiceid
      });
    };

    scope.canEdit= function(){
      return _.contains(scope.editMode,'editable') || _.contains(scope.editMode,'editing');
    };

    scope.isEditing = function(){
      return _.contains(scope.editMode,'editing');
    };

    scope.canDelete= function(){
      return _.contains(scope.editMode,'delete');
    };

    function updateClasses(){
      var classes = [attrs.choiceId];

      if (scope.correctness && scope.correctness !== ""){
        classes.push(scope.correctness);
      }
      if (scope.canEdit()){
        classes.push('editable');
      }
      if (scope.isEditing()){
        classes.push('editing');
      }
      if (scope.canDelete()){
        classes.push('delete');
      }

      scope.classes = classes;
    }

    scope.onChoiceEditClicked = function(){
      scope.notifyEditClicked({
        choiceId: attrs.choiceid
      });
    };

    scope.$watch('correctness',updateClasses);

    scope.$watch('model.html',function(){
      $(window).trigger("resize");
    });

    updateClasses();

    scope.showTools = scope.canEdit(scope.editMode) || scope.canDelete(scope.editMode);

    scope.draggedParent = scope.canEdit(scope.editMode) ? ".modal" : "body";

    scope.isDragEnabled = function(){
      return scope.dragEnabled && !scope.isEditing();
    };
  }

  var choiceEditorTemplate = [
    '<div class="editor" mini-wiggi-wiz="" dialog-launcher="external" ng-model="model.html" placeholder="Enter a choice"',
    '       image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
    '       parent-selector=".modal-body">',
    '     <edit-pane-toolbar alignment="bottom">',
    '       <div class="btn-group pull-right">',
    '         <button ng-click="closePane()" class="btn btn-sm btn-success">Done</button>',
    '       </div>',
    '     </edit-pane-toolbar>',
    '</div>'].join('');

  return {
    link: link,
    restrict: 'EA',
    replace: true,
    scope: {
      dragEnabled:'=',
      model: '=',
      correctness: '@',
      onDragStart: '&onDragStartNow',
      onDragEnd: '&onDragEnd',
      notifyDeleteClicked: '&onDeleteClicked',
      notifyEditClicked: '&onEditClicked',
      editMode: '=?editMode',
      deleteAfterReplacing: '=?deleteAfterReplacing',
      imageService: "=?"
    },
    template: [
      '<div class="choice item" data-drag="isDragEnabled()" ng-class="classes"',
      '      jqyoui-draggable="{animate:true, placeholder:\'keep\',onStart:\'onStart()\',onStop:\'onStop()\'}" ',
      '      data-jqyoui-options="{revert: \'invalid\', helper: \'clone\',appendTo:\'{{draggedParent}}\'}" >',

      '   <ul class="edit-controls" ng-if="showTools">',
      '      <li tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom" class="delete-icon-button" ng-click="onDeleteClicked()">',
      '        <i ng-click="deleteNode($event)" class="fa"></i>',
      '      </li>',
      '      <li tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom" class="edit-icon-button" ng-click="onChoiceEditClicked()">',
      '        <i ng-click="editNode($event)" class="fa fa-pencil"></i>',
      '      </li>',
      '   </ul>',

      '   <div class="shell" ng-if="showTools" ng-show="isEditing()" >',
            choiceEditorTemplate,
      '   </div>',

      '   <div class="shell" ng-bind-html-unsafe="model.html" ng-if="!isEditing()"></div>',
      '   <div class="delete-after-placing" ng-click="onDeleteAfterPlacingClicked()" ng-if="showTools">',
      '     <checkbox ng-model="model.moveOnDrag" class="control-label">unique</checkbox>',
      '   </div>',
      '</div>'
    ].join('')
  };
}];


exports.framework = 'angular';
exports.directives = [
  { directive: main },
  { name: "category", directive: category},
  { name: "choice", directive: choice}
];