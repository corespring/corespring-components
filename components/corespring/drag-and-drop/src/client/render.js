var main = [ '$compile', function($compile){

  var link = function(scope, element, attrs){

    scope.$on('dropped', function(event,object){
      scope.model.choices = _.filter(scope.model.choices, function(o){ return o != object; } );
    });

    scope.containerBridge = {
      setDataAndSession : function(dataAndSession){
        scope.model = _.clone( dataAndSession.data.model);
        $answerArea = element.find("#answer-area").html("<div> " + scope.model.answerArea + "</div>");
        $compile($answerArea)(scope.$new());
      },
      getSession: function(){
        console.log("returning answer for: Drag and drop");
        return { answers : {landingPlace: "1", choice: "1" }};
      }
    };
    scope.$emit('registerComponent', attrs.id, scope.containerBridge);
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
    scope: {},
    restrict : 'E',
    template : tmpl
  };
}];

var landingPlace = [function(){
  var def = {
    scope: {},
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

exports.framework = 'angular';
exports.directives = [
  /** The default definition - no name is needed. 1 main def is mandatory */
  { directive : main },
  /** A 2nd directive */
  { name: 'landingplace', directive: landingPlace }
];

