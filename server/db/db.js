var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/MyPromoter');
console.log('*MongoDB Connected*');

var usersSchema = new Schema({
  /*ADD IN FACEBOOK, TWITTER, IG SPECS*/
  firstName: String,
  lastName: String,
  dob: String/*DATE FORMAT*/,
  driversLicense: String/*UPLOAD IMAGE*/,
  email: String,
  username: String,
  password: String,
  userPic: String/*UPLOAD IMAGE*/,
  deals: [{
      item: {type: String, required: true},
      price: {type: Number, required: true}
  }],
  fastDeals: [{
      item: {type: String, required: true},
      price: {type: Number, required: true}
  }],
  associatedVenue: String,
  associatedArtist: String,
  guestList: [{
    guestName: String,
    guestNumber: Number,
    guestParty: Number,
    venue: String,
    event: String
  }],
  tableList: [{
    guestName: String,
    guestNumber: Number,
    guestParty: Number,
    tablePackage: String,
    event: String,
    venue: String
  }],
  preferredCities: [{cityName: String}],
  location: {lat: {type: Number}, lng: {type: Number}},
  isPromoter: Boolean
});

var User = mongoose.model('user', usersSchema);
module.exports = User;