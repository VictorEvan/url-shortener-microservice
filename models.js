'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UrlSchema = new Schema({
  _id: {type: Number},
  full_url: String,
  created_at: String
});

// set default to 0 so when incremented is 1
const CountSchema = new Schema({
  _id: {type: String, required: true},
  count: { type: Number, default: 0 }
});

// method on the document
CountSchema.method("increment", function(done) {
  this.count += 1;
  console.log(this);
  this.save(function(err, updatedCount) {
    if (err) console.error(err);
    return done(updatedCount);
  });
});

const Counter = mongoose.model('Counter', CountSchema);

const Url = mongoose.model('Url', UrlSchema);

module.exports.Counter = Counter;
module.exports.Url = Url;