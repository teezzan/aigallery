var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, unique: true },
  password: String,
  verified : { type: Boolean, default: false },
  orders : Array,//of objects
  shippingAddress : String,
  resetPasswordToken : String,
  resetPasswordExpires : { type: Date, default: Date.now }
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');