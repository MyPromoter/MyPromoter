angular
  .module('app', ['ui.router', 'ngAnimate', 'mcwebb.sound', 'angular-spinkit', 'luegg.directives']);
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
    'statsFactory',
    'lobbyFactory',
    'lobbyListenersFactory',
    'waitingListenersFactory',
    'waitingFactory',
    'battlefieldFactory',
    'chatFactory'
  ];

  function appController($scope, $state, $window, $timeout, authFactory, socketFactory, statsFactory, lobbyFactory, lobbyListenersFactory, waitingListenersFactory, waitingFactory, battlefieldFactory, chatFactory) {
    var emit = socketFactory.emit;
    var on = socketFactory.on;

    var lobbyListeners = lobbyListenersFactory;
    var socket = socketFactory;

    var lobby = lobbyFactory;

    var vm = this;
    vm.bodyClasses = 'default';

    function goToLobby() {
      $state.go('lobby');
    }

    // this'll be called on every state change in the app
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

        console.log('state change =========');
        console.log('to: ', toState.name);
        console.log('from: ', fromState.name);
        console.log('======================');

      if (toState.data.authenticate) {
        if (!authFactory.isAuthed()) {
          $state.go('auth');
          return;
        }
      }

      if (toState.name === 'lobby') {
        lobbyFactory.reset();
        socket.disconnect();
        socket.connectSocket().then(function() {
          lobbyListeners.init();
          chatFactory.chatListeners();
          battlefieldFactory.boardReset();
          socket.emit('who am i');
          statsFactory.getBoard();
        });
      }

      if (toState.name === 'waiting') {

        if (!lobbyFactory.get('waiting')) {
          goToLobby();
          return;
        }

        if (fromState.name !== 'lobby') {
          goToLobby();
          return;
        }

        if (!socket.isConnected()) {
          console.error('toState.name: waiting // No socket connection is set up. Something went wrong.');
          $state.go('lobby');
          return;
        }

        waitingListenersFactory.init();
      }

      if (toState.name === 'battlefield') {
        if (fromState.name !== 'waiting') {
          goToLobby();
          return;
        }

        if (!socketFactory.isConnected()) {
          console.error('toState.name: battlefield // No socket connection is set up. Something went wrong.');
          $state.go('lobby');
          return;
        }

        battlefieldFactory.listeners();

        angular.element(document).ready(function() {
          $timeout(function() {
            console.log('Emitted: clientReady');
            socketFactory.emit('client ready');
          }, 2000);
        });
      }

      if (fromState.name === 'waiting') {
        waitingFactory.reset();
      }

      if (fromState.name === 'lobby') {
        lobbyFactory.reset();
      }

      if (fromState.name === 'battlefield') {
        battlefieldFactory.boardReset();
      }

      // function moving(comingFrom, goingTo) {
      //   return fromState.name === comingFrom && toState.name === goingTo;
      // }

      // console.log('state change =========');
      // console.log('to: ', toState.name);
      // console.log('from: ', fromState.name);
      // console.log('======================');

      // if (toState.name !== 'auth' && toState.name !== 'lobby') {
      //   if (!socketFactory.isConnected()) {
      //     goToLobby();
      //   }
      // }

      // if (moving('lobby', 'battlefield')) {
      //   goToLobby();
      // }

      // if (moving('battlefield', 'lobby')) {
      //   goToLobby();
      // }

      // // if (fromState.name === 'battlefield' && toState.name === 'lobby') {
      // //   $window.location.reload();
      // // }

      // if ((fromState.name === '' && toState.name === 'waiting') ||
      //     (fromState.name === '' && toState.name === 'battlefield') ||
      //     (fromState.name === 'waiting' && toState.name === 'lobby') ||
      //     (fromState.name === 'battlefield' && toState.name !== 'lobby')
      //   ) {
      //   console.log('inside of invalid state change.');
      //   console.log('state change =========');
      //   console.log('to: ', toState.name);
      //   console.log('from: ', toState.name);
      //   console.log('======================');
      //   goToLobby();
      // }

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

      console.log('factory is run');

      var state = {
        signupErrorMessage: '',
        signinErrorMessage: '',
        avatarClicked: ''
      };

      return {
        signUp: signUp,
        signIn: signIn,
        signOut: signOut,
        checkAuth: checkAuth,
        isAuthed: isAuthed,
        attachToken: attachToken,
        get: get,
        set: set,
        selectAvatar: selectAvatar
      };

      function signUp(userObj) {

        var request = {
          method: 'POST',
          url: '/signUp',
          data: userObj
        };

        if ((userObj.username === undefined) || (userObj.username.length > 13) || (userObj.email === undefined) || (userObj.password === undefined) || (userObj.password.length < 4) || (userObj.username.length < 1) || (userObj.email.length < 1) || (userObj.avatar === undefined || userObj.avatar === '')) {
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

      function selectAvatar(avatar){
        if (avatar === undefined){
          console.log('undefined avatar');
          return;
        }
        state.avatarClicked = avatar;
        console.log('this is state.avatarclicked: ', state.avatarClicked);
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

	vm.avatarSelected = false;
	vm.avatarsMuted = false;
	vm.get = authFactory.get;

	vm.selectAvatar = function(avatar) {
		authFactory.selectAvatar(avatar);
	};

	vm.playClick = function() {
		console.log('AuthController playClick');
		soundFactory.playClick();
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
      console.log('socket connection = ', !!socket);
      return !!socket;
    }

    function disconnect() {
      if (isConnected()) {
        console.log('calling disconnect');
        socket.disconnect();
        socket = null;
      }
    }

    function connectSocket() {
      return new Promise(function(resolve, reject) {
        if (!socket && authFactory.isAuthed()) {
          console.log('connecting socket');
          socket = io.connect();
          socket.on('socket initialized', function() {
            console.log('socket initialized heard. Resolving!');
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
      console.log('on was called. inside socket factory, eventName = ', eventName);
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
      console.log('emit was called. inside socket facotry, eventName = ', eventName);
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
  .factory('battlefieldFactory', bfFactoryFunction);

bfFactoryFunction.$inject = ['socketFactory',
'battlefieldTimerFactory',
'battlefieldLogicFactory',
'$state',
'$window',
'$rootScope'];

function bfFactoryFunction(socketFactory, battlefieldTimerFactory, battlefieldLogicFactory, $state, $window, $rootScope) {

  var bfLogic = battlefieldLogicFactory;
  var bfTimer = battlefieldTimerFactory;
  var socket = socketFactory;
  var startingHealth = {
    rich: 0,
    bum: 0,
    tax: 0,
    cop: 0,
    jail: 0
  };

  var state = {
    choices: ['rich', 'bum', 'tax', 'cop', 'jail'],
    results: false,
    submitted: false,
    roundWinner: null,
    matchOver: false,
    player: false,
    opponent: false,
    opponentPlayed: false,
    gameStarted: false,
    forfeited: false,
    centerMessage: ''
  };

  return {
    listeners: listeners,
    setChoice: setChoice,
    forfeit: forfeit,
    boardReset: boardReset,
    get: get
  };

  function Player(id, profile) {
    this.id = id;
    this.choice = '';
    this.roundStatus = '';
    this.profile = profile;
    this.health = Object.assign({}, startingHealth);
  }

  function setChoice(userChoice) {
    if (userChoice) {
      state.player.choice = userChoice;
      state.submitted = true;
      socket.emit('choice', { choice: userChoice });
    }
  }

  function get(name) {
    return state[name];
  }

  function boardReset() {
    state.results = false;
    state.submitted = false;
    state.roundWinner = null;
    state.matchOver = false;
    state.player = false;
    state.opponent = false;
    state.opponentPlayed = false;
    state.gameStarted = false;
    state.forfeited = false;
    state.playerHealth = Object.assign({}, startingHealth);
    state.opponentHealth = Object.assign({}, startingHealth);

    bfTimer.resetTimer();
  }

  function forfeit() {
    socket.emit('forfeit');
  }

  function listeners() {

    socket.on('gameReady', function(resp) {
      // store player IDs in state
      state.player = new Player(resp.playerId, resp.playerProfile);
      state.opponent = new Player(resp.playerId === 1 ? 2 : 1, resp.opponentProfile);

      // calculate win rates
      state.player.profile.winrate = bfLogic.calcWinRate(state.player.profile.wins, state.player.profile.losses);
      state.opponent.profile.winrate = bfLogic.calcWinRate(state.opponent.profile.wins, state.opponent.profile.losses);

      // store the starting health as given by the server
      for (var choice in resp.startingHealth) {
        state.player.health[choice] = resp.startingHealth[choice];
        state.opponent.health[choice] = resp.startingHealth[choice];
      }

      $rootScope.$broadcast('runAnimations');
    });

    socket.on('opponentPlayed', function(resp) {
      state.opponentPlayed = true;
    });

    socket.on('roundResult', function(resp){
      console.log("roundResult: ", resp);

      bfTimer.resetTimer();
      bfTimer.stopTimer();

      state.results = resp;
      state.opponent.choice = resp.choices[state.opponent.id];

      // identify winner/loser for DOM
      state.roundWinner = resp.roundWinner;

      if (resp.roundWinner === state.player.id) {
        state.player.roundStatus = 'Winner';
        state.opponent.roundStatus = 'Loser';

      } else if (resp.roundWinner === state.opponent.id) {
        state.player.roundStatus = 'Loser';
        state.opponent.roundStatus = 'Winner';

      } else {
        state.player.roundStatus =  state.opponent.roundStatus = 'Tie';
      }

      for (var choice in resp.health[1]) {
        state.player.health[choice] = resp.health[state.player.id][choice];
        state.opponent.health[choice] = resp.health[state.opponent.id][choice];
      }

    });

    socket.on('newRound', function() {
      if (!state.gameStarted) {
        state.gameStarted = true;
      }

      console.log('newRound! Starting Game...');

      // reset state items for next round
      state.submitted = false;
      state.player.choice = '';
      state.player.roundStatus = '';
      state.opponent.choice = '';
      state.opponent.roundStatus = '';
      state.opponentPlayed = false;
      state.roundWinner = null;

      bfTimer.startTimer().then(function() {
        console.log('state.player.choice = ', state.player.choice);
        if (!state.player.choice) {
          state.player.choice = 'noChoice';
          socket.emit('noChoice');
          console.log('Emitted: noChoice');
        }
      });
    });

    socket.on('matchResult', function(resp) {
      state.matchOver = true;
      state.centerMessage = 'Game Over! Headed to lobby...';

      setTimeout(function() {
        $state.go('lobby');
      }, 3000);
    });

    socket.on('forfeitedResults', function(resp) {
      bfTimer.stopTimer();
      state.forfeited = true;
      state.matchOver = true;
      state.roundWinner = resp.winner;
      if (state.player.id === resp.winner) {
        state.centerMessage = 'Opponent Forfeited. Redirecting to lobby...';
      } else {
        state.centerMessage = 'You forfeited the match. Redirecting to lobby...';
      }
      setTimeout(function() {
        $state.go('lobby');
      }, 3000);
    });


    socket.on('matchTerminated', function(resp) {
      if (resp.reason === 'playerDisconnected') {
        bfTimer.stopTimer();
        state.forfeited = true;
        state.matchOver = true;
        state.roundWinner = state.player.id;
        state.centerMessage = 'Opponent Disconnected. Redirecting to lobby...';

        setTimeout(function() {
          $state.go('lobby');
        }, 3000);
      }
    });
  }

}

angular
  .module('app')
  .factory('battlefieldLogicFactory', bfLogicFactoryFunction);

bfLogicFactoryFunction.$inject = [];

function bfLogicFactoryFunction() {

  return {
    winsAgainst: winsAgainst,
    losesAgainst: losesAgainst,
    calcWinRate: calcWinRate
  };

  function winsAgainst(choice) {

    var result;

    switch (choice) {

      /**
       *  rich
       *  Beats: bum, cop
       */
      case 'rich':
        result = ['bum', 'cop'];
        break;

      /**
       *  bum
       *  Beats: jail, tax
       */
      case 'bum':
        result = ['jail', 'tax'];
        break;

      /**
       *  tax
       *  Beats: cop, rich
       */
      case 'tax':
        result = ['cop', 'rich'];
        break;

      /**
       *  cop
       *  Beats: jail, bum
       */
      case 'cop':
        result = ['jail', 'bum'];
        break;

      /**
       *  jail
       *  Beats: rich, tax
       */
      case 'jail':
        result = ['rich', 'tax'];
        break;
    }

    return result;
  }

  function losesAgainst(choice) {

    var result;

    switch (choice) {

      /**
       *  rich
       *  Beats: bum, cop
       */
      case 'rich':
        result = ['jail', 'tax'];
        break;

      /**
       *  bum
       *  Beats: jail, tax
       */
      case 'bum':
        result = ['cop', 'rich'];
        break;

      /**
       *  tax
       *  Beats: cop, rich
       */
      case 'tax':
        result = ['jail', 'bum'];
        break;

      /**
       *  cop
       *  Beats: jail, bum
       */
      case 'cop':
        result = ['rich', 'tax'];
        break;

      /**
       *  jail
       *  Beats: rich, tax
       */
      case 'jail':
        result = ['bum', 'cop'];
        break;
    }

    return result;
  }

  function calcWinRate(w, l) {
    if (w + l === 0) {
      return 'N/A';
    } else {
      var perc = w / (w + l);
      return Math.round((perc + 0.00001) * 100) / 100;
    }
  }
}
angular
  .module('app')
  .factory('battlefieldTimerFactory', bfTimerFactoryFunction);

bfLogicFactoryFunction.$inject = ['$rootScope', '$interval'];

function bfTimerFactoryFunction($rootScope, $interval) {

  var time = 10;
  var tick;

  return {
    getTime: getTime,
    resetTimer: resetTimer,
    startTimer: startTimer,
    stopTimer: stopTimer
  };

  function getTime() {
    return time;
  }

  function resetTimer() {
    time = 10;
    stopTimer();
  }

  function startTimer() {
    // start the timer and resolve promise upon finishing
    return new Promise(function(resolve, reject) {
      if (angular.isDefined(tick)) {
        reject();
      } else {
        tick = $interval(function() {
          if (time > 0) {
            time--;
          } else {
            resolve();
            stopTimer();
          }
        }, 1000);
      }
    });
  }

  function stopTimer() {
    if (angular.isDefined(tick)) {
      $interval.cancel(tick);
      tick = undefined;
    }
  }
}

(function (){
  'use strict';
  angular
    .module('app')
	  .controller('BattlefieldController', BattlefieldController);

  BattlefieldController.$inject = [
    '$scope',
    'battlefieldFactory',
    'battlefieldLogicFactory',
    'battlefieldTimerFactory',
    'socketFactory',
    'soundFactory'
  ];

  function BattlefieldController($scope, battlefieldFactory, battlefieldLogicFactory, battlefieldTimerFactory, socketFactory, soundFactory) {

    // abbreviate
    var vm = this;
    var bf = battlefieldFactory;
    var bfLogic = battlefieldLogicFactory;
    var bfTimer = battlefieldTimerFactory;

    $scope.$on('runAnimations', runAnimations);
    soundFactory.loadSounds();

    // factory getters
    vm.choices = bf.get('choices');
    vm.setChoice = bf.setChoice;
    vm.get = bf.get;
    vm.forfeit = bf.forfeit;
    vm.winsAgainst = bfLogic.winsAgainst;
    vm.losesAgainst = bfLogic.losesAgainst;
    vm.getTime = bfTimer.getTime;

    // View State Elements
    vm.currentHover = '';
    vm.showEmotes = false;
    vm.showSideControls = false;
    vm.player = {
      showOptions: false
    };
    vm.opponent = {
      showOptions: false
    };

    // factory functions
    vm.emoteToggle = function() {
      console.log('running emoteToggle');
      vm.showEmotes = !vm.showEmotes;
    };

    vm.getChoice = function(person) {
      return bf.get(person + 'Choice');
    };

    vm.getHealth = function(person) {
      return bf.get(person + 'Health');
    };

    vm.hover = function(choice) {
      console.log('hi');
      vm.currentHover = choice;
    };

    vm.unhover = function() {
      vm.currentHover = '';
    };

    vm.debugger = function() {
      console.log('opponentChoice = ', vm.get('opponent'));
      console.log('roundWinner = ', vm.get('roundWinner'));
      console.log('playerID = ', vm.get('player').id);
    };

    function runAnimations() {
      vm.player.showOptions = true;
      setTimeout(function() {
        vm.opponent.showOptions = true;
        vm.showSideControls = true;
      }, 500);
    }

    vm.playClick = function() {
      console.log('BattlefieldController playClick');
      soundFactory.playClick();
    };
    vm.playConfirm = function() {
      console.log('BattlefieldController playConfirm');
      soundFactory.playConfirm();
    };
    vm.playDamage = function() {
      console.log('BattlefieldController playDamage');
      soundFactory.playDamage();
    };
    vm.playDeath = function() {
      console.log('BattlefieldController playDeath');
      soundFactory.playDeath();
    };
  } // end of controller function
})();

angular
  .module('app')
  .factory('chatFactory', chatFactory);

  chatFactory.$inject = ['socketFactory', '$state'];

  function chatFactory(socketFactory, $state) {
    var socket = socketFactory;
    var lobby = lobbyFactory;

    var state = {
      userList: [],
      userLeft: null,
      messages: []
    };

    function chatListeners() {

      socket.on('updated user list', function(data) {
        state.userList = data.users;
        console.log('user list: ', data);
      });

      socket.on('message', function(data) {
        set('messages', data);
        console.log('messages: ', state.messages);
      });

      socket.on('user left ', function(data) {
        set('userLeft', data);
        console.log('message: ', message);
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
        console.log('State: ',state);
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
  .factory('lobbyFactory', lobbyFactory);

	lobbyFactory.$inject = ['$state'];

	function lobbyFactory($state) {
		
		var state = {
			joinCodeErrorMessage: '',
			joinCodeErrorMessage2: '',
			joinQueueErrorMessage: '',
			whereTo: null,
			player: {},
			joinCode: '',
			avatar: '',
			tempAvatar: '',
			tempJoinCode: '',
			waiting: false
		};

		return {
			get: get,
			set: set,
			reset: reset
		};

		function reset() {
			console.log('reset was called inside lobby factory');
			state.joinCodeErrorMessage = '';
			state.joinCodeErrorMessage2 = '';
			state.joinQueueErrorMessage = '';
			state.tempAvatar = '';
			state.tempJoinCode = '';
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
  .factory('lobbyListenersFactory', lobbyListenersFactory);

  lobbyListenersFactory.$inject = ['socketFactory', 'lobbyFactory','$state'];

  function lobbyListenersFactory(socketFactory, lobbyFactory, $state) {

    var socket = socketFactory;
    var lobby = lobbyFactory;

    return {
      init: init
    };

    // -----------------------
    // lobby listeners

    function init() {
      if (!socket.isConnected()) {
        console.error('socket is not connected. Can\'t set up lobby listeners');
        return;
      }

      socket.on('player already in queue', userAlreadyInQueue);
      socket.on('added to queue', addedToQueue);
      socket.on('join code invalid', joinCodeInvalid);
      socket.on('join code added', joinCodeAdded);
      socket.on('join code found', joinCodeFound);
      socket.on('join code not found', joinCodeNotFound);
      socket.on('you are', youAre);
    }

    function youAre(resp) {
      // event: 'you are'
      lobby.set('player', resp);
      lobby.set('avatar', resp.avatar);
    }

    function userAlreadyInQueue(resp) {
      // event: 'user already in queue'
      lobby.set('joinQueueErrorMessage', 'User already in queue.');
    }

    function addedToQueue() {
      // event: 'added to queue'
      lobby.set('whereTo', 'queue');
      lobby.set('waiting', true);
      $state.go('waiting');
    }

    function joinCodeInvalid(resp) {
      // event: 'join code invalid'
      lobby.set('joinCodeErrorMessage', resp.message);
    }

    function joinCodeAdded() {
      // event: 'join code added'
      lobby.set('whereTo', 'private');
      lobby.set('joinCode', lobby.get('tempJoinCode'));
      lobby.set('tempJoinCode', '');
      console.log('lobby whereTo = ', lobby.get('whereTo'));
      $state.go('waiting');
    }

    function joinCodeFound() {
      // event: 'join code found'
      lobby.set('whereTo', 'private');
      lobby.set('joinCode', lobby.get('tempJoinCode'));
      lobby.set('tempJoinCode', '');
      $state.go('waiting');
    }

    function joinCodeNotFound(resp) {
      // event: 'join code not found'
      lobby.set('joinCodeErrorMessage2', resp.message);
    }

  }

})();

(function() {
angular
  .module('app')
  .factory('statsFactory', statsFactory);

  statsFactory.$inject = ['$http', 'lobbyFactory'];

  function statsFactory($http, lobbyFactory) {

    var state = {
      leaderboard: false
    };

    Number.prototype.format = function(n, x) {
      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
      return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };

  	return {
      get: get,
      getBoard: getBoard,
      updatePlayerAvatar: updatePlayerAvatar
    };

    function getBoard() {
      getUsersFromDB().then(function(users) {    
        var storage = [];
        for(var i = 0; i < users.data.length; i++){
          var userData = users.data[i];
          userData.mmrNum = userData.mmr;
          userData.mmr = userData.mmr.format();
          storage.push(userData);
        }
        var sorted = storage.sort(function(a, b) {
          return b.mmrNum - a.mmrNum;
        });
        state.leaderboard = sorted;
      });
    }

    function getUsersFromDB() {
      return $http.get('/leaderboard');
    }

    function get(key) {
    	return state[key];
    }

    function updatePlayerAvatar(newAvatar) {
      state.leaderboard.forEach(function(user) {
        if (user.username === lobbyFactory.get('player').username) {
          user.avatar = newAvatar;
          temp = user;
        }
      });
    }

  }

})();

(function () {
'use strict';
 angular
  .module('app')
  .controller('LobbyController', LobbyController);

  LobbyController.$inject = ['$scope', 'lobbyFactory', 'socketFactory', 'authFactory', 'statsFactory', 'soundFactory', 'chatFactory'];

  function LobbyController($scope, lobbyFactory, socketFactory, authFactory, statsFactory, soundFactory, chatFactory) {

    var socket = socketFactory;
    var vm = this;

    soundFactory.loadSounds();
    authFactory.checkAuth();

    vm.get = lobbyFactory.get;
    vm.set = lobbyFactory.set;

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
        lobbyFactory.set('joinCodeErrorMessage2', 'Minimum 3 characters required!');
        return;
      }
      lobbyFactory.set('waiting', true);
      lobbyFactory.set('tempJoinCode', joinCode);
      socket.emit('join private game', {joinCode: joinCode});
    };

    vm.createRoom = function(joinCode) {
      if (joinCode === undefined || joinCode.length < 3) {
        lobbyFactory.set('joinCodeErrorMessage', 'Minimum of 3 characters required.');
        return;
      }
      lobbyFactory.set('waiting', true);
      lobbyFactory.set('tempJoinCode', joinCode);
      socket.emit('create private game', {joinCode: joinCode.toLowerCase()});
    };

    vm.queue = function(message) {
      lobbyFactory.set('waiting', true);
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
      lobbyFactory.set('avatar', obj.avatar);
      socketFactory.emit('update avatar', obj);
      statsFactory.updatePlayerAvatar(obj.avatar);
    };

    vm.setNewAvatar = function(avatar) {
      lobbyFactory.set('tempAvatar', avatar);
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
    .factory('waitingFactory', waitingFactory);

    waitingFactory.$inject = ['socketFactory', '$state', '$timeout'];

    function waitingFactory(socketFactory, $state, $timeout) {
      var emit = socketFactory.emit;
      var on = socketFactory.on;

      var state = {
        player1: null,
        player2: null,
        centerMessage: 'Waiting for opponent',
        waiting: true
      };

      return {
        set: set,
        get: get,
        reset: reset
      };

      function get(key) {
        return state[key];
      }

      function set(key, value) {
        state[key] = value;
      }

      function reset() {
        state.player1 = null;
        state.player2 = null;
        state.centerMessage = 'Waiting for opponent';
        state.waiting = true;
      }

    }

})();

(function (){
  angular
    .module('app')
    .factory('waitingListenersFactory', waitingListenersFactory);

    waitingListenersFactory.$inject = ['socketFactory', 'waitingFactory', '$state', '$timeout'];

    function waitingListenersFactory(socketFactory, waitingFactory, $state, $timeout) {

      var socket = socketFactory;
      var waiting = waitingFactory;

      return {
        init: init
      };

      // -----------------------
      // waiting room listeners

      function init() {
        if (!socket.isConnected()) {
          console.error('socket is not connected. Can\'t set up lobby listeners');
          return;
        }

        socket.on('profile', profile);
        socket.on('match ready', matchReady);
        socket.on('join code to initialize battlefield', joinCodeToInitBf);
      }

      function profile(resp) {
        // event: 'profile'
        waiting.set('player1', resp.p1);
        waiting.set('player2', resp.p2);
        waiting.set('waiting', false);
      }

      function matchReady() {
        // event: 'match ready'
        waiting.set('centerMessage', 'Opponent Found.');

        $timeout(function() {
          waiting.set('centerMessage', 'Entering Battlefield...');
        }, 2500);

        $timeout(function() {
          $state.go('battlefield');
        }, 5000);
      }

      function joinCodeToInitBf(data) {
        // event: join code to initialize battlefield
        socket.emit('initialize battlefield', data);
      }

    }

})();

(function(){
'use strict';
angular
  .module('app')
  .controller('WaitingController', WaitingController);

  WaitingController.$inject = ['$state', 'socketFactory', 'waitingFactory', 'lobbyFactory', 'soundFactory'];

  function WaitingController($state, socketFactory, waitingFactory, lobbyFactory, soundFactory) {

    var vm = this;
    var socket = socketFactory;

    soundFactory.loadSounds();

    var lf = lobbyFactory;
    vm.lfGet = lf.get;
    vm.get = waitingFactory.get;

    vm.showCancelGameForm = false;

    vm.cancelRoom = function(joinCode) {
      socket.emit('cancel private game', {joinCode: joinCode});
      $state.go('lobby');
    };

  }

})();

angular
  .module('app')
  .factory('soundFactory', soundFactory);

  soundFactory.$inject = ['SoundService'];

  function soundFactory(SoundService) {

    var chat = {name: 'chat', src: '../../soundEffects/chat.mp3'};
    var click = {name: 'click', src: '../../soundEffects/click.mp3'};
    var confirm = {name: 'confirm', src: '../../soundEffects/confirm.mp3'};
    var damage = {name: "damage", src: '../../soundEffects/damage.mp3'};
    var death = {name: "death", src: '../../soundEffects/death.mp3'};

    return {
      loadSounds: loadSounds,
      playChat: playChat,
      playClick: playClick,
      playConfirm: playConfirm,
      playDamage: playDamage,
      playDeath: playDeath
    };

    function loadSounds() {
      SoundService.loadSound(chat);
      SoundService.loadSound(click);
      SoundService.loadSound(confirm);
      SoundService.loadSound(damage);
      SoundService.loadSound(death);
    }

    function playChat() {
      console.log('message sent!');
      SoundService.getSound(chat.name).start();
    }

    function playClick() {
      console.log('something clicked!');
      SoundService.getSound(click.name).start();
    }

    function playConfirm() {
      console.log('user confirmed!');
      SoundService.getSound(confirm.name).start();
    }

    function playDamage() {
      console.log('opponent choice took damage!');
      SoundService.getSound(damage.name).start();
    }

    function playDeath() {
      console.log('opponent choice died!');
      SoundService.getSound(death.name).start();
    }

  }

angular
  .module('app')
  .config(config);


function config($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/auth');

	$stateProvider
		.state('auth', {
			url: '/auth',
			templateUrl: '../app/auth/auth.html',
			controller: 'AuthController',
			controllerAs: 'Auth',
			data: {
				bodyClasses: 'auth'
			}
		})
		.state('about', {
			url: '/about',
			templateUrl: '../app/about/about.html',
			// controller: 'AboutController',
			// controllerAs: 'About',
			data: {
				bodyClasses: 'auth'
			}
		})
	  .state('lobby', {
	  	url: '/lobby',
	  	templateUrl: '../app/lobby/lobby.html',
	  	controller: 'LobbyController',
	  	controllerAs: 'Lobby',
	  	data: {
	  		bodyClasses : 'lobby',
	  		auth: true
	  	}
	  })
		.state('waiting', {
			url: '/waiting',
			templateUrl: '../app/waiting/waiting.html',
			controller: 'WaitingController',
			controllerAs: 'Waiting',
			data: {
				bodyClasses: 'waiting',
				auth: true
			}
		})
	  .state('battlefield', {
	  	url: '/battlefield',
	  	templateUrl: '../app/battlefield/battlefield.html',
	  	controller: 'BattlefieldController',
	  	controllerAs: 'Bf',
	  	data: {
	  		bodyClasses: 'battlefield',
	  		auth: true
	  	}
	  });
}
