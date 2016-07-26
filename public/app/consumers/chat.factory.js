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

    return {
      chatListeners: chatListeners,
      get: get,
      set: set
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

  }
