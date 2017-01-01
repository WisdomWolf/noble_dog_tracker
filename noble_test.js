var noble = require('noble');
var http = require('http');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.22');
var seenCount = 0;

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

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
  });
}


noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  }  else  {
    noble.stopScanning();
  }
});

var rikou = /960c.*?60077ad/i;
var testUUID = 'fefd';

noble.on('discover', function(peripheral) {
    var now = new Date().toLocaleString();
    var macAddress = peripheral.uuid;
    var rssi = peripheral.rssi;
    var localName = peripheral.advertisement.localName;
    var serviceUuids = peripheral.advertisement.serviceUuids[0];
    var manufacturerData = peripheral.advertisement.manufacturerData;
    var entity;
    if (rssi > -90) {
      if (rikou.test(serviceUuids)) {
        entity = 'Rikou';
      } else if (serviceUuids == testUUID) {
        entity = 'test';
      }
      console.log(now, ' - found: ', entity, ' ', rssi);
      if (rssi > -80) {
        //client.publish('dogs/rikou', rssi);
        seenCount++;
      } else {
        seenCount = 0;
      }
      if (seenCount > 2) {
        var req = http.request(options, callback).end();
        console.log('!!!http alert sent !!!');
      }
      //console.log('Manufacturer Data: ', manufacturerData);
      // console.log('---');
    }
});
