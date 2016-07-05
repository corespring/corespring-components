exports.framework = "angular";
exports.factory = [function() {
  return AudioTagController;
}];

function AudioTagController(element, audioElementQuery, onLoaded, onEnded) {

  this.destroy = destroy;
  this.pause = pause;
  this.play = play;
  this.update = update;

  function getAudioElement() {
    return element.find(audioElementQuery);
  }

  function update(showControls) {
    var audioElement = getAudioElement();
    audioElement.attr('controls', showControls);
    audioElement.off('loadeddata', onLoaded);
    audioElement.on('loadeddata', onLoaded);
    audioElement.load();
  }

  function play() {
    var audioElement = getAudioElement();
    audioElement.off('ended', onEnded);
    audioElement.on('ended', onEnded);
    audioElement[0].play();
  }

  function pause() {
    var audioElement = getAudioElement();
    audioElement[0].pause();
    audioElement[0].currentTime = 0;
  }

  function destroy() {
    var audioElement = getAudioElement();
    audioElement.off('ended', onEnded);
    audioElement.off('loadeddata', onLoaded);
  }
}
