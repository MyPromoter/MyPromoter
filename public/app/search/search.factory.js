(function (){
  angular
    .module('app')
    .factory('searchFactory', searchFactory);

    searchFactory.$inject = ['$http', '$window', '$state'];

    function searchFactory($http, $window, $state) {

      console.log('*searchFactory Running*');

      var state = {};

      return {
        get: get,
        set: set
      };

      function get(name) {
        return state[name];
      }

      function set(key, value){
        state[key] = value;
        return;
      }

    }
})();