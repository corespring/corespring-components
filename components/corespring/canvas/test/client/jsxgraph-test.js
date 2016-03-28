describe('corespring:canvas:jsxgraph', function() {

  var scope, element, $compile, $rootScope, canvas;

  var jsm = jasmine;

  beforeEach(angular.mock.module('test-app'));
  
  function Point(name,x,y){
    this.handlers = {};
    this.name = name;
    this.X = jsm.createSpy('X').and.returnValue(x);
    this.Y = jsm.createSpy('Y').and.returnValue(y);
    this.canvasIndex = 1;
    this.on = jsm.createSpy('on').and.callFake(function(key, handler){
      this.handlers[key] = this.handlers[key] || [];
      this.handlers[key].push(handler);
    });
  } 

  function Canvas(){

    this.handlers = {};

    this.points = [];
    this.shapes = [];

    this.pointCollision = jsm.createSpy('pointCollision').and.callFake(function(cords){
      return null;
    });

    this.addPoint = jsm.createSpy('addPoint').and.callFake(function(coords, name, opts){
      name = name || new Date().getTime().toString();
      console.log('cords: ', coords);
      var point = new Point(name, coords.x, coords.y);
      this.points.push(point);
      return point;
    });

    this.getPointCoords = jsm.createSpy('getPointCoords').and.returnValue({
      x: 0,
      y: 0 
    });

    this.on = jsm.createSpy('on').and.callFake(function(key, handler){
      this.handlers[key]= this.handlers[key] || [];
      this.handlers[key].push(handler);
    }.bind(this));
  } 
  

  beforeEach(function() {
    module(function($provide) {

      canvas = new Canvas();

      $provide.value('Canvas', function(){ return canvas; });
    });
  });

  beforeEach(inject(function($rootScope, $compile, CanvasRenderScopeExtension) {
    scope = $rootScope.$new();

    scope.interactionCallback = jsm.createSpy('interactionCallback');
    scope.hoveredLine = {};
    scope.graphCallback = jsm.createSpy('graphCallback');

    var html = [
      '<div jsx-graph="" ',
      '  interaction-callback="interactionCallback"',
      '  graph-callback="graphCallback"',
      '  hovered-line="hoveredLine"',
      '>',
      '</div>'

    ].join('\n');
    element = angular.element(html);
    $compile(element)(scope);
    scope.$digest();
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });

  describe('interactionCallback', function(){

    it('returns initial and user added points', function(){

      //initial points
      scope.graphCallback({
        points: [{x: '0', y: '0'}]
      });

      //user added point
      var p = new Point('user-point', 1, 1);
      canvas.getMouseCoords = jsm.createSpy('getMouseCoords').and.returnValue({x:1, y:1});
      canvas.addPoint = jsm.createSpy('addpoint').and.returnValue(p);
      canvas.handlers.up[0]({event: true});

      expect(scope.interactionCallback).toHaveBeenCalledWith({
        points: jsm.any(Object),
        point: {index: 1, name: 'user-point', x: 1, y: 1}
      });

      var c = scope.interactionCallback.calls.mostRecent();
      var vals = _.values(c.args[0].points);
      expect(vals[0]).toEqual({index: 1, name: jasmine.any(String), x: 0, y: 0});
    });
  });
});