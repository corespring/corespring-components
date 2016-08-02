exports.framework = 'angular';
exports.factory = [function() {
  return CompactLayout;
}];

/**
 * This layout looks at the height of the elements and tries to
 * fill the columns as good as possible. Basically it iterates through
 * the items and places the current item in the smallest column.
 * Also the content is centered.
 *
 * @param initialConfig:
 *  container: jquery element of the container
 *  itemSelector: string selector of an item to be laid out
 *  numColumns: the desired number of columns, can also be a function
 *  cellWidth: the desired width of one column as function
 *  paddingBottom: the padding to be added to the container height
 */
function CompactLayout(initialConfig, layoutRunner) {

  var hasNewConfig = true;
  var choiceSizeCache = [];
  var lastWidth = -1;
  var beforeRenderFuncs = [];
  var afterRenderFuncs = [];
  var config = _.assign({
    paddingBottom: 0
  }, initialConfig);

  this.cancel = cancelRunner;
  this.onAfterRender = onAfterRender;
  this.onBeforeRender = onBeforeRender;
  this.refresh = refresh;
  this.start = startRunner;
  this.updateConfig = updateConfig;

  this.start();

  //-----------------------------------------

  function refresh() {
    var numColumns = _.isFunction(config.numColumns) ? config.numColumns() : config.numColumns;
    if (isNaN(numColumns) || numColumns <= 0) {
      return;
    }

    if(!_.isFunction(config.cellWidth)){
      return;
    }

    var cellWidth = config.cellWidth();
    if( cellWidth === 0){
      return;
    }
    
    var choiceElements = config.container.find(config.itemSelector);
    if (!elementsShouldBeRendered(choiceElements)) {
      if(!widthHasChanged(cellWidth)) {
        return;
      }
    }

    execBeforeRender(cellWidth);

    var columns = _.range(numColumns).map(function() {
      return [];
    });

    _.forEach(choiceElements, function(choice) {
      smallestColumn(columns).push(choice);
    });

    var paddingLeft = Math.max(0, (config.container.width() - numColumns * cellWidth) / 2);

    columns.forEach(function(colChoices, colIndex) {
      colChoices.forEach(function(choice, choiceIndex) {
        var choiceCss = {
          position: 'absolute',
          left: (paddingLeft + cellWidth * colIndex),
          top: getChoiceTop(colChoices, choiceIndex),
          width: cellWidth
        };
        $(choice).css(choiceCss);
      }, this);
    }, this);

    //the choices are positioned absolutely
    //which means the container height is not pushed.
    //Therefor we have to set the height explicitly
    config.container.css({
      height: getContainerHeight(columns) + config.paddingBottom
    });

    hasNewConfig = false;
    execAfterRender();
  }

  function onBeforeRender(func){
    beforeRenderFuncs.push(func);
  }

  function execBeforeRender(cellWidth){
    _.forEach(beforeRenderFuncs, function(func, index){
      func(cellWidth);
    });
  }

  function onAfterRender(func){
    afterRenderFuncs.push(func);
  }

  function execAfterRender(){
    _.forEach(afterRenderFuncs, function(func){
      func();
    });
  }

  function smallestColumn(columns) {
    return _.sortBy(columns, getColumnHeight)[0];
  }

  function widthHasChanged(cellWidth){
    if(cellWidth !== lastWidth){
      lastWidth = cellWidth;
      return true;
    }
    return false;
  }

  function elementsShouldBeRendered(choiceElements) {
    if (!hasNewConfig) {
      var heights = _.map(choiceElements, getElementHeight);
      var someElementsHaveZeroHeight = _.some(heights, function(height) {
        return height === 0;
      });
      if (someElementsHaveZeroHeight || _.isEqual(choiceSizeCache, heights)) {
        return false;
      }
      choiceSizeCache = heights;
    }
    return true;
  }

  function getChoiceTop(choices, index) {
    return _.reduce(_.take(choices, index), function(acc, choice) {
      return $(choice).height() + acc;
    }, 0);
  }

  function getContainerHeight(columns) {
    var tallestColumn = _.last(_.sortBy(columns, getColumnHeight));
    return getColumnHeight(tallestColumn);
  }

  function getColumnHeight(column) {
    return _.reduce(column, function(acc, el) {
      return acc + $(el).height();
    }, 0);
  }

  function getElementHeight(el) {
    if (!el) {
      return 0;
    }
    return $(el).height();
  }

  function updateConfig(newConfig) {
    hasNewConfig = true;
    config = _.assign({
      paddingBottom: 0
    }, config, newConfig);
  }

  function startRunner() {
    layoutRunner.start(this);
  }

  function cancelRunner() {
    layoutRunner.cancel();
  }
}