exports.framework = 'angular';
exports.directives = [{
  directive: ['$log', configureWebdriverTestComponent]
}];

function configureWebdriverTestComponent($log) {

  return {
    link: link,
    replace: true,
    restrict: "E",
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    scope.containerBridge = {
      setModel: setModel,
      getModel: getModel
    };

    //--------------------------

    function setModel(fullModel) {
      //The difference between fullModel and model is that
      //model should only contain the data that is necessary to
      //render the interaction in the player's "gather" mode,
      //iow. before the user has answered the question.
      //This to avoid cheating
      //fullModel contains the correctResponse, the feedback
      //configuration, the scoring information
      scope.fullModel = fullModel;
      scope.model = fullModel.model;
    }

    function getModel() {
      var model = _.cloneDeep(scope.fullModel);
      return model;
    }
  }

  function template() {
    return [
          '<div class="config-corespring-webdriver-test-component">',
          '  <div navigator-panel="Design">',
          designTemplate(),
          '  </div>',
          '  <div navigator-panel="Scoring">',
          scoringTemplate(),
          '  </div>',
          '</div>'
        ].join('');

    function scoringTemplate() {
      return [
            '<div class="form-horizontal" role="form">',
            '  <div class="container-fluid">',
            '    <div class="row">',
            '      <div class="col-xs-12">',
            '      </div>',
            '    </div>',
            '  </div>',
            '</div>'
          ].join('');
    }

    function designTemplate() {
      return [
            '<div class="form-horizontal" role="form">',
            '  <div class="container-fluid">',
            '    <div class="row">',
            '      <div class="col-xs-9">',
            header(),
            mainEditorPanel(),
            feedback(),
            '      </div>',
            '      <div class="col-xs-3">',
            optionsPanel(),
            '      </div>',
            '    </div>',
            '  </div>',
            '</div>'
          ].join('');
    }

    function header() {
      return [
            '<div class="row">',
            '  <div class="col-xs-12">',
            '    <p class="intro">',
            '      This component is a helper for testing webdriver',
            '    </p>',
            '  </div>',
            '</div>'
          ].join('');
    }

    function mainEditorPanel() {
      return [
            '<div class="row">',
            '  <div class="col-xs-12">',
            // TODO The main editing part goes here
            '  </div>',
            '</div>'
          ].join('');
    }

    function feedback() {
      return [
            '<div class="row">',
            '  <div class="col-xs-12 feedback-panel-col">',
            '  </div>',
            '</div>'
          ].join("\n");
    }

    function optionsPanel() {
      return [
            '<div class="row option a">',
            '  <div class="col-xs-12">',
              //TODO fill in option input template
            '  </div>',
            '</div>',
            '<div class="row option b">',
            '  <div class="col-xs-12">',
              //TODO fill in option input template
            '  </div>',
            '</div>',
            '<div class="row option c">',
            '  <div class="col-xs-12">',
              //TODO fill in option input template
            '  </div>',
            '</div>'
          ].join('');
    }
  }
}