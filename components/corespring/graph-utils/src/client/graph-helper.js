exports.framework = 'angular';
exports.factory = [ '$log', 'ScaleUtils', 'GraphElementFactory', 'RaphaelDecorator', function($log, ScaleUtils, GraphElementFactory, RaphaelDecorator) {

  var GraphUtils = function(element, options) {

    var that = this;

    var graphElementFactory  = new GraphElementFactory(that, options);

    options = options || {};
    _.defaults(options, {
      margin: {top: 30, right: 30, bottom: 30, left: 30},
      axisHeight: 20,
      domain: [0, 20],
      range: [0, 20],
      applyCallback: function() {
      },
      selectionChanged: function() {

      }
    });
    _.defaults(options, {
      width: (options.horizontalAxisLength + options.margin.left + options.margin.right),
      height: (options.verticalAxisLength + options.margin.top + options.margin.bottom) + options.axisHeight
    });


    $(element).width(options.width);
    $(element).height(options.height);

    this.paper = RaphaelDecorator.decoratePaper(Raphael(element));
    this.paper.rect(0, 0, options.width, options.height);

    this.width = options.width;
    this.height = options.height;
    this.margin = options.margin;
    this.elements = [];


    this.updateOptions = function(newOptions) {
      options = _.extend(options, newOptions);
      that.horizontalAxis.reCalculate();
      that.verticalAxis.reCalculate();
      that.redraw();
    };

    this.getSelectedElements = function() {
      var selectedPositions = [];
      _.each(this.elements, function(e) {
         if (e.selected) {
           selectedPositions.push(e.model.rangePosition);
         }
      });
      return selectedPositions;
    };

    this.clear = function() {
      _.each(that.elements, function(element) {
        if (element.detach) {
          element.detach();
        }
      });
      that.paper.clear();
      this.elements = [];
      this.redraw();
    };

    this.redraw = function() {
      _.each(that.elements, function(element) {
        if (element.detach) {
          element.detach();
        }
      });
      that.paper.clear();
      if (that.horizontalAxis) {
        that.horizontalAxis.draw(that.paper);
      }
      if (that.verticalAxis) {
        that.verticalAxis.draw(that.paper);
      }
      _.each(that.elements, function(element) {
        element.draw(that.paper);
      });
    };

    this.addHorizontalAxis = function(position, axisOptions) {
      that.horizontalAxis = new graphElementFactory.HorizontalAxis(position, axisOptions, options);
    };

    this.addVerticalAxis = function(position, axisOptions) {
      that.verticalAxis = new graphElementFactory.VerticalAxis(position, axisOptions, options);
    };

    this.addMovablePoint = function(pointModel, pointOptions) {
      that.elements.push(new graphElementFactory.MovablePoint(pointModel, pointOptions));
    };

    this.addMovableLineSegment = function(lineModel, lineOptions) {
      that.elements.push(new graphElementFactory.MovableLineSegment(lineModel, lineOptions));
    };

    this.addMovableRay = function(lineModel, lineOptions) {
      that.elements.push(new graphElementFactory.MovableRay(lineModel, lineOptions));
    };
  };

  return GraphUtils;
}];
