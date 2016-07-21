angular
  .module('app', ['ui.router', 'ngAnimate', 'mcwebb.sound', 'angular-spinkit']);
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

angular
  .module('app')
  .config(config);

var AboutController = './about/about.controller.js';
var AuthController = './auth/auth.controller.js';
var ConsumersController = './consumers/consumers.controller.js';
var LandingController = './landing/landing.controller.js';
var PromotersController = './promoters/promoters.controller.js';
var SearchController = './search/search.controller.js';

function config($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/landing');

	$stateProvider
		.state('landing', {
			url: '/landing',
			templateUrl: '../app/landing/landing.html',
			controller: LandingController,
			controllerAs: 'Landing',
			data: {
				bodyClasses: 'landing',
				auth: false
			}
		})
		.state('about', {
			url: '/about',
			templateUrl: '../app/about/about.html',
			controller: AboutController,
			controllerAs: 'About',
			data: {
				bodyClasses: 'about',
				auth: false
			}
		})
		.state('auth', {
			url: '/auth',
			templateUrl: '../app/auth/auth.html',
			controller: AuthController,
			controllerAs: 'Auth',
			data: {
				bodyClasses: 'auth',
				auth: false
			}
		})
	  .state('consumers', {
	  	url: '/consumers',
	  	templateUrl: '../app/consumers/consumers.html',
	  	controller: ConsumersController,
	  	controllerAs: 'Consumers',
	  	data: {
	  		bodyClasses : 'consumers',
	  		auth: false
	  	}
	  })
	  .state('promoters', {
	  	url: '/promoters',
	  	templateUrl: '../app/promoters/promoters.html',
	  	controller: PromotersController,
	  	controllerAs: 'Promoters',
	  	data: {
	  		bodyClasses : 'promoters',
	  		auth: true
	  	}
	  })
	  .state('search', {
	  	url: '/search',
	  	templateUrl: '../app/search/search.html',
	  	controller: SearchController,
	  	controllerAs: 'Search',
	  	data: {
	  		bodyClasses : 'search',
	  		auth: false
	  	}
	  });
}

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
(function (){

angular
  .module('app')
  .controller('AuthController', AuthController);

AuthController.$inject = ['$scope', 'authFactory', 'soundFactory'];

function AuthController($scope, authFactory, soundFactory) {
	var vm = this;

	soundFactory.loadSounds();

	vm.signUpForm = false;
	vm.signInForm = true;
	vm.signUpErrorMessage = function() {
		return authFactory.get('signupErrorMessage');
	};
	vm.signInErrorMessage = function() {
		return authFactory.get('signinErrorMessage');
	};
	vm.set = function(key, value) {
		authFactory.set(key, value);
	};


	vm.signUp = function(obj) {
		console.log('this is sign up obj: ', obj);
		authFactory.signUp(obj);
		vm.usernameUp = '';
		vm.emailUp = '';
		vm.passwordUp = '';
	};

	vm.signIn = function(obj) {
		authFactory.signIn(obj);
		vm.usernameIn = '';
		vm.passwordIn = '';
	};

	vm.get = authFactory.get;

	vm.playClick = function() {
		console.log('AuthController playClick');
		soundFactory.playClick();
	};

}

})();
angular
  .module('app')
  .factory('chatFactory', chatFactory);

  chatFactory.$inject = ['$state', 'socketFactory', 'consumersFactory'];

  function chatFactory(socketFactory, $state) {
    var socket = socketFactory;
    var consumers = consumersFactory;

    var state = {
      userList: [],
      userLeft: null,
      messages: []
    };

    function chatListeners() {

      socket.on('updated user list', function(data) {
        state.userList = data.users;
        console.log('*User List: ', data,'*');
      });

      socket.on('message', function(data) {
        set('messages', data);
        console.log('*Messages: ', state.messages,'*');
      });

      socket.on('user left ', function(data) {
        set('userLeft', data);
        console.log('*Message: ', message,'*');
      });
    }

    function get(key) {
      return state[key];
    }

    function set(key, data) {
      if(Array.isArray(state[key])) {
        state[key].push(data);
      } else {
        state[key] = data;
        console.log('*State: ',state,'*');
      }
    }

    return {
      chatListeners: chatListeners,
      get: get,
      set: set
    };

  }

angular
  .module('app')
  .factory('consumersFactory', consumersFactory);

	consumersFactory.$inject = ['$state'];

	function consumersFactory($state) {

		var state = {
			joinCodeErrorMessage: '',
			joinCodeErrorMessage2: '',
			joinQueueErrorMessage: '',
			whereTo: null,
			waiting: false
		};

		return {
			get: get,
			set: set,
			reset: reset
		};

		function reset() {
			console.log('*Reset Called Within consumersFactory*');
			state.joinCodeErrorMessage = '';
			state.joinCodeErrorMessage2 = '';
			state.joinQueueErrorMessage = '';
			state.waiting = false;
		}

		function get(key){
			return state[key];
		}

		function set(key, value){
			state[key] = value;
		}

	}

(function () {
'use strict';
 angular
  .module('app')
  .controller('ConsumersController', ConsumersController);

  ConsumersController.$inject = ['$scope', 'consumersFactory', 'socketFactory', 'authFactory', 'soundFactory', 'chatFactory'];

  function ConsumersController($scope, consumersFactory, socketFactory, authFactory, soundFactory, chatFactory) {

    var socket = socketFactory;
    var vm = this;

    soundFactory.loadSounds();
    authFactory.checkAuth();

    vm.get = consumersFactory.get;
    vm.set = consumersFactory.set;

    vm.showCreateGameInput = false;
    vm.showCreateGameController = false;
    vm.showJoinGameInput = false;
    vm.showJoinGameController = false;
    vm.showPreQueueWarning = false;
    vm.showAvatars = false;
    vm.showTutorial = false;
    vm.joinQueueTutorial = false;
    vm.gameplayTutorial = false;
    vm.createPrivateGameTutorial = false;
    vm.joinPrivateGameTutorial = false;

    vm.messages = null;
    vm.getChats = chatFactory.get;
    vm.messages = chatFactory.get('messages');

    vm.joinRoom = function(joinCode) {
      if (joinCode === undefined || joinCode.length < 3) {
        consumersFactory.set('joinCodeErrorMessage2', 'Minimum 3 characters required!');
        return;
      }
      consumersFactory.set('waiting', true);
      consumersFactory.set('tempJoinCode', joinCode);
      socket.emit('join private game', {joinCode: joinCode});
    };

    vm.createRoom = function(joinCode) {
      if (joinCode === undefined || joinCode.length < 3) {
        consumersFactory.set('joinCodeErrorMessage', 'Minimum of 3 characters required.');
        return;
      }
      consumersFactory.set('waiting', true);
      consumersFactory.set('tempJoinCode', joinCode);
      socket.emit('create private game', {joinCode: joinCode.toLowerCase()});
    };

    vm.queue = function(message) {
      consumersFactory.set('waiting', true);
      socket.emit('queue', message);
    };

	  vm.chat = function(){
		  socket.emit('chat');
	  };


    vm.signOut = function() {
      authFactory.signOut();
    };

    vm.toggleQueueWarning = function() {
      if(vm.showPreQueueWarning) {
        vm.showPreQueueWarning = false;
      } else {
        vm.showPreQueueWarning = true;
      }
    };

    vm.toggleTutorial = function() {
      if(vm.showTutorial) {
        vm.showTutorial = false;
      } else {
        vm.showTutorial = true;
      }
    };

    vm.getLeaderboard = function() {
      return statsFactory.get('leaderboard');
    };

    vm.updateAvatar = function(obj) {
      if (obj.avatar === ""){
        return;
      }
      consumersFactory.set('avatar', obj.avatar);
      socketFactory.emit('update avatar', obj);
      statsFactory.updatePlayerAvatar(obj.avatar);
    };

    vm.setNewAvatar = function(avatar) {
      consumersFactory.set('tempAvatar', avatar);
    };

    vm.playClick = function() {
      soundFactory.playClick();
    };

    vm.playConfirm = function() {
      soundFactory.playConfirm();
    };

    vm.playChat = function() {
      soundFactory.playChat();
    };

    vm.sendMessage = function(message)  {
      socketFactory.emit('new message', {message: message});
      vm.message = '';
    };

  }
})();

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
(function (){

angular
  .module('app')
  .controller('LandingController', LandingController);

LandingController.$inject = ['$scope', 'landingFactory', 'soundFactory'];

function LandingController($scope, landingFactory, soundFactory) {
  var vm = this;
  var lf = landingFactory;
  vm.appIconURL = '../../images/MyPromoter.png';

  soundFactory.loadSounds();

  vm.enterApp = function() {
    lf.enterApp();
  };

  vm.goAuth = function() {
    lf.goAuth();
  };

  vm.goAbout = function() {
    lf.goAbout();
  };

}

})();
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