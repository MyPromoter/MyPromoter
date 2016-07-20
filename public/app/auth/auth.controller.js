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