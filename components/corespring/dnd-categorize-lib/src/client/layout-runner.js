exports.framework = 'angular';
exports.factory = [function(){

  return LayoutRunner;

  function LayoutRunner(timeout) {

    var nextRefreshHandle = null;
    var cancelled = false;
    var layout = null;

    this.runLater = runLater;
    this.cancel = cancel;
    this.start = start;
    this.run = run;

    //--------------------------------

    function runLater(block) {
      if (cancelled) {
        return;
      }
      if (window.requestAnimationFrame) {
        nextRefreshHandle = window.requestAnimationFrame(block);
      } else {
        nextRefreshHandle = timeout(block, 100);
      }
    }

    function cancel() {
      cancelled = true;
      if (nextRefreshHandle) {
        if (window.requestAnimationFrame) {
          window.cancelAnimationFrame(nextRefreshHandle);
        } else {
          timeout.cancel(nextRefreshHandle);
        }
      }
    }

    function start(targetLayout) {
      layout = targetLayout;
      cancelled = false;
      runLater(run);
    }

    function run() {
      runLater(run);
      layout.refresh();
    }
  }
}];


