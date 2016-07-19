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

      socket.on('player already in queue', userAlreadyInQueue);
      socket.on('added to queue', addedToQueue);
      socket.on('join code invalid', joinCodeInvalid);
      socket.on('join code added', joinCodeAdded);
      socket.on('join code found', joinCodeFound);
      socket.on('join code not found', joinCodeNotFound);
      socket.on('you are', youAre);
    }

    function youAre(resp) {
      // event: 'you are'
      consumers.set('player', resp);
      consumers.set('avatar', resp.avatar);
    }

    function userAlreadyInQueue(resp) {
      // event: 'user already in queue'
      consumers.set('joinQueueErrorMessage', 'User already in queue.');
    }

    function addedToQueue() {
      // event: 'added to queue'
      consumers.set('whereTo', 'queue');
      consumers.set('waiting', true);
      $state.go('waiting');
    }

    function joinCodeInvalid(resp) {
      // event: 'join code invalid'
      consumers.set('joinCodeErrorMessage', resp.message);
    }

    function joinCodeAdded() {
      // event: 'join code added'
      consumers.set('whereTo', 'private');
      consumers.set('joinCode', consumers.get('tempJoinCode'));
      consumers.set('tempJoinCode', '');
      console.log('consumers whereTo = ', consumers.get('whereTo'));
      $state.go('waiting');
    }

    function joinCodeFound() {
      // event: 'join code found'
      consumers.set('whereTo', 'private');
      consumers.set('joinCode', consumers.get('tempJoinCode'));
      consumers.set('tempJoinCode', '');
      $state.go('waiting');
    }

    function joinCodeNotFound(resp) {
      // event: 'join code not found'
      consumers.set('joinCodeErrorMessage2', resp.message);
    }

  }

})();
