'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var { Url, Counter } = require('./models');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
const promise = mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true});

promise.then(function(db) {
  console.log('connected');
  // Url.remove({}, function() {
  //   console.log('URL Collection removed');
  // });
  // Counter.remove({}, function() {
  //   console.log('Counter collection removed');
  //   // create count on initialization
  //   const counter = new Counter({_id: 'url_count', count: 0});
  //   counter.save(function(err) {
  //     if (err) return console.error(err)
  //     console.log('counter inserted');
  //   });
  // });
});

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: 'false'}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// handle making or getting an existing URL
app.post("/api/shorturl/new/", function (req, res) {
  console.log(req.body);
  const userUrl = req.body.url;
  const urlValidator = /(https?:\/\/)(www|\w+).(\w+)(.\w+)/;
  // if validated
  if (userUrl.match(urlValidator)) {
    // create search query for database
    Url.findOne({full_url: userUrl},function(err, data) {
      // if already existing
      if (data) {
        console.log('data exists', data);
        res.json({
          original_url: userUrl,
          short_url: `https://ve-url-shortener-microservice.glitch.me/api/shorturl/${data._id}`
        });
      // if non existant, create new short URL
      } else {
        let count;
        Counter.findById({_id: 'url_count'}, function(err, urlCounter){
          // increment then return new count
          urlCounter.increment(function(updatedCount){
            count = updatedCount.count;
            const newUrl = new Url({
              _id: count,
              full_url: userUrl
            });
            newUrl.save(function(err, finalUrl){
              if (err) console.error(err);
              res.json({
                original_url: userUrl,
                short_url: `https://ve-url-shortener-microservice.glitch.me/api/shorturl/${finalUrl._id}`
              })
            });
          });
        });
      }
    });  
  // if not validated
  } else {
    res.json({error: "invalid URL"});
  }
});

// handle redirecting a user for a shortcut
app.get("/api/shorturl/:id", function(req, res) {
  const shortUrlId = req.params.id;
  const idValidator = /\d+/;
  // if validated
  if (shortUrlId.match(idValidator)) {
    // search
    Url.findById(shortUrlId, function(err, result) {
      // if found
      if (result) {
        res.redirect(result.full_url);
      } else {
        res.json({
          error: 'no existing url by this Id'
        });
      }
    });
  } else {
      res.json({
        error: 'Invalid ID - must be a digit'
      });
  }
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});