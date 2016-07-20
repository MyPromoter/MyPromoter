(function (){

angular
  .module('app')
  .controller('LandingController', LandingController);

LandingController.$inject = ['$scope', 'soundFactory'];

function LandingController($scope, soundFactory) {
  var vm = this;
  vm.appIconURL = '../../images/MyPromoter.png';

  soundFactory.loadSounds();

  vm.enterApp = function() {

  };

  vm.goToSignIn = function() {

  };

  vm.goToSignUp = function() {

  };

  vm.goToOurServices = function() {

  };

  vm.goToMeetManagement = function() {

  };
}

})();