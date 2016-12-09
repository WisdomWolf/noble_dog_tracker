// garage.js
const mqtt = require('mqtt')  
const client = mqtt.connect('mqtt://broker.hivemq.com')

/**
* The state of the garage, defaults to closed
* Possible states : closed, opening, open, closing
*/

var state = 'closed'

client.on('connect', () => {  
  // Inform controllers that garage is connected
  client.publish('garage/connected', 'true')
})
