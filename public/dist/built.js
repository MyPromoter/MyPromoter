var app = angular.module('app', ['ui.router', 'ngAnimate', 'mcwebb.sound', 'angular-spinkit']);
(function() {

  angular
    .module('app')
    .controller('AppController', appController);

  appController.$inject = [
    '$scope',
    '$state',
    '$window',
    '$timeout',
    'authFactory',
    'socketFactory',
    'consumersFactory',
    'consumersListenersFactory',
    'chatFactory'
  ];

  function appController($scope, $state, $window, $timeout, authFactory, socketFactory, consumersFactory, consumersListenersFactory, chatFactory) {
    var emit = socketFactory.emit;
    var on = socketFactory.on;

    var consumersListeners = consumersListenersFactory;
    var socket = socketFactory;

    var consumers = consumersFactory;

    var vm = this;
    vm.bodyClasses = 'default';

    function goToConsumers() {
      $state.go('consumers');
    }

    // During App State Change,
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

        console.log('*State Change Detected* =========');
        console.log('From: ', fromState.name);
        console.log('To: ', toState.name);
        console.log('======================');

      if (toState.data.authenticate) {
        if (!authFactory.isAuthed()) {
          $state.go('auth');
          return;
        }
      }

      if (toState.name === 'consumers') {
        consumersFactory.reset();
        socket.disconnect();
        socket.connectSocket().then(function() {
          consumersListeners.init();
          chatFactory.chatListeners();
          socket.emit('who am i');
        });
      }

      if (toState.name === 'loading') {

        if (!consumersFactory.get('loading')) {
          goToConsumers();
          return;
        }

        if (fromState.name !== 'consumers') {
          goToLobby();
          return;
        }

        if (!socket.isConnected()) {
          console.error('toState.name: loading // *ERROR: Socket NOT Connected*');
          $state.go('consumers');
          return;
        }

        loadingListenersFactory.init();
      }

      if (toState.name === 'CHANGE_To_Right_STATE') {
        if (fromState.name !== 'loading') {
          goToLobby();
          return;
        }

        if (!socketFactory.isConnected()) {
          console.error('toState.name: CHANGE_To_Right_STATE // *ERROR: Socket NOT Connected*');
          $state.go('consumers');
          return;
        }

        //*Initialize State Socket Listeners Here*//

        angular.element(document).ready(function() {
          $timeout(function() {
            console.log('*Emitted: clientReady*');
            socketFactory.emit('client ready');
          }, 2000);
        });
      }

      if (fromState.name === 'loading') {
        loadingFactory.reset();
      }

      if (fromState.name === 'consumers') {
        consumersFactory.reset();
      }

      if (angular.isDefined(toState.data)) {
        if (angular.isDefined(toState.data.bodyClasses)) {
          vm.bodyClasses = toState.data.bodyClasses;
          return;
        }
      }

      vm.bodyClasses = 'default';
    });
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
            $state.go('lobby');
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
            $state.go('lobby');
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
        console.log('*user list: ', data,'*');
      });

      socket.on('message', function(data) {
        set('messages', data);
        console.log('*messages: ', state.messages,'*');
      });

      socket.on('user left ', function(data) {
        set('userLeft', data);
        console.log('*message: ', message,'*');
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

(function() {

angular
  .module('app')
  .factory('consumersListenersFactory', consumersListenersFactory);

  consumersListenersFactory.$inject = ['socketFactory', 'consumersFactory','$state'];

  function consumersListenersFactory(socketFactory, consumersFactory, $state) {

    var socket = socketFactory;
    var consumers = consumersFactory;

    return {
      init: init
    };

    // -----------------------
    // consumers listeners

    function init() {
      if (!socket.isConnected()) {
        console.error('*Socket NOT Connected. consumersListeners SetUp Failed*');
        return;
      }

      socket.on('you are', youAre);
    }

    function youAre(resp) {
      // event: 'you are'
    }

  }

})();

(function () {
'use strict';
 angular
  .module('app')
  .controller('ConsumersController', ConsumersController);

  ConsumersController.$inject = ['$scope', 'consumersFactory', 'socketFactory', 'authFactory', 'statsFactory', 'soundFactory', 'chatFactory'];

  function ConsumersController($scope, consumersFactory, socketFactory, authFactory, statsFactory, soundFactory, chatFactory) {

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




angular
  .module('app')
  .factory('socketFactory', socketFactory);

  socketFactory.$inject = ['$rootScope', 'authFactory'];

  function socketFactory($rootScope, authFactory) {

    var socket;

    return {
      disconnect: disconnect,
      connectSocket: connectSocket,
      on: on,
      emit: emit,
      isConnected: isConnected
    };

    function isConnected() {
      console.log('*Socket Connection = ', !!socket,'*');
      return !!socket;
    }

    function disconnect() {
      if (isConnected()) {
        console.log('*Disconnecting Socket*');
        socket.disconnect();
        socket = null;
      }
    }

    function connectSocket() {
      return new Promise(function(resolve, reject) {
        if (!socket && authFactory.isAuthed()) {
          console.log('*Connecting Socket*');
          socket = io.connect();
          socket.on('socket initialized', function() {
            console.log('*Responding to Socket Initialized Emit*');
            resolve();
          });
          socket.emit('init', authFactory.attachToken({}));
        }
      });
    }

    /**
     *  Socket Events
     *
     *  Used to wrap the socket's native 'on' and 'emit' functions
     *  packet envelope that we specify
     */
    function on(eventName, callback) {
      console.log('*Socket.on(', eventName,') Was Called*');
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    }

    function emit(eventName, data, callback, auth) {
      if (auth) {
        data = data || {};
        data = authFactory.attachToken(data);
      }
      console.log('*Socket.emit(', eventName,') Was Called*');
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  }

angular
  .module('app')
  .factory('soundFactory', soundFactory);

  soundFactory.$inject = ['SoundService'];

  function soundFactory(SoundService) {

    var click = {name: 'click', src: '../../soundEffects/click.mp3'};
    var paymentProcessed = {name: 'paymentProcessed', src: '../../soundEffects/paymentProcessed.mp3'};

    return {
      loadSounds: loadSounds,
      playChat: playPaymentProcessed,
      playClick: playClick,
    };

    function loadSounds() {
      SoundService.loadSound(click);
      SoundService.loadSound(paymentProcessed);
    }

    function playPaymentProcessed() {
      console.log('payment processed!');
      SoundService.getSound(paymentProcessed.name).start();
    }

    function playClick() {
      console.log('something clicked!');
      SoundService.getSound(click.name).start();
    }

  }

angular
  .module('app')
  .config(config);


function config($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/landing');

	$stateProvider
		.state('landing', {
			url: '/landing',
			templateUrl: '../app/landing/landing.html',
			controller: 'LandingController',
			controllerAs: 'Landing',
			data: {
				bodyClasses: 'landing',
				auth: false
			}
		})
		.state('about', {
			url: '/about',
			templateUrl: '../app/about/about.html',
			controller: 'AboutController',
			controllerAs: 'About',
			data: {
				bodyClasses: 'about',
				auth: false
			}
		})
		.state('auth', {
			url: '/auth',
			templateUrl: '../app/auth/auth.html',
			controller: 'AuthController',
			controllerAs: 'Auth',
			data: {
				bodyClasses: 'auth',
				auth: false
			}
		})
	  .state('consumers', {
	  	url: '/consumers',
	  	templateUrl: '../app/consumers/consumers.html',
	  	controller: 'ConsumersController',
	  	controllerAs: 'Consumers',
	  	data: {
	  		bodyClasses : 'consumers',
	  		auth: false
	  	}
	  })
	  .state('promoters', {
	  	url: '/promoters',
	  	templateUrl: '../app/promoters/promoters.html',
	  	controller: 'PromotersController',
	  	controllerAs: 'Promoters',
	  	data: {
	  		bodyClasses : 'promoters',
	  		auth: true
	  	}
	  })
	  .state('search', {
	  	url: '/search',
	  	templateUrl: '../app/search/search.html',
	  	controller: 'SearchController',
	  	controllerAs: 'Search',
	  	data: {
	  		bodyClasses : 'search',
	  		auth: false
	  	}
	  });
}
