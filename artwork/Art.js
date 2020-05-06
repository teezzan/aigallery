var mongoose = require('mongoose');  
var ArtSchema = new mongoose.Schema({  
  name: { type: String, unique: true },
  description: String,
  url: { type: String, unique: true },
  tag: Array,
  dateCreated: {type: Date, default: Date.now()},
  likes: {type: Number, default:0},
  

});
mongoose.model('Artwork', ArtSchema);

module.exports = mongoose.model('Artwork');