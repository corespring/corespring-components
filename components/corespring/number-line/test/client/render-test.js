/* global beforeEach, describe, expect, inject, it, module, spyOn */

describe('corespring:number-line', function () {

  "use strict";

  var MockComponentRegister = function () {
    this.elements = {};
    this.registerComponent = function (id, bridge) {
      this.elements[id] = bridge;
    };
    this.setDataAndSession = function(id, dataAndSession){
      this.elements[id].setDataAndSession(dataAndSession);
    };
  };

  var element, scope, rootScope, container, testModel;

  function createTestModel() {

    return {
      data: {
        model : {
          "config" : {
            "domain" : [
              0,
              1
            ],
            "initialType" : "PF",
            "snapPerTick" : 1,
            "showMinorTicks" : true,
            "exhibitOnly" : false,
            "maxNumberOfPoints" : 1,
            "tickFrequency" : 8,
            "availableTypes" : {
              "PF" : true
            },
            "initialElements" : [ ],
            "ticks" : [
              {
                "label" : "0",
                "value" : 0
              },
              {
                "label" : "0.125",
                "value" : 0.125
              },
              {
                "label" : "0.25",
                "value" : 0.25
              },
              {
                "label" : "0.375",
                "value" : 0.375
              },
              {
                "label" : "0.5",
                "value" : 0.5
              },
              {
                "label" : "0.625",
                "value" : 0.625
              },
              {
                "label" : "0.75",
                "value" : 0.75
              },
              {
                "label" : "0.875",
                "value" : 0.875
              },
              {
                "label" : "1",
                "value" : 1
              }
            ]
          }
        }
      }
    };
  }

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function () {
    module(function ($provide) {
      testModel = createTestModel();
    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function (event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-number-line-render id='1'></corespring-number-line-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function () {
    expect(element).toNotBe(null);
  });

  it('sets model', function () {
    container.setDataAndSession('1', testModel);
    expect(scope.model.config).toBeDefined();
    expect(scope.correctModel.config).toBeDefined();
  });


});
