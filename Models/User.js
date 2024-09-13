const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  count: { type: Number, default: 0 },
  log: [{
    description: String,
    duration: Number,
    date: Date
  }]
});

module.exports = mongoose.model('User', userSchema);
