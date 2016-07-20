(function (){
  angular
    .module('app')
    .factory('promotersFactory', promotersFactory);

    promotersFactory.$inject = ['$http', '$window', '$state'];

    function promotersFactory($http, $window, $state) {

      console.log('*promotersFactory Running*');

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