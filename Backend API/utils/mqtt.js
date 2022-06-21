const mqtt = require('mqtt')
require('dotenv').config()

const host = process.env.MQTT_HOST
const port = process.env.MQTT_PORT
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `mqtt://${host}:${port}`

const mqttC = async(data) =>{
    const client = await mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        reconnectPeriod: 1000,
    })

    client.on('connect', function(){
        console.log("Publishing data to MQTT")
        client.publish('Test',JSON.stringify(data)); 
    });
}


module.exports = {
    mqttC
}





// const topic = '/nodejs/mqtt'
// client.on('connect', () => {
//   console.log('Connected')
//   client.subscribe([topic], () => {
//     console.log(`Subscribe to topic '${topic}'`)
//   })
//   client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
//     if (error) {
//       console.error(error)
//     }
//   })
// })

// client.on('message', (topic, payload) => {
//   console.log('Received Message:', topic, payload.toString())
// })


// client.on('connect', function () {
//     client.subscribe('Topic07');
//     console.log('client has subscribed successfully');
// });