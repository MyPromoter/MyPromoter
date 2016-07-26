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
      playClick: playClick
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
