describe('audio-tag-controller', function() {

  var scope, audioTagController, showControls, mockElement;

  var mockAudioElement = {
    pause: jasmine.createSpy('pause'),
    play: jasmine.createSpy('play'),
    currentTime: 1.0,
    volume: 1.0
  }

  var mockElement = {
    find: function(query){
      return {
        length: 1,
        '0' : mockAudioElement,
        attr: jasmine.createSpy('attr'),
        load: jasmine.createSpy('load'),
        off: jasmine.createSpy('off'),
        on: jasmine.createSpy('on')
      }
    }
  }

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {

    });
  });


  beforeEach(inject(function(AudioTagController) {
    audioTagController = new AudioTagController(mockElement, 'audio');
  }));

  describe('update', function() {
    it('sets volume to 1 when showControls is false', function(){
      mockAudioElement.volume = 666;
      audioTagController.update(showControls=false);
      expect(mockAudioElement.volume).toBe(1.0);
    });
  });


});
