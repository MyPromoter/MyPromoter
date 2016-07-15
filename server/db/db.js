var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/MyPromoter');
console.log('MongoDB Connection is Open!');

var usersSchema = new Schema({
  /*ADD IN FB, TWITTER, IG SPECS*/
  firstName: String,
  lastName: String,
  dob: /*DATE FORMAT*/,
  driversLicense: /*IMAGE*/,
  email: String,
  username: String,
  password: String,
  profilePicture: /*IMAGE*/,
  deals: [],
  fastDeals: []
});

var venueSchema = new Schema({
  /*IMPORT DATA FROM YELP API, GOOGLE MAPS API*/
  name: String,
  address: String,
  phoneNumber: Number,
  deals: [],
  fastDeals: []
});

var User = mongoose.model('user', usersSchema);
var Venue = mongoose.model('venue', venueSchema);
module.exports = User;