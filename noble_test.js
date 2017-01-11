var noble = require('noble');
var http = require('http');
var express = require('express');
var app = express();
const mqtt = require('mqtt');
var winston = require('winston');
require('winston-loggly-bulk');
const client = mqtt.connect('mqtt://192.168.1.22');
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({ colorize: true }),
    new (winston.transports.File)({ filename: 'noble_test.log'}),
    new (winston.transports.Loggly)({
      token: "eb3225ea-6784-4d82-b1df-7e8ab7d17b62",
      subdomain: "wisdomwolf",
      tags: ["Winston-NodeJS"],
      json:true
    })
  ]
});
logger.level = 'debug';

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
  res.send('Hello World');
});

app.get('/log', function(req, res) {
  var entity = req.query.entity;
  var location = req.query.location;
  var locStatus = entity + ' @ ' + location;
  logger.debug(locStatus);
  res.send('Recording to log: ' + locStatus);
});

app.get('/rikou', function(req, res) {
  var location = req.query.in;
  var dogStatus = 'Rikou is in ' + location;
  logger.debug(dogStatus);
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

var rikou = /960c.*?60077ad/i;
var testUUID = 'fefd';
var recentlySeen = {};

noble.on('discover', function(peripheral) {
    var macAddress = peripheral.uuid;
    var rssi = peripheral.rssi;
    var localName = peripheral.advertisement.localName;
    var serviceUuids = peripheral.advertisement.serviceUuids[0];
    var manufacturerData = peripheral.advertisement.manufacturerData;
    var entity = null;
    if (rikou.test(serviceUuids)) {
      entity = 'Rikou';
    } else if (serviceUuids == testUUID) {
      entity = 'test';
    }
    if (isNaN(recentlySeen[entity])) {
      recentlySeen[entity] = 0;
    }
    if (entity && rssi > -90) {
      logger.verbose('found: ', entity, ' ', rssi);
      if (rssi > -72) {
        //client.publish('dogs/rikou', rssi);
        recentlySeen[entity]++;
      } else {
        recentlySeen[entity] = 0;
      }
      if (recentlySeen[entity] > 2) {
        var req = http.request(options, callback);
        req.end();
        req.on('error', function(e) {
          logger.error('Error in HTTP Request - ' + e);
        });
        logger.warn('!!!http alert sent !!!');
      }
    }
});
