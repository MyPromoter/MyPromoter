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
	  });
}
