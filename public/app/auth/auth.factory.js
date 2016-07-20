(function (){
  angular
    .module('app')
    .factory('authFactory', authFactory);

    authFactory.$inject = ['$http', '$window', '$state', '$location'];

    function authFactory($http, $window, $state, $location) {

      console.log('*authFactory Running*');

      var state = {
        signupErrorMessage: '',
        signinErrorMessage: ''
      };

      return {
        signUp: signUp,
        signIn: signIn,
        signOut: signOut,
        checkAuth: checkAuth,
        isAuthed: isAuthed,
        attachToken: attachToken,
        get: get,
        set: set
      };

      function signUp(userObj) {

        var request = {
          method: 'POST',
          url: '/signUp',
          data: userObj
        };

        if ((userObj.username === undefined) || (userObj.username.length > 13) || (userObj.email === undefined) || (userObj.password === undefined) || (userObj.password.length < 4) || (userObj.username.length < 1) || (userObj.email.length < 1)) {
          state.signupErrorMessage = "";
          state.signupErrorMessage += "Error! Invalid Input.";
          return;
        }

        return $http(request)
          .then(success, error);

        function success(resp) {
          if (resp.data.credentialsMissing){
            state.signinErrorMessage = "";
            state.signinErrorMessage += resp.data.message;
          }
          if (resp.data.token) {
            $state.go('promoters');
            saveToken(resp.data.token);
          }
          if (resp.data.exists) {
            state.signupErrorMessage = "";
            state.signupErrorMessage += resp.data.message;
          }
        }

        function error(err) {
          return console.error(err);
        }
      }

      function signIn(userObj) {
        var request = {
          method: 'POST',
          url: '/signIn',
          data: userObj
        };

        if ((userObj.username === undefined) || (userObj.password === undefined) || (userObj.username.length < 1) || (userObj.password === undefined) || (userObj.password.length < 1)) {
          state.signinErrorMessage = "";
          state.signinErrorMessage += "Dude, c'mon";
          return;
        }

        return $http(request)
          .then(success, error);

        function success(resp){
          if (resp.data.credentialsMissing){
            state.signinErrorMessage = "";
            state.signinErrorMessage += resp.data.message;
          }
          if (resp.data.auth){
            $state.go('promoters');
            saveToken(resp.data.token);
          }
          if (!resp.data.auth){
            state.signinErrorMessage = "";
            state.signinErrorMessage += resp.data.message;
          }
        }
        function error(err) {
          return console.error(err);
        }
      }

      function get(name) {
        return state[name];
      }

      function set(key, value){
        state[key] = value;
        return;
      }

      function signOut() {
        $window.localStorage.removeItem('token');
        delete $window.localStorage.token;
        $window.location.href = '/';
      }

      function attachToken(obj) {
        obj.token = $window.localStorage.token;
        return obj;
      }

      function getToken() {
        return $window.localStorage.token;
      }

      function saveToken(token) {
        $window.localStorage.token = token;
      }

      function isAuthed(token) {
        return !!$window.localStorage.token;
      }

      function checkAuth() {
        if(!isAuthed()) {
          $state.go('auth');
        }
      }

    }
})();