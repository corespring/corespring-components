exports.framework = 'angular';
exports.factory = [function() {

  return CompactLayoutWhileEditing;

  /**
   *
   * @param initialConfig
   *  container: jquery element of the container
   *  editedElement: one of the items in the container that is being edited
   * @param interval
   * @constructor
   *
   * This layout manager tracks the height of an edited component and adjusts components positioned
   * after the edited one in the column
   */
  function CompactLayoutWhileEditing(initialConfig, layoutRunner) {

    this.config = initialConfig;
    this.runner = layoutRunner;

    function isAbove(thisEl) {
      return function(thatEl) {
        var thisTop = thisEl.position().top;
        var thisLeft = thisEl.position().left;
        var thatTop = $(thatEl).position().top;
        var thatLeft = $(thatEl).position().left;
        return thisTop < thatTop && thisLeft === thatLeft;
      };
    }

    function byElementTopPosition(el) {
      var jqel = $(el);
      return jqel.position().top + jqel.height();
    }

    this.refresh = function() {
      var editedElement = this.config.editedElement;
      var choiceElements = this.config.container.find(this.config.itemSelector);
      var elementsAboveEdited = _.filter(choiceElements, isAbove(editedElement));

      elementsAboveEdited = _.sortBy(elementsAboveEdited, byElementTopPosition);

      var lastBottom = this.config.editedElement.position().top + this.config.editedElement.height();

      for (var i = 0; i < elementsAboveEdited.length; i++) {
        var jqel = $(elementsAboveEdited[i]);

        jqel.css({
          top: lastBottom
        });

        lastBottom = lastBottom + jqel.height();
      }

      this.getContainerHeight = function() {
        return _.reduce(choiceElements, function(acc, el) {
          var jqel = $(el);
          var elBottom = jqel.position().top + jqel.height();
          return acc < elBottom ? elBottom : acc;
        }, 0);
      };

      this.config.container.css({
        height: this.getContainerHeight()
      });
    };

    this.start = function(newConfig) {
      this.config = _.assign(this.config, newConfig);
      this.runner.start(this);
    };

    this.cancel = function() {
      this.runner.cancel();
    };
  }

}];