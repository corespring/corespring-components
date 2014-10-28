exports.framework = "angular";
exports.service = [ '$log', function($log){

  var Scale = {};

  function scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [start, stop] : [stop, start];
  }

  function scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : scaleExtent(scale.range());
  }

  function range(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [],
      k = range_integerScale(Math.abs(step)),
      i = -1,
      j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k);
    else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  }

  function range_integerScale(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  }

  function interpolateNumber(a, b) {
    a = +a, b = +b;
    return function(t) {
      return a * (1 - t) + b * t;
    };
  }

  function scale_bilinear(domain, range, uninterpolate, interpolate) {
    var u = uninterpolate(domain[0], domain[1]),
      i = interpolate(range[0], range[1]);
    return function(x) {
      return i(u(x));
    };
  }

  function uninterpolateNumber(a, b) {
    b = (b -= a = +a) || 1 / b;
    return function(x) {
      return (x - a) / b;
    };
  }

  function uninterpolateClamp(a, b) {
    b = (b -= a = +a) || 1 / b;
    return function(x) {
      return Math.max(0, Math.min(1, (x - a) / b));
    };
  }

  function scale_linearTickRange(domain, m) {
    if (m == null) m = 10;

    var extent = scaleExtent(domain),
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step;

    // Filter ticks to get closer to the desired count.
    if (err <= .15) step *= 10;
    else if (err <= .35) step *= 5;
    else if (err <= .75) step *= 2;

    // Round start and stop values to step interval.
    extent[0] = Math.ceil(extent[0] / step) * step;
    extent[1] = Math.floor(extent[1] / step) * step + step * .5; // inclusive
    extent[2] = step;
    return extent;
  }

  function scale_linearTicks(domain, m) {
    return range.apply(this, scale_linearTickRange(domain, m));
  }

  function scale_linearTickFormat(domain, m, format) {
    var range = scale_linearTickRange(domain, m);
    if (format) {
      var match = format_re.exec(format);
      match.shift();
      if (match[8] === "s") {
        var prefix = d3.formatPrefix(Math.max(Math.abs(range[0]), Math.abs(range[1])));
        if (!match[7]) match[7] = "." + scale_linearPrecision(prefix.scale(range[2]));
        match[8] = "f";
        format = d3.format(match.join(""));
        return function(d) {
          return format(prefix.scale(d)) + prefix.symbol;
        };
      }
      if (!match[7]) match[7] = "." + scale_linearFormatPrecision(match[8], range);
      format = match.join("");
    } else {
      format = ",." + scale_linearPrecision(range[2]) + "f";
    }
    return d3.format(format);
  }

  var scale_linearFormatSignificant = {s: 1, g: 1, p: 1, r: 1, e: 1};

  function scale_linearPrecision(value) {
    return -Math.floor(Math.log(value) / Math.LN10 + .01);
  }

  function scale_linearFormatPrecision(type, range) {
    var p = scale_linearPrecision(range[2]);
    return type in scale_linearFormatSignificant
      ? Math.abs(p - scale_linearPrecision(Math.max(Math.abs(range[0]), Math.abs(range[1])))) + +(type !== "e")
      : p - (type === "%") * 2;
  }

  function scale_linear(domain, range, interpolate, clamp) {
    var output,
      input;

    function rescale() {
      var linear = scale_bilinear;
      var uninterpolate = clamp ? uninterpolateClamp : uninterpolateNumber;
      output = linear(domain, range, uninterpolate, interpolate);
      input = linear(range, domain, uninterpolate, interpolateNumber);
      return scale;
    }

    function scale(x) {
      return output(x);
    }

    // Note: requires range is coercible to number!
    scale.invert = function(y) {
      return input(y);
    };

    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = [];
      for (var i = 0; i < x.length; i++) {
        domain.push(Number(x[i]));
      }
      return rescale();
    };

    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };

    scale.rangeRound = function(x) {
      return scale.range(x).interpolate(interpolateRound);
    };

    scale.clamp = function(x) {
      if (!arguments.length) return clamp;
      clamp = x;
      return rescale();
    };

    scale.interpolate = function(x) {
      if (!arguments.length) return interpolate;
      interpolate = x;
      return rescale();
    };

    scale.ticks = function(m) {
      return scale_linearTicks(domain, m);
    };

    scale.tickFormat = function(m, format) {
      return scale_linearTickFormat(domain, m, format);
    };

    scale.copy = function() {
      return scale_linear(domain, range, interpolate, clamp);
    };

    return rescale();
  }

  Scale.linear = function() {
    return scale_linear([0, 1], [0, 1], interpolateNumber, false);
  };

  return Scale;

}];