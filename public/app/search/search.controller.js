(function (){

  angular
    .module('app')
    .controller('SearchController', SearchController);

  SearchController.$inject = ['$scope', 'searchFactory', 'soundFactory'];

  function SearchController($scope, searchFactory, soundFactory) {
    var vm = this;
    var sf = searchFactory;
    vm.appIconURL = '../../images/MyPromoter.png';

    soundFactory.loadSounds();


  }

})();