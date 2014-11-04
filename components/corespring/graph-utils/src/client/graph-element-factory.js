var BASE_COLOR = "#000";
var SELECTED_COLOR = "#aaf";
var EMPTY_COLOR = "#fff";
var DEFAULT_STROKE_WIDTH = 3;

exports.framework = 'angular';
exports.factory = [ '$log', 'ScaleUtils', function($log, ScaleUtils) {

  function cancelEvent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  var GraphElementFactory = function(graph, options) {

    function cancelEvent(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    var that = graph;
    var factory = this;

    this.MovablePoint = function(pointModel, pointOptions) {
      var thisPoint = this;
      this.model = pointModel;
      this.selected = false;
      pointOptions = pointOptions || {};
      pointOptions = _.defaults(pointOptions || {}, {
        size: 10,
        strokeColor: BASE_COLOR,
        fillColor: pointOptions.pointType === 'empty' ? EMPTY_COLOR : BASE_COLOR,
        selectedFillColor: pointOptions.pointType === 'empty' ? EMPTY_COLOR : SELECTED_COLOR,
        selectedStrokeColor: SELECTED_COLOR
      });
      this.detach = function() {
        this.point = undefined;
      };
      this.remove = function() {
        if (this.point) {
          this.point.remove();
        }
        this.detach();
      };
      this.moveTo = function(d, r) {
        var tickDp = that.horizontalAxis.scale.snapToTicks(that.horizontalAxis.ticks, d);
        if (tickDp !== pointModel.domainPosition) {
          pointModel.domainPosition = tickDp;
          this.draw();
        }
      };
      this.draw = function() {
        var start = function(x,y,ev) {
          this.ox = this.attr("cx");
          this.oy = this.attr("cy");
          this.animate({r: pointOptions.size + 5, opacity: 0.25}, 200, ">");
          this.hasMoved = false;
          cancelEvent(ev);
        };

        var move = function(dx, dy) {
          var newX = (this.ox + dx - options.margin.left);
          var dp = that.horizontalAxis.scale.invert(newX);
          var tickDp = that.horizontalAxis.scale.snapToTicks(that.horizontalAxis.ticks, dp);
          var dpx = that.horizontalAxis.scale(tickDp) + options.margin.left;
          this.attr({cx: dpx});
          if (pointModel.domainPosition !== tickDp) {
            pointModel.domainPosition = tickDp;
            if (pointOptions.onMove) {
              pointOptions.onMove(tickDp);
            }
            options.applyCallback();
            this.hasMoved = true;
          }

        };
        var up = function(ev) {
          this.animate({r: pointOptions.size, opacity: 1}, 200, ">");
          if (!this.hasMoved) {
            thisPoint.selected = !thisPoint.selected;
            thisPoint.draw();
            if (pointOptions.onSelectionChanged) {
              pointOptions.onSelectionChanged(thisPoint.selected);
            }
            options.selectionChanged();
          } else {
            if (pointOptions.onMoveFinished) {
              pointOptions.onMoveFinished(pointModel.domainPosition);
            }
          }
          cancelEvent(ev);
        };

        var x = that.horizontalAxis.scale(pointModel.domainPosition);
        var y = that.verticalAxis.scale(pointModel.rangePosition);
        if (_.isUndefined(this.point)) {
          this.point = that.paper.circle(x + options.margin.left, options.height - options.margin.bottom - options.axisHeight - y, pointOptions.size);
          this.point.drag(move, start, up);
          this.point.click(cancelEvent);
        }
        this.point.attr("cx", x + options.margin.left);
        this.point.attr("cy", options.height - options.margin.bottom - options.axisHeight - y);
        this.point.attr("r", pointOptions.size);
        this.point.attr("fill", thisPoint.selected ? pointOptions.selectedFillColor : pointOptions.fillColor);
        this.point.attr("stroke", thisPoint.selected ? pointOptions.selectedStrokeColor : pointOptions.strokeColor);
        this.point.attr("stroke-width", DEFAULT_STROKE_WIDTH);

      };
      return this;
    };

    this.MovableLineSegment = function(lineModel, pointOptions) {
      pointOptions = pointOptions || {};
      var thatLI = this;
      this.selected = false;
      this.model = lineModel;
      function updateLineModel() {
        lineModel.domainPosition = thatLI.p1.model.domainPosition;
        lineModel.rangePosition = thatLI.p1.model.rangePosition;
        lineModel.size = thatLI.p2.model.domainPosition - thatLI.p1.model.domainPosition;

        options.applyCallback();
      }

      var p1Opts = {
        fillColor: pointOptions.leftPoint === "empty" ? EMPTY_COLOR : BASE_COLOR,
        selectedFillColor: pointOptions.leftPoint === "empty" ? EMPTY_COLOR : BASE_COLOR,
        onMove: function(newPos) {
          thatLI.drawLine();
          updateLineModel();
        },
        onMoveFinished: function() {
          if (thatLI.p1.model.domainPosition > thatLI.p2.model.domainPosition) {
            var d1 = thatLI.p1.model.domainPosition;
            var d2 = thatLI.p2.model.domainPosition;
            thatLI.p2.moveTo(d1);
            thatLI.p1.moveTo(d2);
          }
        },
        onSelectionChanged: function(sel) {
          thatLI.selected = sel;
          thatLI.p1.selected = sel;
          thatLI.p2.selected = sel;
          thatLI.draw();
        }
      };
      var p2Opts = _.extend(_.clone(p1Opts), {
        fillColor: pointOptions.rightPoint === "empty" ? EMPTY_COLOR : BASE_COLOR,
        selectedFillColor: pointOptions.rightPoint === "empty" ? EMPTY_COLOR : BASE_COLOR,
      });

      this.p1 = new factory.MovablePoint({domainPosition: lineModel.domainPosition, rangePosition: lineModel.rangePosition}, p1Opts);

      this.p2 = new factory.MovablePoint({domainPosition: lineModel.domainPosition + lineModel.size, rangePosition: lineModel.rangePosition}, p2Opts);

      this.detach = function() {
        this.line = undefined;
        this.p1.detach();
        this.p2.detach();
      };

      this.remove = function() {
        if (this.line) {
          this.line.remove();
        }
        this.p1.remove();
        this.p2.remove();
        this.detach();
      };

      this.drawLine = function() {
        var x = options.margin.left + that.horizontalAxis.scale(this.p1.model.domainPosition);
        var x1 = options.margin.left + that.horizontalAxis.scale(this.p2.model.domainPosition);
        x += (x < x1) ? 10 : -10;
        var y = options.height - options.margin.bottom - options.axisHeight - that.verticalAxis.scale(lineModel.rangePosition);

        if (!this.line) {
          this.grabber = that.paper.line(x,y,x1,y);
          this.line = that.paper.line(x,y,x1,y);
          var start = function(x,y,ev) {
            console.log("starting");
            this.ox = this.attr("cx");
            this.oy = this.attr("cy");
            this.op1d = thatLI.p1.model.domainPosition;
            this.op2d = thatLI.p2.model.domainPosition;
            this.hasMoved = false;
            thatLI.line.animate({"stroke-width": 10, opacity: .25}, 200, ">");
            cancelEvent(ev);
          };
          var move = function(dx, dy) {
            var dp = that.horizontalAxis.scale.invert(dx);
            if (this.op1d + dp > options.domain[0] && this.op1d + dp < options.domain[1] &&
              this.op2d + dp > options.domain[0] && this.op2d + dp < options.domain[1]) {
              thatLI.p1.moveTo(this.op1d + dp, 0);
              thatLI.p2.moveTo(this.op2d + dp, 0);
              thatLI.grabber.x = thatLI.line.x = that.horizontalAxis.scale(thatLI.p1.model.domainPosition) + options.margin.left;
              thatLI.grabber.x1 = thatLI.line.x1 = that.horizontalAxis.scale(thatLI.p2.model.domainPosition) + options.margin.left;
              updateLineModel();
              thatLI.line.redraw();
              thatLI.grabber.redraw();

              this.hasMoved = true;
            }
          };
          var up = function(ev) {
            thatLI.line.animate({"stroke-width": 6, opacity: 1}, 200, ">");
            if (!this.hasMoved) {
              thatLI.selected = thatLI.p1.selected = thatLI.p2.selected = !thatLI.selected;
              thatLI.draw();
              options.selectionChanged();
            }
            cancelEvent(ev);
          };

          this.line.drag(move, start, up);
          this.line.click(cancelEvent);
          this.grabber.drag(move, start, up);
          this.grabber.click(cancelEvent);
        }
        this.grabber.x = this.line.x = x;
        this.grabber.y = this.line.y = y;
        this.grabber.x1 = this.line.x1 = x1;
        this.grabber.y1 = this.line.y1 = y;
        this.grabber.attr({"stroke-width": "30", "stroke": "#9aa", opacity: 0});
        this.grabber.redraw();
        this.line.attr({"stroke-width": "6", "stroke": thatLI.selected ? SELECTED_COLOR : BASE_COLOR});
        this.line.redraw();
      };

      this.draw = function() {
        this.drawLine();
        this.p1.draw();
        this.p2.draw();
      };

      return this;
    };

    this.MovableRay = function(lineModel, lineOptions) {
      lineOptions = _.defaults(lineOptions || {}, {direction: "positive"});
      var thatLI = this;

      this.selected = false;
      this.model = lineModel;

      function updateLineModel() {
        lineModel.domainPosition = thatLI.p1.model.domainPosition;
        lineModel.rangePosition = thatLI.p1.model.rangePosition;
        options.applyCallback();
      }

      this.p1 = new factory.MovablePoint({domainPosition: lineModel.domainPosition, rangePosition: lineModel.rangePosition}, {
        fillColor: lineOptions.pointType === "empty" ? EMPTY_COLOR : BASE_COLOR,
        selectedFillColor: lineOptions.pointType === "empty" ? EMPTY_COLOR : SELECTED_COLOR,
        onMove: function(newPos) {
          thatLI.drawLine();
          updateLineModel();
        },
        onSelectionChanged: function(sel) {
          thatLI.selected = sel;
          thatLI.draw();
        }
      });

      this.detach = function() {
        this.line = undefined;
        this.p1.detach();
      };

      this.remove = function() {
        if (this.line) {
          this.line.remove();
        }
        this.p1.remove();
        this.detach();
      };

      this.drawLine = function() {
        var x = options.margin.left + that.horizontalAxis.scale(this.p1.model.domainPosition);
        var x1 = options.margin.left + that.horizontalAxis.scale(options.domain[lineOptions.direction === "positive" ? 1 : 0]);
        var y = options.height - options.margin.bottom - options.axisHeight - that.verticalAxis.scale(lineModel.rangePosition);

        var dx = lineOptions.direction === "positive" ? 10 : -10;

        if (!this.line) {
          this.line = that.paper.line(x, y, x1 + dx, y);
          var adx = dx + (lineOptions.direction === "positive" ? 8 : 0);
          var arrowFn = lineOptions.direction === "positive" ? that.paper.rightArrow : that.paper.leftArrow;
          this.arrow = arrowFn(x1 + adx - 8, y, 8, 8).attr({stroke: BASE_COLOR, fill: BASE_COLOR});

          this.line.click(function() {
            thatLI.selected = thatLI.p1.selected = !thatLI.selected;
            thatLI.draw();
            options.selectionChanged();
          });

        }
        this.line.x = x;
        this.line.y = y;
        this.line.x1 = x1 + dx;
        this.line.y1 = y;
        this.line.redraw();
        var color = this.selected ? SELECTED_COLOR : BASE_COLOR;
        this.line.attr({"stroke-width": "6", "stroke": color});
        this.arrow.attr({stroke: color, fill: color});

      };
      this.draw = function(paper) {
        this.drawLine();
        this.p1.draw(paper);

      };
      return this;
    };

    this.HorizontalAxis = function(position, axisOptions) {
      var thatHA = this;
      axisOptions = _.defaults(axisOptions || {}, {
        tickFrequency: 20,
        visible: true
      });

      this.reCalculate = function() {
        this.scale = ScaleUtils.linear().domain(options.domain).range([0, options.horizontalAxisLength]);
        this.ticks = this.scale.ticks(axisOptions.tickFrequency);
      };

      this.reCalculate();

      this.draw = function(paper) {
        var y;
        switch (position) {
          case "top" :
            y = options.margin.top + options.axisHeight;
            break;
          case "middle" :
            y = options.margin.top + options.verticalAxisLength / 2;
            break;
          default:
            y = options.height - options.margin.bottom - options.axisHeight;
            break;
        }
        paper.leftArrow(options.margin.left - 18, y, 8, 5).attr({
          fill: "#000"
        });
        paper.rightArrow(options.margin.left + options.horizontalAxisLength + 10, y, 8, 5).attr({
          fill: "#000"
        });
        paper.line(options.margin.left - 10, y, options.margin.left + options.horizontalAxisLength + 20, y)

        var scale = thatHA.scale;
        var tickSize = 10;

        _(thatHA.ticks).each(function(tick, idx) {
          var x = scale(tick);
          paper.line(options.margin.left + x, y - tickSize / 2, options.margin.left + x, y + tickSize / 2);
          paper.text(options.margin.left + x, options.height - options.margin.bottom, tick);
        });

      };

      return this;
    };

    this.VerticalAxis = function(position, axisOptions) {
      var thatVA = this;
      axisOptions = _.defaults(axisOptions || {}, {
        tickFrequency: 10,
        visible: true
      });
      this.reCalculate = function() {
        this.scale = ScaleUtils.linear().domain(options.range).range([0, options.verticalAxisLength]);
      };
      this.reCalculate();

      this.detach = function() {
      };

      this.draw = function(paper) {
        if (!axisOptions.visible) return;
        var x;
        switch (position) {
          case "left" :
            x = 30;
            break;
          case "middle" :
            x = options.margin.left + options.horizontalAxisLength / 2;
            break;
          default:
            x = options.margin.left + options.horizontalAxisLength;
            break;
        }
        paper.line(x, options.margin.top, x, options.margin.top + options.verticalAxisLength);

        var scale = thatVA.scale;
        var ticks = scale.ticks(axisOptions.tickFrequency);
        var tickSize = 10;

        _.each(ticks, function(tick, idx) {
          var y = scale(tick);
          paper.line(x - 5, options.margin.top + y, x + 5, options.margin.top + y);
          paper.text(x - 15, options.height - options.margin.bottom - 20 - y, tick);
        });

      };

      return this;
    };


    return this;
  };

  return GraphElementFactory;
}];
