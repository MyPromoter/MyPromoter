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
