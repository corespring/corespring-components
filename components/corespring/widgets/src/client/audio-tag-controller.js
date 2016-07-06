exports.framework = "angular";
exports.factory = [function() {
  return AudioTagController;
}];

function AudioTagController(element, audioElementQuery) {

  var onLoaded = noop;
  var onEnded = noop;

  this.destroy = destroy;
  this.pause = pause;
  this.play = play;
  this.reset = reset;
  this.update = update;
  this.onLoaded = setOnLoaded;
  this.onEnded = setOnEnded;

  function getAudioElement() {
    return element.find(audioElementQuery);
  }

  function update(showControls) {
    var audioElement = getAudioElement();
    audioElement.attr('controls', showControls);
    audioElement.off('loadeddata', onLoaded);
    audioElement.on('loadeddata', onLoaded);
    audioElement.load();
    return this;
  }

  function play() {
    var audioElement = getAudioElement();
    audioElement.off('ended', onEnded);
    audioElement.on('ended', onEnded);
    audioElement[0].play();
    return this;
  }

  function pause() {
    var audioElement = getAudioElement();
    audioElement[0].pause();
  }

  function reset() {
    var audioElement = getAudioElement();
    audioElement[0].currentTime = 0;
    return this;
  }

  function destroy() {
    var audioElement = getAudioElement();
    audioElement.off('ended', onEnded);
    audioElement.off('loadeddata', onLoaded);
    return this;
  }

  function setOnLoaded(handler){
    onLoaded = _.isFunction(handler) ? handler : noop;
    return this;
  }

  function setOnEnded(handler){
    onEnded = _.isFunction(handler) ? handler : noop;
    return this;
  }

  function noop(){
  }
}
