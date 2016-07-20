(function (){

angular
  .module('app')
  .controller('PromotersController', PromotersController);

PromotersController.$inject = ['$scope', 'promotersFactory', 'soundFactory'];

function PromotersController($scope, promotersFactory, soundFactory) {
  var vm = this;
  var pf = promotersFactory;
  vm.appIconURL = '../../images/MyPromoter.png';

  soundFactory.loadSounds();

  vm.enterApp = function() {
    pf.enterApp();
  };

  vm.goAuth = function() {
    pf.goAuth();
  };

  vm.goAbout = function() {
    pf.goAbout();
  };

}

})();