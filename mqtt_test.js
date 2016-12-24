// garage.js
const mqtt = require('mqtt')  
const client = mqtt.connect('mqtt:/192.168.1.22')

/**
* The state of the garage, defaults to closed
* Possible states : closed, opening, open, closing
*/

var state = 'located'
var connected = true

client.on('connect', () => {  
  // Inform controllers that garage is connected
  client.publish('dogs/connected', 'true');
  sendStateUpdate();
  console.log('published dog status to mqtt broker');
})

function sendStateUpdate() {
  console.log('sending state %s', state);
  client.publish('dogs/rikou', state);
}

function locateRikou() {
  if (connected && state !== 'open') {
    client.publish('dogs/rikou', 'located');
  }
}

setTimeout(() => {
  console.log('locate Rikou');
  locateRikou();
}, 5000);

