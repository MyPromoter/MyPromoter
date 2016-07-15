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
    'socketFactory'
  ];

  function appController($scope, $state, $window, $timeout, authFactory, socketFactory) {

  }

})();