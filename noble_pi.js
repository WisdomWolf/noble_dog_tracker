var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  }  else  {
    noble.stopScanning();
  }
});

var rikou = /960c.*?60077ad/i;
var testUUID = 'fefd';

//replace localhost with your server's IP;
var socket = require('socket.io-client')('http://192.168.1.179/scanner');

socket.on('connect', function(){
  console.log('connected to server');
});

noble.on('discover', function(peripheral) {
    var macAddress = peripheral.uuid;
    var rssi = peripheral.rssi;
    var localName = peripheral.advertisement.localName;
    var serviceUuids = peripheral.advertisement.serviceUuids[0];
    var manufacturerData = peripheral.advertisement.manufacturerData;
    if (rikou.test(serviceUuids) || serviceUuids == testUUID) {
      socket.emit('deviceData', {mac: peripheral.uuid, rssi:peripheral.rssi});
      // console.log('Manufacturer Data: ', manufacturerData);
      // console.log('---');
    }
});
