var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log('starting scan...');
    noble.startScanning();
  } else {
    console.log('stopping scan because state is ' + noble.state);
    noble.stopScanning();
  }
});

/*noble.on('discover', function(peripheral) {
  console.log('peripheral discovered (' + peripheral.id +
              ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
              ' connectable ' + peripheral.connectable + ',' +
              ' RSSI ' + peripheral.rssi + ':');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));

  var serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:');
    for (var i in serviceData) {
      console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:');
    console.log('\t\t' + peripheral.advertisement.txPowerLevel);
  }

  console.log();
});*/

//var addressToTrack = 'b827eba7c2f0';
//var addressToTrack = 'f8042ec50357';
//var addressToTrack = '5cf938bb3010';
var addressToTrack = 'f8042ec50357';
noble.on('discover', function(peripheral) {
 // if (peripheral.uuid == addressToTrack) {
  	var macAddress = peripheral.uuid;
  	var rssi = peripheral.rssi;
  	var localName = peripheral.advertisement.localName;
  	console.log('found device: ', macAddress, ' ', localName, ' ', rssi);
    console.log('Address: ', peripheral.address);
    console.log('connectable: ', peripheral.connectable);
    console.log('Advertisement: ');
    console.log('\ttxPower: ', peripheral.advertisement.txPowerLevel);
    console.log('\tService UUIDs: ', peripheral.advertisement.serviceUuids);
    console.log('--------------------------');
    console.log('');
  // }
});
/*
peripheral = {
  id: "<id>",
  address: "<BT address">, // Bluetooth Address of device, or 'unknown' if not known
  addressType: "<BT address type>", // Bluetooth Address type (public, random), or 'unknown' if not known
  connectable: <connectable>, // true or false, or undefined if not known
  advertisement: {
    localName: "<name>",
    txPowerLevel: <int>,
    serviceUuids: ["<service UUID>", ...],
    serviceSolicitationUuid: ["<service solicitation UUID>", ...],
    manufacturerData: <Buffer>,
    serviceData: [
        {
            uuid: "<service UUID>"
            data: <Buffer>
        },
        ...
    ]
  },
  rssi: <rssi>
};*/
