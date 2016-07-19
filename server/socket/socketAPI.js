// var eventEmitter = require('events');
var firebase = require('../common').firebase;
var consumersListeners = require('../consumers/consumers').consumersListeners;
var chatListeners = require('../chat/chat').chatListeners;

var SocketAPI = function(socket, userModel, token) {

// socket
  this.socket = socket;
  this.socketId = this.socket.id;
  this.events = socket._events;
  this.eventsCount = socket._eventsCount;
  this.listeners = {};
  this.emitters = {};

// user
	userModel = Object.assign({}, userModel);
	this.user = userModel;
  this.profile = this.user;
	this.userId = this.user._doc._id;
	this.token = token;
	this.username = this.user._doc.username;
  this.avatar = this.user._doc.avatar;
};

SocketAPI.prototype.init = function() {
	delete this.user._doc.password;
	consumersListeners(this);
  queueListeners(this);
  privateGameListeners(this);
  chatListeners(this);
	this.emit('*Socket Initialized*');
};

SocketAPI.prototype.on = function(event, cb, auth) {
  if (auth) {
    this.socket.on(event, authenticate.bind(this));
  } else {
    this.socket.on(event, cb);
	  console.log('*ON EVENT: ',event,'*');
  }
	function authenticate(data) {
    firebase.authWithCustomToken(data.token, function(err, authData) {
      if(err) {this.emit('err');}
      cb(data);
    });
  }
	this.listeners[event]=this.socketId;
};

SocketAPI.prototype.once= function (event, cb) {
	this.socket.once(event, cb);
};

SocketAPI.prototype.emit = function(event, data) {
	this.socket.emit(event, data);
	console.log('*EMITTED -> EVENT: ',event,' DATA: ',data, '*');
	this.emitters[event]=this.socketId;
};

SocketAPI.prototype.delayEmit = function(event, data, wait){
	var thisSocket = this;
	setTimeout(function () {
		thisSocket.emit(event, data);
		console.log('*DELAYED EMIT: ', event,'* ','*DATA SENT: ', data,'*');
	});
};

SocketAPI.prototype.getUserModel = function() {
	return this.user._doc;
};

SocketAPI.prototype.getUsername = function() {
	return this.user._doc.username;
};

SocketAPI.prototype.getSocketId = function () {
  return this.socketId;
};

SocketAPI.prototype.err = function(err) {
	this.socket.error(err);
};

SocketAPI.prototype.disconnect = function() {
	this.socket.disconnect();
};


module.exports = {
  SocketAPI: SocketAPI
};