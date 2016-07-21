(function() {

  angular
    .module('app')
    .controller('AppController', appController);

  appController.$inject = [
    '$scope',
    '$state',
    '$window',
    '$timeout'
  ];

  function appController($scope, $state, $window, $timeout) {

  }

})();
