(function() {

angular
  .module('app')
  .factory('consumersListenersFactory', consumersListenersFactory);

  consumersListenersFactory.$inject = ['socketFactory', 'consumersFactory','$state'];

  function consumersListenersFactory(socketFactory, consumersFactory, $state) {

    var socket = socketFactory;
    var consumers = consumersFactory;

    return {
      init: init
    };

    // -----------------------
    // consumers listeners

    function init() {
      if (!socket.isConnected()) {
        console.error('*Socket NOT Connected. consumersListeners SetUp Failed*');
        return;
      }

      socket.on('you are', youAre);
    }

    function youAre(resp) {
      // event: 'you are'
    }

  }

})();
