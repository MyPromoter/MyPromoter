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
    'consumersFactory',
    'landingFactory',
    'promotersFactory',
    'searchFactory',
    'soundFactory',
    'socketFactory',
    'chatFactory'
  ];

  function appController($scope, $state, $window, $timeout, authFactory, consumersFactory, landingFactory, promotersFactory, searchFactory, soundFactory, socketFactory, chatFactory) {
    var emit = socketFactory.emit;
    var on = socketFactory.on;

    var consumersListeners = consumersListenersFactory;
    var socket = socketFactory;

    var consumers = consumersFactory;

    var vm = this;
    vm.bodyClasses = 'default';

    function goLanding() {
      $state.go('landing');
    }

    // During App State Change,
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
          socket.emit('who am i');
        });
      }

      if (toState.name === 'loading') {

        if (!consumersFactory.get('loading')) {
          goToConsumers();
          return;
        }

        if (fromState.name !== 'consumers') {
          goToLobby();
          return;
        }

        if (!socket.isConnected()) {
          console.error('toState.name: loading // *ERROR: Socket NOT Connected*');
          $state.go('consumers');
          return;
        }

        loadingListenersFactory.init();
      }

      if (toState.name === 'CHANGE_To_Right_STATE') {
        if (fromState.name !== 'loading') {
          goToLobby();
          return;
        }

        if (!socketFactory.isConnected()) {
          console.error('toState.name: CHANGE_To_Right_STATE // *ERROR: Socket NOT Connected*');
          $state.go('consumers');
          return;
        }

        //*Initialize State Socket Listeners Here*//

        angular.element(document).ready(function() {
          $timeout(function() {
            console.log('*Emitted: clientReady*');
            socketFactory.emit('client ready');
          }, 2000);
        });
      }

      if (fromState.name === 'loading') {
        loadingFactory.reset();
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
