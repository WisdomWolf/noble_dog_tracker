var noble = require('noble');
var http = require('http');
var express = require('express')
  , cons = require('consolidate')
  , app = express();

// assign the swig engine to .html files
app.engine('html', cons.hogan);

// set .html as the default extension
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

var io = require('socket.io')(http);
const mqtt = require('mqtt');
var winston = require('winston');
require('winston-loggly-bulk');
const client = mqtt.connect('mqtt://192.168.1.22');
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({ 
      colorize: true,
      level: 'verbose'
    }),
    new (winston.transports.File)({ 
      filename: 'noble_test.log',
      level: 'info'
    }),
    new (winston.transports.Loggly)({
      token: "eb3225ea-6784-4d82-b1df-7e8ab7d17b62",
      subdomain: "wisdomwolf",
      tags: ["Winston-NodeJS"],
      json:true,
      level: 'debug'
    })
  ]
});

var options = {
  host: 'nodered-wisehub.pagekite.me',
  path: '/trigger/rikou_is_outside'
};

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //errors
  response.on('error', function (e) {
    logger.error('Callback Error: ' + e);
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    logger.info(str);
  });
}

app.get('/', function(req, res) {
  var results = dogs.map(function(dog) {
    return '<h1>' + dog.name + ':</h1>' + '</br><b>Last Seen:</b> '
     + dog.lastSeen + '</br><b>Current RSSI:</b> ' + dog.rssi 
     + '</br><b>Current Location: </b>' + dog.location;
  });
  res.send(results.join('</br>'));
});

app.get('/dogs', function(req, res) {
  var template = "<h1>{{name}}</h1><b>RSSI:</b> {{rssi}}";
  var html = Mustache.to_html(template, person);
  res.send(html);
})

app.get('/log', function(req, res) {
  var entity = req.query.entity;
  var location = req.query.location;
  var dog = findNameMatch(dogs, entity);
  if (dog) {
    dog.location = location;
    var locStatus = entity + ' @ ' + location;
    logger.log('info', locStatus, dog);
    res.send('Recording to log: ' + locStatus);
  } else {
    logger.log('error', 'Invalid entity - ' + entity, {'entity': entity});
    res.send(entity + ' is not valid.');
  }
});

app.get('/last_outside', function(req, res) {
  var entity = req.query.entity || req.query.dog;
  var dog = findNameMatch(dogs, entity);
  res.send(dog.lastSeen);
});

app.get('/rikou', function(req, res) {
  var location = req.query.in;
  var dogStatus = 'Rikou is in ' + location;
  rikou.location = location;
  logger.log('info', dogStatus, {'entity': 'Rikou', 'location': location});
  res.send('Logging: ' + dogStatus);
});

var server = app.listen(8081, function() {
  var host = server.address().address
  var port = server.address().port

  logger.debug("Dog Tracker app listening at http://%s:%s", host, port);
});

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
    logger.info('Noble scanner started...');
  }  else  {
    noble.stopScanning();
    logger.info('Noble scanner stopped.');
  }
});

var rikouRegex = /960c.*?60077ad/i;
var testUUID = /fefd/i;
var tester = {'name': 'Tester', 'UUID': testUUID, 
                'recentlySeen': 0, 'location': 'unknown', 
                'rssi': -100};
var rikou = {'name': 'Rikou', 'UUID': rikouRegex,
                'recentlySeen': 0, 'location': 'unknown',
                'rssi': -100};
var dogs = [tester, rikou];
var things = [];

noble.on('discover', function(peripheral) {
    var macAddress = peripheral.uuid;
    var rssi = peripheral.rssi;
    var localName = peripheral.advertisement.localName;
    var serviceUuids = peripheral.advertisement.serviceUuids[0];
    var manufacturerData = peripheral.advertisement.manufacturerData;
    var dog = getIdMatch(dogs, serviceUuids);
    var bleThing = {'macAddress': macAddress, 'localName': localName, 'uuid': serviceUuids};
    if (things.indexOf(bleThing) < 0) {
      things.push(bleThing);
      logger.log('debug', 'new thing found', bleThing);
    }
    if (dog && rssi > -90) {
      dog.rssi = rssi;
      logger.log('verbose', 'found: ' + dog.name + ' ' + rssi, dog);
      if (dog.rssi > -72) {
        //client.publish('dogs/rikou', rssi);
        dog.recentlySeen++;
      } else {
        dog.recentlySeen = 0;
      }
      if (dog.recentlySeen > 2) {
        dog.lastSeen = new Date();
        var req = http.request(options, callback);
        req.end();
        req.on('error', function(e) {
          logger.error('Error in HTTP Request - ' + e);
        });
        logger.warn('!!!http alert sent !!!');
      }
    }
});

function findNameMatch(list, name) {
  return list.find(function(item) {
    if (name.toLowerCase() == item.name.toLowerCase()) {
      return item;
    }
  });
}

function getIdMatches(list, matchString) {
  return list.filter(function(item) {
    if (item.UUID.test(matchString)) {
      return item;
    }
  });
}

function getIdMatch(list, matchString) {
  return list.find(function(item) {
    if (item.UUID.test(matchString)) {
      return item;
    }
  });
}
