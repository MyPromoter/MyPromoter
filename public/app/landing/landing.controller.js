(function (){

  angular
    .module('app')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$scope', 'soundFactory'];

  function LandingController($scope, soundFactory) {
    var vm = this;
    // var lf = landingFactory;
    vm.appIconURL = '../../images/MyPromoter.png';

    soundFactory.loadSounds();

    vm.enterApp = function() {
      // lf.enterApp();
    };

    vm.goAuth = function() {
      // lf.goAuth();
    };

    vm.goAbout = function() {
      // lf.goAbout();
    };

  }

})();