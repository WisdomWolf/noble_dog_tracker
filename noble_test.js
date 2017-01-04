var noble = require('noble');
var http = require('http');
const mqtt = require('mqtt');
var winston = require('winston');
const client = mqtt.connect('mqtt://192.168.1.22');
winston.add(winston.transports.File, { filename: 'noble_test.log'});
winston.level = 'debug';

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
    winston.error('Callback Error: ' + e);
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    winston.info(str);
  });
}

http.createServer(function(request, response) {
  var now = new Date().toLocaleString();
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("data logged");
  response.end();
  winston.warn(now, ' - Dog status change request received');
}).listen(8888);


noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
    winston.info('Noble scanner started...');
  }  else  {
    noble.stopScanning();
    winston.info('Noble scanner stopped.');
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
    if (entity && rssi > -80) {
      winston.verbose(now, ' - found: ', entity, ' ', rssi);
      if (rssi > -75) {
        //client.publish('dogs/rikou', rssi);
        recentlySeen[entity]++;
      } else {
        recentlySeen[entity] = 0;
      }
      if (recentlySeen[entity] > 2) {
        var req = http.request(options, callback);
        req.end();
        req.on('error', function(e) {
          winston.error(e);
        });
        winston.warn(now, '!!!http alert sent !!!');
      }
      //console.log('Manufacturer Data: ', manufacturerData);
      // console.log('---');
    }
});
