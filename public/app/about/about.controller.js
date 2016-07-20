(function (){

angular
  .module('app')
  .controller('AboutController', AboutController);

AboutController.$inject = ['$scope', 'soundFactory'];

function AboutController($scope, soundFactory) {
  var vm = this;

  vm.appIconURL = '../../images/MyPromoter.png';

  soundFactory.loadSounds();

}

})();