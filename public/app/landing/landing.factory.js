(function (){
  angular
    .module('app')
    .factory('landingFactory', landingFactory);

    landingFactory.$inject = ['$http', '$window', '$state'];

    function landingFactory($http, $window, $state) {

      console.log('*landingFactory Running*');

      var state = {};

      return {
        get: get,
        set: set,
        enterApp: enterApp,
        goAuth: goAuth,
        goAbout: goAbout
      };

      function get(name) {
        return state[name];
      }

      function set(key, value){
        state[key] = value;
        return;
      }

      function enterApp() {
        console.log("*Entering Consumers' View*");
        $state.go('consumers');
      }

      function goAuth() {
        console.log('*Entering Auth View*');
        $state.go('auth');
      }

      function goAbout() {
        console.log('*Entering About View*');
        $state.go('about');
      }

    }
})();