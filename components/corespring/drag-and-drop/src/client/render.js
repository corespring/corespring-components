var main = [ '$compile', function($compile){

  console.log("define component");

  var link = function(scope, element, attrs){

    scope.$on('dropped', function(event,object){
      scope.model.choices = _.filter(scope.model.choices, function(o){ return o != object; } );
    });

    scope.containerBridge = {
      setModel : function(model){
        scope.model = _.clone(model);
        console.log("Config Model is ", scope.model);
        $answerArea = element.find("#answer-area").html("<div> " + scope.model.answerArea + "</div>");
        $compile($answerArea)(scope.$new());
      },
      getAnswer: function(){
        console.log("returning answer for: Drag and drop");
        return { landingPlace: "1", choice: "1" };
      }
    };

    scope.registerComponent(attrs.id, scope.containerBridge);
  };

  var tmpl = [
  '        <div>',
  '        <h5>{{model.prompt}}</h5>',
  '        <div id="answer-area">',
  '        </div>',
  '        <div id="options">',
  '          <div',
  '            ng-repeat="o in model.choices"',
  '            class="btn btn-primary"',
  '            data-drag="true"',
  '            data-jqyoui-options="{revert: \'invalid\'}"',
  '            ng-model="o"',
  '            jqyoui-draggable="{animate:true}"',
  '            data-id="{{o.id}}"',
  '            drag-drop="true">{{o.content}}</div>',
  '          </div>',
  '      </div>'
    ].join("");

  return {
    link: link,
    scope: 'isolate',
    restrict : 'E',
    template : tmpl
  };
}];

var landingPlace = [function(){
  var def = {
    scope: 'isolate',
    restrict: 'E',
    transclude: true,
    replace: false,
    link: function(scope, element, attrs) {
      scope.$watch('dropped', function(newValue, oldValue) {
        if(newValue){
          scope.$emit('dropped', newValue);
        }
      });
    },
    template: [
      '    <div',
      '      data-drop="true"',
      '      ng-model="dropped"',
      '      data-jqyoui-options',
      '      jqyoui-droppable',
      '      style="padding: 5px; width: 200px; height: 50px; background-color: #e4d5fc;">',
      '        <div ng-show="dropped" class="btn btn-primary">{{dropped.content}}</div>',
      '    </div>'].join("")
    };
  return def;
}];

/**
 * componentDefinition - this is mandatory.
 * within this you define your component.
 */
var componentDefinition = {
  framework: 'angular',
  directives : [
    /** The default definition - no name is needed. 1 main def is mandatory */
    { directive : main },
    /** A 2nd directive */
    { name: 'landingplace', directive: landingPlace }
  ]
};

