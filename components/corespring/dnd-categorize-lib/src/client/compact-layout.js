exports.framework = 'angular';
exports.factory = [function() {
  return CompactLayout;
}];

/**
 * @param initialConfig:
 *  container: jquery element of the container
 *  itemSelector: string selector of an item to be laid out
 *  numColumns: the desired number of columns
 *  cellWidth: the desired width of one column
 *  gutter: gutter to be added to the cellWidth
 *  paddingBottom: the padding to be added to the container height
 */
function CompactLayout(initialConfig, layoutRunner) {

  var hasNewConfig = false;
  var choiceSizeCache = [];
  var config = _.assign({
    paddingBottom: 0,
    gutter: 0
  }, initialConfig);

  this.updateConfig = updateConfig;
  this.refresh = refresh;
  this.start = startRunner;
  this.cancel = cancelRunner;

  this.start();

  //-----------------------------------------

  function refresh() {
    var choiceElements = config.container.find(config.itemSelector);

    if (!elementsShouldBeRendered(choiceElements)) {
      return;
    }

    var numColumns = config.numColumns;
    if (isNaN(numColumns) || numColumns === 0) {
      return;
    }

    var columns = _.range(numColumns).map(function() {
      return [];
    });

    _.forEach(choiceElements, function(choice) {
      smallestColumn(columns).push(choice);
    });

    columns.forEach(function(colChoices, colIndex) {
      colChoices.forEach(function(choice, choiceIndex) {
        $(choice).css({
          position: 'absolute',
          top: getChoiceTop(colChoices, choiceIndex),
          left: (config.cellWidth + config.gutter) * colIndex
        });
      }, this);
    }, this);

    //the choices are positioned absolutely
    //so the container height is not pushed
    config.container.css({
      height: getContainerHeight(columns) + config.paddingBottom
    });
  }

  function smallestColumn(columns) {
    return _.sortBy(columns, getColumnHeight)[0];
  }

  function elementsShouldBeRendered(choiceElements) {
    if (!hasNewConfig) {
      var heights = _(choiceElements).map(getElementHeight).value();
      var someElementsHaveZeroHeight = _.some(heights, function(height) {
        return height === 0;
      });
      if (someElementsHaveZeroHeight || _.isEqual(choiceSizeCache, heights)) {
        return false;
      }
      choiceSizeCache = heights;
    }
    hasNewConfig = false;
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
      paddingBottom: 0,
      gutter: 0
    }, config, newConfig);
  }

  function startRunner() {
    layoutRunner.start(this);
  }

  function cancelRunner() {
    layoutRunner.cancel();
  }
}