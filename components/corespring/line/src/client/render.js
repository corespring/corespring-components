/* jshint evil: true */
var main = ['$compile', '$modal', '$rootScope', "LineUtils",
    function($compile, $modal, $rootScope, LineUtils) {
        var lineUtils = new LineUtils();
        return {
            template: [
                "<div class='line-interaction-view'>",
                "<div class='graph-interaction'>",
                "   <div id='additional-text' class='row-fluid additional-text' ng-show='additionalText'>",
                "       <p>{{additionalText}}</p>",
                "   </div>",
                "   <div class='graph-controls' ng-show='showInputs'>",
                "       <div id='inputs' class='col-sm-5' style='margin-right: 17px;'>",
                "           <div class='point-display' style='padding-bottom: 10px;'>",
                "              <p>Point A:</p>",
                "              <p>x: </p>",
                "              <input type='text' ng-style='inputStyle', ng-model='points.A.x' ng-disabled='locked'>",
                "              <p>y: </p>",
                "              <input type='text' ng-style='inputStyle' ng-model='points.A.y'  ng-disabled='locked'>",
                "          </div>",
                "          <hr class='point-display-break'>",
                "          <div class='point-display' style='padding-top: 10px;'>",
                "             <p>Point B:</p>",
                "             <p>x: </p>",
                "             <input type='text' ng-style='inputStyle' ng-model='points.B.x' ng-disabled='locked'>",
                "             <p>y: </p>",
                "             <input type='text' ng-style='inputStyle' ng-model='points.B.y' ng-disabled='locked'>",
                "          </div>",
                "      </div>",
                "      <div class='scale-display'>",
                "        <span>scale={{scale}}</span>",
                "         <div class='action undo'>",
                "           <a title='Undo' ng-click='undo()'>",
                "             <i class='fa fa-undo'/>",
                "           </a>",
                "         </div>",
                "         <div class='action start-over'>",
                "           <a title='Start Over' ng-click='startOver()'>",
                "             <i class='fa fa-refresh'/>",
                "           </a>",
                "         </div>",
                "      </div>",
                "      <div class='clearfix'> </div>",
                "      <div class='clearfix'> </div>",
                "   </div>",
                "   <div id='graph-container' class='row-fluid graph-container'></div>",
                "   <div ng-show='correctResponse' style='padding-top: 20px'><a ng-click='seeSolution()' class='pull-right'>See Solution</a></div>",
                "</div>",
                "<div ng-show='feedback' class='feedback' ng-class='correctClass' ng-bind-html-unsafe='feedback'></div>",
                "</div>"
            ].join(""),
            restrict: 'AE',
            scope: true,
            controller: function($scope) {
                $scope.submissions = 0;
                $scope.points = {};
                this.setInitialParams = function(initialParams) {
                    $scope.initialParams = initialParams;
                };

                this.getInitialParams = function() {
                    return $scope.initialParams;
                };

                $scope.$watch('graphCallback', function(n) {
                    if ($scope.graphCallback) {
                        if ($scope.initialParams) {
                            $scope.graphCallback($scope.initialParams);
                        }
                        if ($scope.locked) {
                            $scope.graphCallback({
                                lockGraph: true
                            });
                        }
                        if ($scope.points) {
                            $scope.renewResponse($scope.points);
                        }
                    }
                });

                $scope.interactionCallback = function(params) {

                    function setPoint(name) {
                        if (params.points[name]) {
                            var px = params.points[name].x;
                            var py = params.points[name].y;
                            if (px > $scope.domain) {
                                px = $scope.domain;
                            } else if (px < (0 - $scope.domain)) {
                                px = 0 - $scope.domain;
                            }
                            if (py > $scope.range) {
                                py = $scope.range;
                            } else if (py < (0 - $scope.range)) {
                                py = 0 - $scope.range;
                            }
                            if ($scope.sigfigs > -1) {
                                var multiplier = Math.pow(10, $scope.sigfigs);
                                px = Math.round(px * multiplier) / multiplier;
                                py = Math.round(py * multiplier) / multiplier;
                            }
                            $scope.points[name] = {
                                x: px,
                                y: py,
                                isSet: true
                            };
                        }
                    }

                    if (params.points) {

                        setPoint('A');
                        setPoint('B');

                        //if both points are created, draw line and set response
                        if (params.points.A && params.points.B) {
                            $scope.graphCoords = [params.points.A.x + "," + params.points.A.y, params.points.B.x + "," + params.points.B.y];
                            var slope = (params.points.A.y - params.points.B.y) / (params.points.A.x - params.points.B.x);
                            var yintercept = params.points.A.y - (params.points.A.x * slope);
                            $scope.equation = "y=" + slope + "x+" + yintercept;
                            $scope.graphCallback({
                                graphStyle: {},
                                drawShape: {
                                    line: ["A", "B"]
                                }
                            });
                        } else {
                            $scope.graphCoords = null;
                        }

                        var phase = $scope.$root.$$phase;
                        if (phase !== '$apply' && phase !== '$digest') {
                            $scope.$apply();
                        }
                    }
                };

                $scope.lockGraph = function() {
                    $scope.locked = true;
                    $scope.graphCallback({
                        lockGraph: true
                    });
                };

                $scope.renewResponse = function(response) {
                    if (response && response.A && response.B) {
                        var A = response.A;
                        var B = response.B;
                        $scope.points = {
                            A: {
                                x: A.x,
                                y: A.y
                            },
                            B: {
                                x: B.x,
                                y: B.y
                            }
                        };
                    }
                    return response;
                };

                $scope.$watch('points', function(points) {
                    function checkCoords(coords) {
                        return coords && !isNaN(coords.x) && !isNaN(coords.y);
                    }
                    var graphPoints = {};
                    _.each(points, function(coords, ptName) {
                        if (checkCoords(coords)) {
                            graphPoints[ptName] = coords;
                        }
                    });
                    if ($scope.graphCallback) {
                        $scope.graphCallback({
                            points: graphPoints
                        });
                    }
                }, true);

                $scope.undo = function() {
                    if (!$scope.locked && $scope.points.B && $scope.points.B.isSet) {
                        $scope.points.B = {};
                    } else if (!$scope.locked && $scope.points.A && $scope.points.A.isSet) {
                        $scope.points.A = {};
                    }
                };

                $scope.startOver = function() {
                    if (!$scope.locked) {
                        $scope.points.B = {};
                        $scope.points.A = {};
                    }
                };
            },

            link: function(scope, element, attrs) {

                scope.inputStyle = {
                    width: "40px"
                };

                var createGraphAttributes = function(config) {
                    return {
                        "jsx-graph": "",
                        "graph-callback": "graphCallback",
                        "interaction-callback": "interactionCallback",
                        maxPoints: 2,
                        domain: parseInt(config.domain ? config.domain : 10, 10),
                        range: parseInt(config.range ? config.range : 10, 10),
                        scale: parseFloat(config.scale ? config.scale : 1),
                        domainLabel: config.domainLabel,
                        rangeLabel: config.rangeLabel,
                        tickLabelFrequency: config.tickLabelFrequency,
                        showLabels: config.showLabels ? config.showLabels : "true",
                        showCoordinates: !_.isUndefined(config.showCoordinates) ? config.showCoordinates : "true",
                        pointLabels: "letters"
                    };
                };

                if (attrs.solutionView) {
                    var containerWidth, containerHeight;
                    var graphContainer = element.find('.graph-container');
                    containerHeight = containerWidth = graphContainer.width();

                    var graphAttrs = createGraphAttributes(scope.config);
                    scope.additionalText = "The equation is " + scope.answer.equation;
                    graphContainer.attr(graphAttrs);
                    graphContainer.css({
                        width: containerWidth,
                        height: containerHeight
                    });
                    scope.locked = false;

                    $compile(graphContainer)(scope);
                    scope.initialParams = {
                        drawShape: {
                            curve: function(x) {
                                return eval(scope.answer.expression);
                            }
                        },
                        submission: {
                            lockGraph: false
                        }
                    };

                }

                scope.seeSolution = function() {
                    scope.solutionScope = $rootScope.$new();
                    scope.solutionScope.answer = scope.correctResponse;
                    scope.solutionScope.config = scope.config;

                    $modal.open({
                        controller: function($scope, $modalInstance) {
                            $scope.ok = function() {
                                $modalInstance.dismiss('cancel');
                            };
                        },
                        template: [
                            '   <div class="modal-header">',
                            '     <h3>Solution</h3>',
                            '   </div>',
                            '   <div class="modal-body">',
                            '     <corespring-line solution-view="true" id="solution"></corespring-line>',
                            '   </div>',
                            '   <div class="modal-footer">',
                            '     <button class="btn btn-primary" ng-click="ok()">OK</button>',
                            '   </div>'
                        ].join(""),
                        backdrop: true,
                        scope: scope.solutionScope
                    });

                };

                scope.unlockGraph = function() {
                    scope.locked = false;
                    scope.graphCallback({
                        unlockGraph: true
                    });
                    scope.graphCallback({
                        graphStyle: {
                            borderWidth: "0px"
                        },
                        pointsStyle: "blue"
                    });
                };


                scope.containerBridge = {

                    setDataAndSession: function(dataAndSession) {
                        console.log("Setting Session for Point", dataAndSession);
                        var config = dataAndSession.data.model.config;
                        scope.config = config;

                        scope.additionalText = config.additionalText;
                        scope.scale = config.scale;
                        scope.domain = config.domain;
                        scope.range = config.range;
                        scope.sigfigs = parseInt(config.sigfigs ? config.sigfigs : -1, 10);
                        scope.locked = config.hasOwnProperty('locked') ? true : false;
                        scope.domainLabel = config.domainLabel;
                        scope.rangeLabel = config.rangeLabel;
                        scope.tickLabelFrequency = config.tickLabelFrequency;
                        scope.pointLabels = config.pointLabels;
                        scope.maxPoints = config.maxPoints;
                        scope.showInputs = !!config.showInputs && !config.exhibitOnly;

                        var containerWidth, containerHeight;
                        var graphContainer = element.find('.graph-container');
                        if (config.graphWidth && config.graphHeight) {
                            containerWidth = parseInt(config.graphWidth, 10);
                            containerHeight = parseInt(config.graphHeight, 10);
                        } else {
                            containerHeight = containerWidth = graphContainer.width();
                        }

                        var graphAttrs = createGraphAttributes(config);

                        graphContainer.attr(graphAttrs);
                        graphContainer.css({
                            width: containerWidth,
                            height: containerHeight
                        });
                        $compile(graphContainer)(scope);

                        if (dataAndSession.session) {
                            scope.points = dataAndSession.session.answers;
                        }

                        var initialValues = lineUtils.pointsFromEquation(config.initialCurve);

                        if (_.isArray(initialValues)) {
                            var pointA = initialValues[0];
                            var pointB = initialValues[1];
                            scope.points = {
                                A: {
                                    x: pointA[0],
                                    y: pointA[1],
                                    isSet: true
                                },
                                B: {
                                    x: pointB[0],
                                    y: pointB[1],
                                    isSet: true
                                }
                            };
                        }

                        if (config.exhibitOnly) {
                            setTimeout(function() {
                                scope.lockGraph();
                            }, 100);
                        }

                    },

                    getSession: function() {
                        return {
                            answers: scope.points
                        };
                    },

                    setResponse: function(response) {
                        console.log("Setting response for line interaction", response);
                        scope.feedback = response && response.feedback;
                        scope.correctClass = response.correctness;
                        if (response && response.correctness === "correct") {
                            scope.graphCallback({
                                graphStyle: {
                                    borderColor: "green",
                                    borderWidth: "2px"
                                },
                                shapesStyle: "green"
                            });
                            scope.inputStyle = _.extend(scope.inputStyle, {
                                border: 'thin solid green'
                            });
                        } else if (response.correctness === "incorrect") {
                            scope.graphCallback({
                                graphStyle: {
                                    borderColor: "red",
                                    borderWidth: "2px"
                                },
                                shapesStyle: "red"
                            });
                            scope.inputStyle = _.extend(scope.inputStyle, {
                                border: 'thin solid red'
                            });
                            scope.correctResponse = response.correctResponse;
                        }

                        scope.lockGraph();
                    },

                    setMode: function(newMode) {},

                    reset: function() {
                        scope.feedback = undefined;
                        scope.unlockGraph();

                        scope.inputStyle = {
                            width: "40px"
                        };

                        scope.correctResponse = undefined;
                        scope.points.B = scope.points.A = {};

                        var initialValues = scope.pointsFromCurve(scope.config.initialCurve);
                        if (_.isArray(initialValues)) {
                            var pointA = initialValues[0];
                            var pointB = initialValues[1];
                            scope.points = {
                                A: {
                                    x: pointA[0],
                                    y: pointA[1],
                                    isSet: true
                                },
                                B: {
                                    x: pointB[0],
                                    y: pointB[1],
                                    isSet: true
                                }
                            };
                        }

                    },

                    isAnswerEmpty: function() {
                        return _.isUndefined(scope.points) || _.isEmpty(scope.points) || scope.points.length === 0;
                    },

                    answerChangedHandler: function(callback) {
                        scope.$watch("points", function(newValue) {
                            if (newValue) {
                                callback();
                            }
                        }, true);

                    },

                    editable: function(e) {
                        scope.editable = e;
                    }

                };

                scope.$emit('registerComponent', attrs.id, scope.containerBridge);

            }
        };
    }
];

exports.framework = 'angular';
exports.directives = [{
    directive: main
}];
