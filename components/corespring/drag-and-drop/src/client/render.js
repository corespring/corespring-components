var main = [ '$compile', function($compile){

  var link = function(scope, element, attrs){

    scope.landingPlaceChoices = {};

    scope.containerBridge = {
      setDataAndSession : function(dataAndSession){
        scope.model = _.clone( dataAndSession.data.model);
        $answerArea = element.find("#answer-area").html("<div> " + scope.model.answerArea + "</div>");
        $compile($answerArea)(scope.$new());
      },
      getSession: function(){
        var answer = _.cloneDeep(scope.landingPlaceChoices);
        _.each(answer, function(v,k) {
          answer[k] = v.id;
        });
        return {
          answers : answer
        };
      }
    };
    scope.$emit('registerComponent', attrs.id, scope.containerBridge);
  };

  var tmpl = [
  '        <div class="view-drag-and-drop">',
  '        <h5>{{model.prompt}}</h5>',
  '        <div id="answer-area">',
  '        </div>',
  '        <div class="choices" >',
  '          <div',
  '            ng-repeat="o in model.choices"',
  '            class="btn btn-primary choice"',
  '            data-drag="true"',
  '            data-jqyoui-options="{revert: \'invalid\'}"',
  '            ng-model="model.choices[$index]"',
  '            jqyoui-draggable',
  '            data-id="{{o.id}}"',
  '           >{{o.content}}</div>',
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
    scope: true,  //TODO: should use isolate scope, but = doesn't seem to inherit from DanD's scope
    restrict: 'E',
    transclude: true,
    replace: false,
    link: function(scope, element, attrs) {
      scope.class = attrs['class'];
      scope.id = attrs['id'];
      scope.onDrop = function() {
        console.log("onDrop", scope.model.choices);
        scope.model.choices = _.filter(scope.model.choices, function(c) {
          return c;
        });
      };
      scope.draggableOptions = {
        revert: function(isValid) {
          if (isValid) return false;
          scope.$apply(function() {
            scope.model.choices.push(scope.landingPlaceChoices[scope.id]);
            delete scope.landingPlaceChoices[scope.id];
          });

          return true;
        }
      }
    },
    template: [
      '    <div',
      '      data-drop="true"',
      '      ng-model="landingPlaceChoices[id]"',
      '      data-jqyoui-options',
      '      jqyoui-droppable="{onDrop: \'onDrop\'}"',
      '      class="landing-place {{class}}"',
      '      style="padding: 5px">',
      '        <div ng-show="landingPlaceChoices[id]" jqyoui-draggable data-jqyoui-options="draggableOptions" ng-model="landingPlaceChoices[id]" data-drag="true" class="btn btn-primary">{{landingPlaceChoices[id].content}}</div>',
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

