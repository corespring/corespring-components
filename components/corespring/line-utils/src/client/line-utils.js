exports.framework = 'angular';
exports.factory = [

    function() {
        function LineUtils() {
            /**
             * Returns points to plot from given linear equation
             * Ex for input y=-5x+2
             * returns [[0,2],[1,-3]]
             */
            this.pointsFromEquation = function(equation) {

                if (!equation || !_.isString(equation)) {
                    return undefined;
                }

                equation = equation.replace(/\s/gi,"");

                var patt = /y=(([\+\-])?((?:\d*[\.\/])?\d+)?(x)?)?(([\+\-])?((?:\d*[\.\/])?\d+))?(x)?/g;

                var captures = patt.exec(equation);

                if (!captures || captures.length === 0 || (!captures[3] && !captures[4] && !captures[7])) {
                    return undefined;
                }

                var m = 0;
                var b = 0;

                function getSign(index) {
                    return captures[index] === "-" ? -1 : 1;
                }

                function getSlope(index) {
                    var fraction = captures[index] ? captures[index] : "1";
                    return getDecimalRepresentation(fraction);
                }

                function getDecimalRepresentation(fraction){
                    if (!fraction || !_.isString(fraction)){
                        return fraction;
                    }

                    var lineIndex = fraction.indexOf('\/');
                    if (lineIndex === -1){
                        return fraction;
                    }

                    var numer = fraction.substring(0,lineIndex);
                    var denom = fraction.substring(lineIndex + 1,fraction.length);
                    var flt = parseInt(numer,10)/parseInt(denom,10);

                    return flt;
                }

                function getConstant(index) {
                    return getDecimalRepresentation(captures[index] ? captures[index] : 0);
                }

                if (captures[4] === "x") {
                    m = getSign(2) * getSlope(3);
                    b = getSign(6) * getConstant(7);
                } else if (captures[8] === "x") {
                    m = getSign(6) * getSlope(7);
                    b = getSign(2) * getConstant(3);
                } else {
                    b = getSign(2) * getConstant(3);
                }

                return [
                    [0, b],
                    [1, m + b]
                ];
            };

            this.expressionize = function(eq, varname) {
                eq = trimSpaces(eq);
                eq = replaceVarWithX(eq, varname);
                eq = makeMultiplicationExplicit(eq);
                return eq;
            };

            function trimSpaces(s) {
                return s.replace(/\s+/g, "");
            }

            function replaceVarWithX(expression, variable) {
                return expression.replace(new RegExp(variable, "g"), "(x)");
            }

            function makeMultiplicationExplicit(eq) {
                return eq
                  .replace(/([0-9)])\(/g, "$1*(")
                  .replace(/\)([0-9(])/g, ")*$1");
            }

        }


        return LineUtils;
    }
];
