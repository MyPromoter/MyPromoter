(function() {

  angular
    .module('app')
    .controller('AppController', appController);

  appController.$inject = [
    '$scope',
    '$state',
    '$window',
    '$timeout',
    'authFactory',
    'socketFactory',
    'consumersFactory',
    'consumersListenersFactory',
    'landingFactory',
    'promotersFactory',
    'chatFactory'
  ];

  function appController($scope, $state, $window, $timeout, authFactory, socketFactory, consumersFactory, consumersListenersFactory, landingFactory, chatFactory) {
    var emit = socketFactory.emit;
    var on = socketFactory.on;

    var consumersListeners = consumersListenersFactory;
    var socket = socketFactory;

    var consumers = consumersFactory;

    var vm = this;
    vm.bodyClasses = 'default';

    function goToConsumers() {
      $state.go('consumers');
    }

    // this'll be called on every state change in the app
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

        console.log('*State Change Detected* =========');
        console.log('From: ', fromState.name);
        console.log('To: ', toState.name);
        console.log('======================');

      if (toState.data.authenticate) {
        if (!authFactory.isAuthed()) {
          $state.go('auth');
          return;
        }
      }

      if (toState.name === 'consumers') {
        consumersFactory.reset();
        socket.disconnect();
        socket.connectSocket().then(function() {
          consumersListeners.init();
          chatFactory.chatListeners();
          battlefieldFactory.boardReset();
          socket.emit('who am i');
          statsFactory.getBoard();
        });
      }

      if (toState.name === 'waiting') {

        if (!consumersFactory.get('waiting')) {
          goToConsumers();
          return;
        }

        if (fromState.name !== 'consumers') {
          goToLobby();
          return;
        }

        if (!socket.isConnected()) {
          console.error('toState.name: waiting // *ERROR: Socket NOT Connected*');
          $state.go('consumers');
          return;
        }

        waitingListenersFactory.init();
      }

      if (toState.name === 'battlefield') {
        if (fromState.name !== 'waiting') {
          goToLobby();
          return;
        }

        if (!socketFactory.isConnected()) {
          console.error('toState.name: battlefield // *ERROR: Socket NOT Connected*');
          $state.go('consumers');
          return;
        }

        battlefieldFactory.listeners();

        angular.element(document).ready(function() {
          $timeout(function() {
            console.log('*Emitted: clientReady*');
            socketFactory.emit('client ready');
          }, 2000);
        });
      }

      if (fromState.name === 'waiting') {
        waitingFactory.reset();
      }

      if (fromState.name === 'consumers') {
        consumersFactory.reset();
      }

      if (angular.isDefined(toState.data)) {
        if (angular.isDefined(toState.data.bodyClasses)) {
          vm.bodyClasses = toState.data.bodyClasses;
          return;
        }
      }

      vm.bodyClasses = 'default';
    });
  }

})();
