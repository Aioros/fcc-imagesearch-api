var express = require('express');
var request = require('request');
var db = require('./db.js');

var app = express();

app.get('/api/imagesearch/:query', function(req, res) {
  
  var log = {
    term: req.params.query,
    when: (new Date()).toISOString()
  };
  db.get().collection('imagesearches').insert(log);
  
  res.setHeader('Content-Type', 'application/json');
  
  var offset = 0;
  if (req.query.hasOwnProperty("offset"))
    offset = parseInt(req.query.offset);
    
  var url = "https://www.googleapis.com/customsearch/v1?q=" + req.params.query +
            "&cx=003067271293808040717%3Agbkoatw3aci&searchType=image&key=AIzaSyDNO49bzkw6LflUreneIP34NrWaY7u_ws4" +
            "&fields=kind,items(link,snippet,image/thumbnailLink,image/contextLink)" +
            "&start=" + (offset + 1);
  
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.json(body.items.map(function(item) {
        return {
          url: item.link,
          snippet: item.snippet,
          thumbnail: item.image.thumbnailLink,
          context: item.image.contextLink
        };
      })); // Print the json response
    }
  });
  
});

app.get("/api/latest/imagesearch", function(req, res) {
  
  db.get().collection('imagesearches').find({}, {_id: 0}).sort({"when": -1}).limit(10).toArray(function(err, latest) {
    if (err) {
      console.error(err);
    } else {
      res.json(latest);
    }
  });
  
});

db.connect(process.env.MONGOLAB_URI, function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.');
    process.exit(1);
  } else {
    app.listen(process.env.PORT || 8080, function () {
      console.log('App listening');
    });
  }
});
