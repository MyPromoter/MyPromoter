angular
  .module('MyPromoter')
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
