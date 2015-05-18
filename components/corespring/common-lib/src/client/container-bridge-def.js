exports.framework = "angular";
exports.factory = [
  function() {

    /**
     * Default implementation for the container bridge
     */
    function ContainerBridgeDef() {
      function notImplemented(name) {
        throw "method " + name + " not implemented";
      }
      this.setDataAndSession = function(dataAndSession) {
        notImplemented('setDataAndSession');
      };

      this.getSession = function() {
        notImplemented('getSession');
      };

      this.setResponse = function(response) {
        notImplemented('setResponse');
      };

      this.setMode = function(newMode) {
        notImplemented('setMode');
      };

      this.reset = function() {
        notImplemented('reset');
      };

      this.isAnswerEmpty = function() {
        notImplemented('isAnswerEmpty');
      };

      this.answerChangedHandler = function(callback) {
        notImplemented('answerChangedHandler');
      };

      this.editable = function(e) {
        notImplemented('editable');
      };
    }

    return ContainerBridgeDef;
  }
];